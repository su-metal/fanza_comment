import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { defineSecret, defineString } from "firebase-functions/params";
import { onRequest, type Request as FirebaseRequest } from "firebase-functions/v2/https";
import Stripe from "stripe";
import type { Response } from "express";

const APP_ID = "fanza_comment";
const PRODUCT_ID = "kamishine_memo_pro_lifetime";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;
const REGION = "asia-northeast1";
const LICENSE_API_PUBLIC_BASE_URL =
  "https://asia-northeast1-fanza-comment-lic-20260303.cloudfunctions.net/licenseApi";

const STRIPE_API_KEY = defineSecret("STRIPE_API_KEY");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");
const LICENSE_TOKEN_SECRET = defineSecret("LICENSE_TOKEN_SECRET");
const STRIPE_PRICE_ID_JPY = defineString("STRIPE_PRICE_ID_JPY", { default: "" });
const STRIPE_PRICE_ID_USD = defineString("STRIPE_PRICE_ID_USD", { default: "" });
const STRIPE_PRICE_ID = defineString("STRIPE_PRICE_ID", { default: "" });
const ALLOWED_ORIGINS = defineString("ALLOWED_ORIGINS", {
  default: "https://www.youtube.com,https://m.youtube.com",
});

const app = initializeApp();
const db = getFirestore(app);
const entitlements = db.collection("license_entitlements");
const claims = db.collection("license_claims");
const webhookEvents = db.collection("webhook_events");

type JsonRecord = Record<string, unknown>;
type EntitlementStatus = "active" | "revoked" | "refunded";

class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    readonly errorCode: string,
    readonly extra: JsonRecord = {},
  ) {
    super(errorCode);
  }
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function asString(value: unknown): string {
  return String(value ?? "").trim();
}

function json(res: Response, status: number, body: JsonRecord) {
  res.set("Cache-Control", "no-store");
  res.status(status).json(body);
}

function sha256Hex(value: unknown) {
  return createHash("sha256").update(asString(value).toLowerCase()).digest("hex");
}

function normalizeLicenseCode(raw: unknown) {
  return asString(raw).toUpperCase().replace(/\s+/g, "").replace(/[^A-Z0-9-]/g, "");
}

function generateLicenseCode(seed: string) {
  const raw = seed.replace(/[^A-Z0-9]/gi, "").toUpperCase().padEnd(16, "X").slice(0, 16);
  return raw.match(/.{1,4}/g)?.join("-") ?? raw;
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function signToken(payload: JsonRecord, secret: string) {
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = encodeBase64Url(JSON.stringify(payload));
  const unsigned = header + "." + body;
  const signature = createHmac("sha256", secret).update(unsigned).digest("base64url");
  return unsigned + "." + signature;
}

function verifyToken(token: string, secret: string): JsonRecord | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerPart, payloadPart, signaturePart] = parts;
  const unsigned = headerPart + "." + payloadPart;
  const expected = createHmac("sha256", secret).update(unsigned).digest();
  let actual: Buffer;
  try {
    actual = Buffer.from(signaturePart, "base64url");
  } catch {
    return null;
  }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as JsonRecord;
    if (!payload.exp || Date.now() / 1000 > Number(payload.exp)) return null;
    if (payload.app_id !== APP_ID || payload.product !== PRODUCT_ID) return null;
    return payload;
  } catch {
    return null;
  }
}

function licenseCodeIndex(code: string) {
  return db.collection("license_code_indexes").doc(APP_ID).collection("codes").doc(code);
}

function claimDocumentId(licenseId: string, deviceHash: string) {
  return sha256Hex(APP_ID + ":" + licenseId + ":" + deviceHash);
}

async function findLicenseByCode(code: string) {
  const index = await licenseCodeIndex(code).get();
  const licenseId = asString(index.get("license_id"));
  if (!index.exists || !licenseId) return null;
  const snapshot = await entitlements.doc(licenseId).get();
  return snapshot.exists ? { ref: snapshot.ref, data: snapshot.data() as JsonRecord } : null;
}

function resolveAllowedOrigins() {
  const configured = ALLOWED_ORIGINS.value()
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return new Set(["https://www.youtube.com", "https://m.youtube.com", ...configured]);
}

function setCors(req: FirebaseRequest, res: Response) {
  const origin = req.get("origin") || "";
  const extensionOrigin = /^chrome-extension:\/\/[a-p]{32}$/.test(origin);
  if (resolveAllowedOrigins().has(origin) || extensionOrigin) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
  }
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Client-Info");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
}

async function handleActivate(body: JsonRecord, res: Response) {
  const licenseCode = normalizeLicenseCode(body.license_code);
  const emailHash = sha256Hex(body.email);
  const deviceHash = sha256Hex(body.device_fingerprint || "unknown-device");
  const appVersion = asString(body.app_version) || "unknown";
  const tokenSecret = LICENSE_TOKEN_SECRET.value();

  if (!licenseCode || !asString(body.email) || !tokenSecret) {
    throw new ApiError(400, "invalid_payload");
  }
  const found = await findLicenseByCode(licenseCode);
  if (!found) throw new ApiError(404, "license_not_found");

  const now = new Date().toISOString();
  const claimRef = claims.doc(claimDocumentId(asString(found.data.id), deviceHash));
  const activation = await db.runTransaction(async (transaction) => {
    const licenseSnapshot = await transaction.get(found.ref);
    if (!licenseSnapshot.exists) return { error: new ApiError(404, "license_not_found") };
    const license = licenseSnapshot.data() as JsonRecord;
    if (license.app_id !== APP_ID) return { error: new ApiError(404, "license_not_found") };
    if (license.purchase_email_hash !== emailHash) return { error: new ApiError(403, "email_mismatch") };
    if (license.status !== "active") {
      return { error: new ApiError(403, "license_not_active", { status: license.status }) };
    }
    const claimSnapshot = await transaction.get(claimRef);
    const licenseClaims = await transaction.get(claims.where("license_id", "==", license.id));
    transaction.update(found.ref, {
      updated_at: now,
      last_verified_at: now,
      verification_count: FieldValue.increment(1),
    });
    for (const existingClaim of licenseClaims.docs) {
      if (existingClaim.get("app_id") === APP_ID && existingClaim.ref.id !== claimRef.id) {
        transaction.delete(existingClaim.ref);
      }
    }
    transaction.set(
      claimRef,
      {
        app_id: APP_ID,
        license_id: license.id,
        device_fingerprint_hash: deviceHash,
        app_version: appVersion,
        created_at: claimSnapshot.get("created_at") || now,
        last_seen_at: now,
      },
      { merge: true },
    );
    return { error: null };
  });

  if (activation.error) throw activation.error;
  const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const token = signToken(
    { sub: licenseCode, app_id: APP_ID, product: PRODUCT_ID, status: "active", exp: expiresAt },
    tokenSecret,
  );
  json(res, 200, {
    ok: true,
    entitlement: { is_pro: true, status: "active" },
    license_code: licenseCode,
    token,
    expires_at: new Date(expiresAt * 1000).toISOString(),
  });
}

async function handleVerify(body: JsonRecord, res: Response) {
  const token = asString(body.token);
  const tokenSecret = LICENSE_TOKEN_SECRET.value();
  if (!token || !tokenSecret) throw new ApiError(400, "missing_token");
  const decoded = verifyToken(token, tokenSecret);
  if (!decoded || !decoded.sub) throw new ApiError(401, "invalid_token");
  const licenseCode = normalizeLicenseCode(decoded.sub);
  const found = await findLicenseByCode(licenseCode);
  if (!found || found.data.app_id !== APP_ID) throw new ApiError(404, "license_not_found");

  const now = new Date().toISOString();
  await found.ref.update({
    updated_at: now,
    last_verified_at: now,
    verification_count: FieldValue.increment(1),
  });
  const status = asString(found.data.status) || "revoked";
  if (status !== "active") {
    json(res, 200, { ok: true, entitlement: { is_pro: false, status } });
    return;
  }
  json(res, 200, {
    ok: true,
    entitlement: { is_pro: true, status: "active" },
    expires_at: new Date(Number(decoded.exp) * 1000).toISOString(),
  });
}

async function handleCreateCheckoutSession(body: JsonRecord, res: Response) {
  const deviceFingerprint = asString(body.device_fingerprint);
  const email = asString(body.email);
  const checkoutState = asString(body.checkout_state);
  const runtimeLocale = asString(body.runtime_locale).toLowerCase() === "ja" ? "ja" : "en";
  if (!deviceFingerprint) throw new ApiError(400, "missing_device_fingerprint");

  const stripeKey = STRIPE_API_KEY.value();
  if (!stripeKey) throw new ApiError(500, "missing_stripe_key");
  const fallbackPrice = STRIPE_PRICE_ID.value();
  const priceId = runtimeLocale === "ja"
    ? (STRIPE_PRICE_ID_JPY.value() || fallbackPrice)
    : (STRIPE_PRICE_ID_USD.value() || fallbackPrice);
  if (!priceId) {
    throw new ApiError(500, runtimeLocale === "ja" ? "missing_stripe_price_id_jpy" : "missing_stripe_price_id_usd");
  }

  const stateSuffix = checkoutState ? "&checkout_state=" + encodeURIComponent(checkoutState) : "";
  const successUrl = LICENSE_API_PUBLIC_BASE_URL + "?redirect=success" + stateSuffix;
  const cancelUrl = LICENSE_API_PUBLIC_BASE_URL + "?redirect=cancel" + stateSuffix;
  try {
    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email || undefined,
      allow_promotion_codes: true,
      metadata: { device_fingerprint: deviceFingerprint, runtime_locale: runtimeLocale },
    });
    json(res, 200, { ok: true, url: session.url });
  } catch {
    throw new ApiError(502, "stripe_error");
  }
}

async function handleVerifyDevice(body: JsonRecord, res: Response) {
  const fingerprint = asString(body.device_fingerprint);
  if (!fingerprint) throw new ApiError(400, "missing_device_fingerprint");
  const deviceHash = sha256Hex(fingerprint);
  const claimSnapshots = await claims.where("device_fingerprint_hash", "==", deviceHash).get();
  const licenseIds = Array.from(new Set(
    claimSnapshots.docs
      .filter((snapshot) => snapshot.get("app_id") === APP_ID)
      .map((snapshot) => asString(snapshot.get("license_id")))
      .filter(Boolean),
  ));

  for (const licenseId of licenseIds) {
    const snapshot = await entitlements.doc(licenseId).get();
    if (!snapshot.exists) continue;
    const license = snapshot.data() as JsonRecord;
    if (license.app_id === APP_ID && license.status === "active" && license.product === PRODUCT_ID) {
      json(res, 200, { ok: true, is_pro: true, license_code: license.license_code });
      return;
    }
  }
  json(res, 200, {
    ok: true,
    is_pro: false,
    reason: licenseIds.length === 0 ? "no_claim_found" : "no_active_license",
  });
}

function stripeFromSecret() {
  const key = STRIPE_API_KEY.value();
  if (!key) throw new ApiError(500, "missing_stripe_key");
  return new Stripe(key);
}

async function applyStripeEvent(event: Stripe.Event) {
  const eventId = asString(event.id);
  const eventType = asString(event.type);
  if (!eventId || !eventType) throw new ApiError(400, "invalid_event");
  const eventRef = webhookEvents.doc(eventId);
  const now = new Date().toISOString();

  return db.runTransaction(async (transaction) => {
    const eventSnapshot = await transaction.get(eventRef);
    if (eventSnapshot.exists && eventSnapshot.get("processed") === true) return true;

    if (eventType === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = asString(session.customer_details?.email || session.customer_email).toLowerCase();
      const paymentIntentId = asString(session.payment_intent);
      const checkoutSessionId = asString(session.id);
      const licenseCode = normalizeLicenseCode(session.metadata?.license_id)
        || generateLicenseCode(paymentIntentId || checkoutSessionId || randomUUID());
      const deviceFingerprint = asString(session.metadata?.device_fingerprint);
      const codeRef = licenseCodeIndex(licenseCode);
      const codeSnapshot = await transaction.get(codeRef);
      const licenseId = asString(codeSnapshot.get("license_id")) || randomUUID();
      const licenseRef = entitlements.doc(licenseId);
      const licenseSnapshot = codeSnapshot.exists ? await transaction.get(licenseRef) : null;
      const deviceHash = deviceFingerprint ? sha256Hex(deviceFingerprint) : "";
      const claimRef = deviceHash ? claims.doc(claimDocumentId(licenseId, deviceHash)) : null;
      const claimSnapshot = claimRef ? await transaction.get(claimRef) : null;
      const existing = licenseSnapshot?.exists ? licenseSnapshot.data() as JsonRecord : {};

      transaction.set(licenseRef, {
        id: licenseId,
        app_id: APP_ID,
        license_code: licenseCode,
        product: PRODUCT_ID,
        status: "active" satisfies EntitlementStatus,
        purchase_email_hash: sha256Hex(email),
        stripe_checkout_session_id: checkoutSessionId || null,
        stripe_payment_intent_id: paymentIntentId || null,
        last_verified_at: existing.last_verified_at || null,
        verification_count: Number(existing.verification_count || 0),
        created_at: existing.created_at || now,
        updated_at: now,
      });
      transaction.set(codeRef, { app_id: APP_ID, license_id: licenseId, updated_at: now });
      if (claimRef) {
        transaction.set(claimRef, {
          app_id: APP_ID,
          license_id: licenseId,
          device_fingerprint_hash: deviceHash,
          app_version: "auto-activated-from-checkout",
          created_at: claimSnapshot?.get("created_at") || now,
          last_seen_at: now,
        });
      }
    } else if (
      eventType === "charge.refunded"
      || eventType === "checkout.session.expired"
      || eventType === "checkout.session.async_payment_failed"
    ) {
      const object = event.data.object as Stripe.Charge | Stripe.Checkout.Session;
      const paymentIntentId = "payment_intent" in object ? asString(object.payment_intent) : "";
      const checkoutSessionId = "id" in object && eventType !== "charge.refunded" ? asString(object.id) : "";
      const field = paymentIntentId ? "stripe_payment_intent_id" : "stripe_checkout_session_id";
      const reference = paymentIntentId || checkoutSessionId;
      if (reference) {
        const matches = await transaction.get(
          entitlements.where(field, "==", reference).limit(20),
        );
        const status: EntitlementStatus = eventType === "charge.refunded" ? "refunded" : "revoked";
        for (const snapshot of matches.docs) {
          if (snapshot.get("app_id") === APP_ID) {
            transaction.update(snapshot.ref, { status, updated_at: now });
          }
        }
      }
    }

    transaction.set(eventRef, {
      event_id: eventId,
      event_type: eventType,
      processed: true,
      received_at: eventSnapshot.get("received_at") || now,
      processed_at: now,
    });
    return false;
  });
}

async function handleStripeWebhook(req: FirebaseRequest, res: Response) {
  const webhookSecret = STRIPE_WEBHOOK_SECRET.value();
  const signature = req.get("stripe-signature") || "";
  if (!webhookSecret || !signature) throw new ApiError(400, "missing_signature");

  let event: Stripe.Event;
  try {
    event = stripeFromSecret().webhooks.constructEvent(req.rawBody, signature, webhookSecret);
  } catch {
    throw new ApiError(400, "invalid_webhook_signature");
  }

  const duplicate = await applyStripeEvent(event);
  json(res, 200, duplicate ? { ok: true, duplicate: true } : { ok: true });
}

function getCheckoutRedirect(redirect: string, checkoutState: string) {
  const url = new URL("https://www.youtube.com/");
  url.searchParams.set("fanza_checkout", redirect);
  if (checkoutState) url.searchParams.set("checkout_state", checkoutState);
  return url.toString();
}

function resolveLegacyAction(action: string) {
  switch (action.toLowerCase()) {
    case "activate": return "/activate";
    case "verify": return "/verify";
    case "create_checkout_session": return "/create-checkout-session";
    case "verify_device": return "/verify-device";
    default: return "";
  }
}

export const licenseApi = onRequest(
  {
    region: REGION,
    secrets: [STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET, LICENSE_TOKEN_SECRET],
    maxInstances: 10,
  },
  async (req, res) => {
    setCors(req, res);
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }

    const path = (req.path || "/").toLowerCase();
    if (req.method === "GET") {
      const redirect = asString(req.query.redirect);
      if (redirect === "success" || redirect === "cancel") {
        res.redirect(303, getCheckoutRedirect(redirect, asString(req.query.checkout_state)));
        return;
      }
      if (path.endsWith("/payment-success")) {
        res.redirect(303, getCheckoutRedirect("success", ""));
        return;
      }
      if (path.endsWith("/payment-cancel")) {
        res.redirect(303, getCheckoutRedirect("cancel", ""));
        return;
      }
      res.status(404).send("Not Found");
      return;
    }
    if (req.method !== "POST") {
      json(res, 405, { ok: false, error: "method_not_allowed" });
      return;
    }

    const body = asRecord(req.body);
    const actionPath = path === "/" ? resolveLegacyAction(asString(body.action)) : "";
    const route = actionPath || path;
    try {
      if (route.endsWith("/stripe-webhook")) {
        await handleStripeWebhook(req, res);
        return;
      }
      if (route.endsWith("/activate")) {
        await handleActivate(body, res);
        return;
      }
      if (route.endsWith("/verify")) {
        await handleVerify(body, res);
        return;
      }
      if (route.endsWith("/create-checkout-session")) {
        await handleCreateCheckoutSession(body, res);
        return;
      }
      if (route.endsWith("/verify-device")) {
        await handleVerifyDevice(body, res);
        return;
      }
      json(res, 404, { ok: false, error: "not_found" });
    } catch (error) {
      if (error instanceof ApiError) {
        json(res, error.statusCode, { ok: false, error: error.errorCode, ...error.extra });
        return;
      }
      console.error("[License API] Request failed", {
        method: req.method,
        path: route,
        error: error instanceof Error ? error.name : "unknown",
      });
      json(res, 500, { ok: false, error: "internal_error" });
    }
  },
);
