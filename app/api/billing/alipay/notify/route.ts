import { verifyAlipaySignature, getAlipayConfig } from "@/lib/alipay";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const PRODUCT_ID = "alipay_monthly";
const SUBSCRIPTION_DAYS = 30;

function isPaidStatus(status?: string | null) {
  return status === "TRADE_SUCCESS" || status === "TRADE_FINISHED";
}

function nextExpiry(existing: string | null) {
  const base = existing ? new Date(existing) : null;
  const now = new Date();
  const start = base && base.getTime() > now.getTime() ? base : now;
  const result = new Date(start);
  result.setUTCDate(result.getUTCDate() + SUBSCRIPTION_DAYS);
  return result.toISOString();
}

export async function POST(req: Request) {
  const form = await req.formData();
  const payload: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    payload[key] = String(value);
  }

  const signature = payload.sign || "";
  const signType = payload.sign_type || "";
  if (!signature || !signType) {
    return new Response("failure", { status: 400 });
  }

  const { publicKey, appId } = getAlipayConfig();
  const verifyPayload = { ...payload };
  delete verifyPayload.sign;
  delete verifyPayload.sign_type;

  const verified = verifyAlipaySignature(verifyPayload, signature, publicKey);
  if (!verified) {
    return new Response("failure", { status: 400 });
  }

  if (payload.app_id && payload.app_id !== appId) {
    return new Response("failure", { status: 400 });
  }

  const outTradeNo = payload.out_trade_no;
  if (!outTradeNo) {
    return new Response("failure", { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data: order } = await supabase
    .from("alipay_orders")
    .select("user_id,total_amount,paid_at")
    .eq("out_trade_no", outTradeNo)
    .maybeSingle();

  if (!order) {
    return new Response("success");
  }

  if (payload.total_amount && order.total_amount) {
    const expected = Number(order.total_amount);
    const received = Number(payload.total_amount);
    if (Number.isFinite(expected) && Number.isFinite(received) && expected !== received) {
      return new Response("failure", { status: 400 });
    }
  }

  const tradeStatus = payload.trade_status || null;
  const buyerId = payload.buyer_id || payload.buyer_user_id || null;
  const buyerLogonId = payload.buyer_logon_id || payload.buyer_logon || null;
  const paid = isPaidStatus(tradeStatus);
  const status = paid ? "paid" : tradeStatus === "TRADE_CLOSED" ? "closed" : "pending";

  await supabase
    .from("alipay_orders")
    .update({
      status,
      trade_status: tradeStatus,
      trade_no: payload.trade_no ?? null,
      buyer_id: buyerId,
      buyer_logon_id: buyerLogonId,
      raw_payload: payload,
      paid_at: paid ? new Date().toISOString() : null,
    })
    .eq("out_trade_no", outTradeNo);

  if (paid && !order.paid_at) {
    const { data: billing } = await supabase
      .from("billing_customers")
      .select("subscription_expires_at")
      .eq("user_id", order.user_id)
      .maybeSingle();
    const expiresAt = nextExpiry(billing?.subscription_expires_at ?? null);
    await supabase
      .from("billing_customers")
      .upsert(
        {
          user_id: order.user_id,
          customer_id: buyerId ? `alipay:${buyerId}` : null,
          customer_email: buyerLogonId ?? null,
          subscription_active: true,
          product_id: PRODUCT_ID,
          subscription_source: "alipay",
          subscription_expires_at: expiresAt,
        },
        { onConflict: "user_id" },
      );
  }

  return new Response("success");
}
