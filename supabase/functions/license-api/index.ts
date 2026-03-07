import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";


const PRODUCT_ID = "kamishine_memo_pro_lifetime";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const APP_ID = "fanza_comment";
const LICENSE_API_PUBLIC_BASE_URL = "https://wzinimxikcihdqqdvppa.supabase.co/functions/v1/license-api";
const DEFAULT_ALLOWED_ORIGINS = [
  "https://www.youtube.com",
  "https://m.youtube.com",
];

function jsonResponse(status: number, body: unknown, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

function parseAllowedOrigins(raw: string | undefined) {
  return String(raw || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function resolveAllowedOrigins() {
  const configured = parseAllowedOrigins(Deno.env.get("ALLOWED_ORIGINS"));
  return Array.from(new Set([...configured, ...DEFAULT_ALLOWED_ORIGINS]));
}

function buildCorsHeaders(req: Request) {
  const allowedOrigins = resolveAllowedOrigins();
  const origin = req.headers.get("origin") || "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }
  return headers;
}

function normalizeLicenseCode(raw: unknown) {
  return String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9-]/g, "");
}

function generateLicenseCode(seed: string) {
  const raw = seed.replace(/[^A-Z0-9]/gi, "").toUpperCase().padEnd(16, "X").slice(0, 16);
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}`;
}

async function sha256Hex(value: unknown) {
  const input = String(value || "").trim().toLowerCase();
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function toBase64Url(input: string) {
  const bytes = new TextEncoder().encode(input);
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
}

async function hmacSha256Base64Url(secret: string, payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const base64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmacSha256Hex(secret: string, payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function signToken(payload: Record<string, unknown>, secret: string) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = await hmacSha256Base64Url(secret, `${encodedHeader}.${encodedPayload}`);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function verifyToken(token: string, secret: string) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const expected = await hmacSha256Base64Url(secret, `${header}.${payload}`);
  if (signature !== expected) return null;
  const decoded = JSON.parse(fromBase64Url(payload));
  if (!decoded.exp || Date.now() / 1000 > Number(decoded.exp)) return null;
  return decoded;
}

function parseStripeSignature(header: string) {
  const parts = header.split(",").map((s) => s.trim());
  let timestamp = "";
  const signatures: string[] = [];
  for (const part of parts) {
    const [k, v] = part.split("=");
    if (!k || !v) continue;
    if (k === "t") timestamp = v;
    if (k === "v1") signatures.push(v);
  }
  return { timestamp, signatures };
}

async function verifyStripeWebhookSignature(rawPayload: string, header: string, secret: string) {
  const parsed = parseStripeSignature(header);
  if (!parsed.timestamp || parsed.signatures.length === 0) return false;
  const signedPayload = `${parsed.timestamp}.${rawPayload}`;
  const expected = await hmacSha256Hex(secret, signedPayload);
  return parsed.signatures.map((s) => s.toLowerCase()).includes(expected.toLowerCase());
}

function getSupabaseAdminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("missing_supabase_env");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function handleActivate(req: Request, corsHeaders: Record<string, string>) {
  const body = await req.json().catch(() => ({}));
  const licenseCode = normalizeLicenseCode(body.license_code);
  const emailHash = await sha256Hex(body.email || "");
  const deviceHash = await sha256Hex(body.device_fingerprint || "unknown-device");
  const appVersion = String(body.app_version || "unknown");
  const tokenSecret = Deno.env.get("LICENSE_TOKEN_SECRET") || "";

  if (!licenseCode || !emailHash || !tokenSecret) {
    return jsonResponse(400, { ok: false, error: "invalid_payload" }, corsHeaders);
  }

  const supabase = getSupabaseAdminClient();
  const { data: license, error } = await supabase
    .from("license_entitlements")
    .select("*")
    .eq("app_id", APP_ID)
    .eq("license_code", licenseCode)
    .maybeSingle();

  if (error) return jsonResponse(500, { ok: false, error: "db_error" }, corsHeaders);
  if (!license) return jsonResponse(404, { ok: false, error: "license_not_found" }, corsHeaders);
  if (license.purchase_email_hash !== emailHash) {
    return jsonResponse(403, { ok: false, error: "email_mismatch" }, corsHeaders);
  }
  if (license.status !== "active") {
    return jsonResponse(403, { ok: false, error: "license_not_active", status: license.status }, corsHeaders);
  }

  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const token = await signToken(
    { sub: licenseCode, app_id: APP_ID, product: PRODUCT_ID, status: "active", exp },
    tokenSecret
  );
  const nowIso = new Date().toISOString();

  await Promise.all([
    supabase
      .from("license_entitlements")
      .update({
        updated_at: nowIso,
        last_verified_at: nowIso,
        verification_count: Number(license.verification_count || 0) + 1,
      })
      .eq("id", license.id),
    supabase.from("license_claims").upsert(
      {
        app_id: APP_ID,
        license_id: license.id,
        device_fingerprint_hash: deviceHash,
        app_version: appVersion,
        last_seen_at: nowIso,
      },
      { onConflict: "app_id,license_id,device_fingerprint_hash" }
    ),
  ]);

  return jsonResponse(
    200,
    {
      ok: true,
      entitlement: { is_pro: true, status: "active" },
      token,
      expires_at: new Date(exp * 1000).toISOString(),
    },
    corsHeaders
  );
}

async function handleVerify(req: Request, corsHeaders: Record<string, string>) {
  const body = await req.json().catch(() => ({}));
  const token = String(body.token || "");
  const tokenSecret = Deno.env.get("LICENSE_TOKEN_SECRET") || "";
  if (!token || !tokenSecret) {
    return jsonResponse(400, { ok: false, error: "missing_token" }, corsHeaders);
  }

  const decoded = await verifyToken(token, tokenSecret);
  if (!decoded || !decoded.sub) {
    return jsonResponse(401, { ok: false, error: "invalid_token" }, corsHeaders);
  }

  const licenseCode = normalizeLicenseCode(decoded.sub);
  const supabase = getSupabaseAdminClient();
  const { data: license, error } = await supabase
    .from("license_entitlements")
    .select("*")
    .eq("app_id", APP_ID)
    .eq("license_code", licenseCode)
    .maybeSingle();

  if (error) return jsonResponse(500, { ok: false, error: "db_error" }, corsHeaders);
  if (!license) return jsonResponse(404, { ok: false, error: "license_not_found" }, corsHeaders);

  const nowIso = new Date().toISOString();
  await supabase
    .from("license_entitlements")
    .update({
      updated_at: nowIso,
      last_verified_at: nowIso,
      verification_count: Number(license.verification_count || 0) + 1,
    })
    .eq("id", license.id);

  if (license.status !== "active") {
    return jsonResponse(
      200,
      { ok: true, entitlement: { is_pro: false, status: license.status || "revoked" } },
      corsHeaders
    );
  }

  return jsonResponse(
    200,
    {
      ok: true,
      entitlement: { is_pro: true, status: "active" },
      expires_at: new Date(Number(decoded.exp) * 1000).toISOString(),
    },
    corsHeaders
  );
}

async function handleCreateCheckoutSession(req: Request, corsHeaders: Record<string, string>) {
  const body = await req.json().catch(() => ({}));
  const deviceFingerprint = String(body.device_fingerprint || "");
  const email = String(body.email || "");

  if (!deviceFingerprint) {
    return jsonResponse(400, { ok: false, error: "missing_device_fingerprint" }, corsHeaders);
  }

  const stripeKey = Deno.env.get("STRIPE_API_KEY") || "";
  if (!stripeKey) {
    return jsonResponse(500, { ok: false, error: "missing_stripe_key" }, corsHeaders);
  }

  const stripe = new Stripe(stripeKey);

  // 固定URLを使ってStripeの戻り先を安定化させる
  // (req.url 依存だと環境差分で不正パスになるケースがある)
  const successUrl = `${LICENSE_API_PUBLIC_BASE_URL}?redirect=success`;
  const cancelUrl = `${LICENSE_API_PUBLIC_BASE_URL}?redirect=cancel`;
  
  console.log(`[CreateCheckout] successUrl: ${successUrl}`);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1T8IEHPa0VuZQWboXMu2EuXf",
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email ? email : undefined,
      metadata: {
        device_fingerprint: deviceFingerprint,
      },
    });

    return jsonResponse(200, { ok: true, url: session.url }, corsHeaders);
  } catch (err: any) {
    return jsonResponse(500, { ok: false, error: "stripe_error", message: err.message }, corsHeaders);
  }
}

async function handleVerifyDevice(req: Request, corsHeaders: Record<string, string>) {
  const body = await req.json().catch(() => ({}));
  const deviceFingerprint = String(body.device_fingerprint || "");
  if (!deviceFingerprint) {
    return jsonResponse(400, { ok: false, error: "missing_device_fingerprint" }, corsHeaders);
  }

  const deviceHash = await sha256Hex(deviceFingerprint);
  const supabase = getSupabaseAdminClient();

  // Find claim
  const { data: claims, error: claimError } = await supabase
    .from("license_claims")
    .select("license_id")
    .eq("app_id", APP_ID)
    .eq("device_fingerprint_hash", deviceHash);

  if (claimError || !claims || claims.length === 0) {
    return jsonResponse(200, { ok: true, is_pro: false, reason: "no_claim_found" }, corsHeaders);
  }

  // Check the first valid license
  for (const claim of claims) {
    const { data: license } = await supabase
      .from("license_entitlements")
      .select("status, product")
      .eq("id", claim.license_id)
      .maybeSingle();

    if (license && license.status === "active" && license.product === PRODUCT_ID) {
      return jsonResponse(200, { ok: true, is_pro: true }, corsHeaders);
    }
  }

  return jsonResponse(200, { ok: true, is_pro: false, reason: "no_active_license" }, corsHeaders);
}

async function handleStripeWebhook(req: Request, corsHeaders: Record<string, string>) {
  const stripeSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
  const sig = req.headers.get("stripe-signature") || "";
  if (!stripeSecret || !sig) {
    return jsonResponse(400, { ok: false, error: "missing_signature" }, corsHeaders);
  }

  const rawPayload = await req.text();
  const isValid = await verifyStripeWebhookSignature(rawPayload, sig, stripeSecret);
  console.log(`[Stripe Webhook] sig: ${sig.slice(0, 10)}..., isValid: ${isValid}`);
  if (!isValid) {
    return jsonResponse(400, { ok: false, error: "invalid_webhook_signature" }, corsHeaders);
  }

  const event = JSON.parse(rawPayload);
  const eventId = String(event.id || "");
  const eventType = String(event.type || "");
  console.log(`[Stripe Webhook] eventId: ${eventId}, eventType: ${eventType}`);
  if (!eventId || !eventType) {
    return jsonResponse(400, { ok: false, error: "invalid_event" }, corsHeaders);
  }

  const supabase = getSupabaseAdminClient();
  const { data: already } = await supabase
    .from("webhook_events")
    .select("event_id, processed")
    .eq("event_id", eventId)
    .maybeSingle();

  if (already?.processed) {
    console.log(`[Stripe Webhook] Event ${eventId} already processed.`);
    return jsonResponse(200, { ok: true, duplicate: true }, corsHeaders);
  }

  const nowIso = new Date().toISOString();
  await supabase.from("webhook_events").upsert(
    {
      event_id: eventId,
      event_type: eventType,
      processed: false,
      received_at: nowIso,
    },
    { onConflict: "event_id" }
  );

  if (eventType === "checkout.session.completed") {
    const session = event.data?.object || {};
    const email = String(session.customer_details?.email || session.customer_email || "")
      .trim()
      .toLowerCase();
    const paymentIntentId = String(session.payment_intent || "");
    const checkoutSessionId = String(session.id || "");
    const metadataLicense = normalizeLicenseCode(session.metadata?.license_id || "");
    const deviceFingerprint = String(session.metadata?.device_fingerprint || "");
    console.log(`[Stripe Webhook] session: ${checkoutSessionId}, pi: ${paymentIntentId}, email: ${email}, fp: ${deviceFingerprint}`);
    
    const licenseCode =
      metadataLicense ||
      generateLicenseCode(paymentIntentId || checkoutSessionId || crypto.randomUUID().replaceAll("-", ""));

    const { data: licenseRow, error: insertError } = await supabase.from("license_entitlements").upsert(
      {
        app_id: APP_ID,
        license_code: licenseCode,
        product: PRODUCT_ID,
        status: "active",
        purchase_email_hash: await sha256Hex(email),
        stripe_checkout_session_id: checkoutSessionId || null,
        stripe_payment_intent_id: paymentIntentId || null,
        updated_at: nowIso,
      },
      { onConflict: "license_code" }
    ).select().single();

    if (insertError) {
      console.error(`[Stripe Webhook] Error upserting license:`, insertError);
    } else {
      console.log(`[Stripe Webhook] License upserted: ${licenseRow?.id}, code: ${licenseCode}`);
    }

    if (licenseRow && deviceFingerprint) {
      const deviceHash = await sha256Hex(deviceFingerprint);
      await supabase.from("license_claims").upsert(
        {
          app_id: APP_ID,
          license_id: licenseRow.id,
          device_fingerprint_hash: deviceHash,
          app_version: "auto-activated-from-checkout",
          last_seen_at: nowIso,
        },
        { onConflict: "app_id,license_id,device_fingerprint_hash" }
      );
      }
  } else if (eventType === "charge.refunded") {
    const charge = event.data?.object || {};
    const paymentIntentId = String(charge.payment_intent || "");
    if (paymentIntentId) {
      await supabase
        .from("license_entitlements")
        .update({ status: "refunded", updated_at: nowIso })
        .eq("app_id", APP_ID)
        .eq("stripe_payment_intent_id", paymentIntentId);
    }
  }

  await supabase
    .from("webhook_events")
    .update({ processed: true, processed_at: nowIso })
    .eq("event_id", eventId);

  return jsonResponse(200, { ok: true }, corsHeaders);
}

function handlePaymentSuccess() {
  // Supabase Function Gateway serves GET as text/plain+sandbox, so HTML close scripts won't run.
  // Redirect to a normal page and let extension-side polling close the checkout window.
  return Response.redirect("https://www.youtube.com/?fanza_checkout=success", 303);
}

function handlePaymentCancel() {
  return Response.redirect("https://www.youtube.com/?fanza_checkout=cancel", 303);
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  const url = new URL(req.url);
  const path = url.pathname.toLowerCase();
  const redirect = url.searchParams.get("redirect");
  
  console.log(`[Request] ${req.method} ${path}${url.search}`);

  // 1. GET リダイレクト用エンドポイント (Stripeから戻ってくる)
  // クエリパラメータ方式 (?redirect=success) 
  if (req.method === "GET") {
    if (redirect === "success") return handlePaymentSuccess();
    if (redirect === "cancel") return handlePaymentCancel();
    // パス方式も念のため残す
    if (path.endsWith("/payment-success")) return handlePaymentSuccess();
    if (path.endsWith("/payment-cancel")) return handlePaymentCancel();
    
    // それ以外のGETリクエストは404または不正パスとして弾かれないように案内を返す
    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }

  // 2. CORS OPTIONS 対応
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 3. POST 以外はエラー (Webhookも他のAPIもPOSTのみ)
  if (req.method !== "POST") {
    return jsonResponse(405, { ok: false, error: "method_not_allowed" }, corsHeaders);
  }

  // 4. パスベースのルーティング
  if (path.endsWith("/activate")) return handleActivate(req, corsHeaders);
  if (path.endsWith("/verify")) return handleVerify(req, corsHeaders);
  if (path.endsWith("/stripe-webhook")) return handleStripeWebhook(req, corsHeaders);
  if (path.endsWith("/create-checkout-session")) return handleCreateCheckoutSession(req, corsHeaders);
  if (path.endsWith("/verify-device")) return handleVerifyDevice(req, corsHeaders);

  // 5. 後方互換性: Actionベース (JSON body 内の action)
  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "").toLowerCase();
    
    if (action === "activate") return handleActivate(new Request(req.url, { method: "POST", body: JSON.stringify(body) }), corsHeaders);
    if (action === "verify") return handleVerify(new Request(req.url, { method: "POST", body: JSON.stringify(body) }), corsHeaders);
    if (action === "create_checkout_session") return handleCreateCheckoutSession(new Request(req.url, { method: "POST", body: JSON.stringify(body) }), corsHeaders);
    if (action === "verify_device") return handleVerifyDevice(new Request(req.url, { method: "POST", body: JSON.stringify(body) }), corsHeaders);
  } catch (e) {
    console.error("[Router] Body parse error:", e);
  }

  return jsonResponse(404, { ok: false, error: "not_found", path }, corsHeaders);
});
