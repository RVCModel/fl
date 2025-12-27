import crypto from "crypto";

type AlipayConfig = {
  appId: string;
  privateKey: crypto.KeyObject;
  publicKey: crypto.KeyObject;
  gateway: string;
  notifyUrl: string | null;
};

function normalizeKey(key: string) {
  return key.replace(/\\n/g, "\n").trim();
}

function wrapPem(base64Key: string, label: "PRIVATE KEY" | "RSA PRIVATE KEY" | "PUBLIC KEY") {
  const body = base64Key.replace(/\s+/g, "");
  const lines = body.match(/.{1,64}/g)?.join("\n") || body;
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
}

function loadPrivateKey(rawKey: string) {
  const passphrase = process.env.ALIPAY_PRIVATE_KEY_PASSPHRASE;
  const normalized = normalizeKey(rawKey);
  const attempts: Array<crypto.PrivateKeyInput> = [];

  attempts.push({ key: normalized, passphrase });

  if (!/BEGIN [A-Z ]+PRIVATE KEY/.test(normalized)) {
    attempts.push({ key: wrapPem(normalized, "PRIVATE KEY"), passphrase });
    attempts.push({ key: wrapPem(normalized, "RSA PRIVATE KEY"), passphrase });
  }

  for (const input of attempts) {
    try {
      return crypto.createPrivateKey(input);
    } catch {
      // try next
    }
  }
  throw new Error("Unsupported ALIPAY_PRIVATE_KEY format. Use PKCS8/PKCS1 PEM or set ALIPAY_PRIVATE_KEY_PASSPHRASE.");
}

function loadPublicKey(rawKey: string) {
  const normalized = normalizeKey(rawKey);
  const attempts: Array<crypto.PublicKeyInput> = [];
  attempts.push({ key: normalized });
  if (!/BEGIN [A-Z ]+PUBLIC KEY/.test(normalized)) {
    attempts.push({ key: wrapPem(normalized, "PUBLIC KEY") });
  }
  for (const input of attempts) {
    try {
      return crypto.createPublicKey(input);
    } catch {
      // try next
    }
  }
  throw new Error("Unsupported ALIPAY_PUBLIC_KEY format. Use PEM public key.");
}

export function getAlipayConfig(): AlipayConfig {
  const appId = process.env.ALIPAY_APP_ID || "";
  const privateKey = process.env.ALIPAY_PRIVATE_KEY || "";
  const publicKey = process.env.ALIPAY_PUBLIC_KEY || "";
  const gateway = process.env.ALIPAY_GATEWAY || "https://openapi.alipay.com/gateway.do";
  const notifyUrl = process.env.ALIPAY_NOTIFY_URL || null;

  if (!appId || !privateKey || !publicKey) {
    throw new Error("Missing ALIPAY_APP_ID/ALIPAY_PRIVATE_KEY/ALIPAY_PUBLIC_KEY");
  }

  return {
    appId,
    privateKey: loadPrivateKey(privateKey),
    publicKey: loadPublicKey(publicKey),
    gateway,
    notifyUrl,
  };
}

function formatTimestamp(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

function buildSignContent(params: Record<string, string>) {
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([k, v]) => `${k}=${v}`).join("&");
}

export function signAlipayParams(params: Record<string, string>, privateKey: crypto.KeyObject) {
  const signContent = buildSignContent(params);
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signContent, "utf8");
  return signer.sign(privateKey, "base64");
}

export function verifyAlipaySignature(
  params: Record<string, string>,
  signature: string,
  publicKey: crypto.KeyObject,
) {
  const signContent = buildSignContent(params);
  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(signContent, "utf8");
  return verifier.verify(publicKey, signature, "base64");
}

export async function alipayRequest(
  method: string,
  bizContent: Record<string, unknown>,
  options?: { notifyUrl?: string | null },
) {
  const config = getAlipayConfig();
  const params: Record<string, string> = {
    app_id: config.appId,
    method,
    format: "JSON",
    charset: "utf-8",
    sign_type: "RSA2",
    timestamp: formatTimestamp(),
    version: "1.0",
    biz_content: JSON.stringify(bizContent),
  };

  const notifyUrl = options?.notifyUrl ?? config.notifyUrl;
  if (notifyUrl) {
    params.notify_url = notifyUrl;
  }

  params.sign = signAlipayParams(params, config.privateKey);

  const body = new URLSearchParams(params).toString();
  const res = await fetch(config.gateway, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body,
  });
  const raw = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(raw);
  } catch {
    json = null;
  }

  const responseKey = `${method.replace(/\./g, "_")}_response`;
  const data = json ? json[responseKey] : null;

  return { data, raw, json };
}
