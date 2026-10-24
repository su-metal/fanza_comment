import { createHash } from "node:crypto";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const APP_ID = "fanza_comment";
const TARGET_PROJECT_ID = "fanza-comment-lic-20260303";
const PAGE_SIZE = 1000;
const PREFLIGHT_CHUNK_SIZE = 300;
const WRITE_CHUNK_SIZE = 400;

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function sha256Hex(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

async function fetchTableRows(supabaseUrl, serviceRoleKey, table, { appScoped, orderBy }) {
  const rows = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const query = new URLSearchParams({
      select: "*",
      order: `${orderBy}.asc`,
      limit: String(PAGE_SIZE),
      offset: String(offset),
    });
    if (appScoped) query.set("app_id", `eq.${APP_ID}`);

    const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Accept-Profile": "public",
      },
    });
    if (!response.ok) {
      throw new Error(`Supabase read failed for ${table}: HTTP ${response.status}`);
    }
    const page = await response.json();
    if (!Array.isArray(page)) throw new Error(`Unexpected response for ${table}`);
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

function makeDocumentPlans(db, { entitlements, claims, webhookEvents }) {
  const plans = [];
  for (const row of entitlements) {
    const id = String(row.id || "").trim();
    const licenseCode = String(row.license_code || "").trim();
    if (!id || !licenseCode || row.app_id !== APP_ID) {
      throw new Error("An entitlement row is missing required identifiers or app scope.");
    }
    if (!/^[A-Z0-9-]+$/.test(licenseCode)) {
      throw new Error("An entitlement contains a license code that cannot be used as a Firestore document ID.");
    }
    plans.push({
      label: "license_entitlements",
      ref: db.collection("license_entitlements").doc(id),
      data: row,
    });
    plans.push({
      label: "license_code_indexes",
      ref: db.collection("license_code_indexes").doc(APP_ID).collection("codes").doc(licenseCode),
      data: {
        app_id: APP_ID,
        license_id: id,
        updated_at: row.updated_at || row.created_at || null,
      },
    });
  }

  for (const row of claims) {
    const licenseId = String(row.license_id || "").trim();
    const deviceHash = String(row.device_fingerprint_hash || "").trim();
    if (!licenseId || !deviceHash || row.app_id !== APP_ID) {
      throw new Error("A claim row is missing required identifiers or app scope.");
    }
    const id = sha256Hex(`${APP_ID}:${licenseId}:${deviceHash}`.toLowerCase());
    plans.push({
      label: "license_claims",
      ref: db.collection("license_claims").doc(id),
      data: row,
    });
  }

  for (const row of webhookEvents) {
    const eventId = String(row.event_id || "").trim();
    if (!eventId || eventId.includes("/")) {
      throw new Error("A webhook event contains an invalid Firestore document ID.");
    }
    plans.push({
      label: "webhook_events",
      ref: db.collection("webhook_events").doc(eventId),
      data: row,
    });
  }
  return plans;
}

async function preflight(db, plans) {
  let existing = 0;
  const conflicts = new Map();
  for (let offset = 0; offset < plans.length; offset += PREFLIGHT_CHUNK_SIZE) {
    const chunk = plans.slice(offset, offset + PREFLIGHT_CHUNK_SIZE);
    const snapshots = await db.getAll(...chunk.map((plan) => plan.ref));
    snapshots.forEach((snapshot, index) => {
      if (!snapshot.exists) return;
      existing += 1;
      const plan = chunk[index];
      if (canonicalJson(snapshot.data()) !== canonicalJson(plan.data)) {
        conflicts.set(plan.label, (conflicts.get(plan.label) || 0) + 1);
      }
    });
  }
  if (conflicts.size) {
    const summary = [...conflicts.entries()].map(([label, count]) => `${label}: ${count}`).join(", ");
    throw new Error(`Firestore contains conflicting documents (${summary}). No writes were made.`);
  }
  return { existing, toCreate: plans.length - existing };
}

async function applyPlans(db, plans) {
  let created = 0;
  for (let offset = 0; offset < plans.length; offset += WRITE_CHUNK_SIZE) {
    const chunk = plans.slice(offset, offset + WRITE_CHUNK_SIZE);
    const refs = chunk.map((plan) => plan.ref);
    const snapshots = await db.getAll(...refs);
    const pending = [];
    for (const [index, snapshot] of snapshots.entries()) {
      const plan = chunk[index];
      if (!snapshot.exists) {
        pending.push(plan);
      } else if (canonicalJson(snapshot.data()) !== canonicalJson(plan.data)) {
        throw new Error(`Firestore changed during migration (${plan.label}). Rerun the dry-run before continuing.`);
      }
    }
    if (!pending.length) continue;

    const batch = db.batch();
    for (const plan of pending) batch.create(plan.ref, plan.data);
    await batch.commit();
    created += pending.length;
  }
  return created;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  for (const arg of args) {
    if (arg !== "--dry-run" && arg !== "--apply") throw new Error(`Unknown argument: ${arg}`);
  }
  if (args.has("--dry-run") && args.has("--apply")) {
    throw new Error("Use either --dry-run or --apply, not both.");
  }
  const apply = args.has("--apply");
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim() || TARGET_PROJECT_ID;
  if (projectId !== TARGET_PROJECT_ID) {
    throw new Error(`Refusing to use unexpected Firebase project: ${projectId}`);
  }

  const supabaseUrl = requiredEnv("SUPABASE_URL").replace(/\/+$/, "");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const firebaseApp = initializeApp({ projectId });
  const db = getFirestore(firebaseApp);

  const [entitlements, claims, webhookEvents] = await Promise.all([
    fetchTableRows(supabaseUrl, serviceRoleKey, "license_entitlements", { appScoped: true, orderBy: "id" }),
    fetchTableRows(supabaseUrl, serviceRoleKey, "license_claims", { appScoped: true, orderBy: "id" }),
    fetchTableRows(supabaseUrl, serviceRoleKey, "webhook_events", { appScoped: false, orderBy: "event_id" }),
  ]);
  const plans = makeDocumentPlans(db, { entitlements, claims, webhookEvents });
  const summary = await preflight(db, plans);

  if (!apply) {
    console.log(JSON.stringify({
      mode: "dry-run",
      projectId,
      sourceRows: {
        license_entitlements: entitlements.length,
        license_claims: claims.length,
        webhook_events: webhookEvents.length,
      },
      firestoreDocuments: {
        planned: plans.length,
        alreadyIdentical: summary.existing,
        toCreate: summary.toCreate,
      },
      writesPerformed: 0,
    }, null, 2));
    console.log("No Firestore documents were written. Add --apply only after reviewing this summary.");
    return;
  }

  const created = await applyPlans(db, plans);
  console.log(JSON.stringify({
    mode: "apply",
    projectId,
    sourceRows: {
      license_entitlements: entitlements.length,
      license_claims: claims.length,
      webhook_events: webhookEvents.length,
    },
    firestoreDocuments: {
      planned: plans.length,
      alreadyIdentical: summary.existing,
      created,
    },
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Migration failed.");
  process.exitCode = 1;
});
