import { NextResponse } from "next/server";
import { alipayRequest } from "@/lib/alipay";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const PRODUCT_ID = "alipay_monthly";
const SUBSCRIPTION_DAYS = 30;

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function getUserFromRequest(req: Request) {
  const supabase = getSupabaseServerClient();
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

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

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();

  const url = new URL(req.url);
  const outTradeNo = url.searchParams.get("out_trade_no");
  if (!outTradeNo) {
    return NextResponse.json({ error: "out_trade_no is required" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data: order } = await supabase
    .from("alipay_orders")
    .select("id,status,trade_status,qr_code,total_amount,paid_at")
    .eq("out_trade_no", outTradeNo)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  let status = order.status;
  let tradeStatus = order.trade_status;
  let buyerId: string | null = null;
  let buyerLogonId: string | null = null;

  if (!isPaidStatus(tradeStatus) && status !== "closed") {
    try {
      const { data } = await alipayRequest("alipay.trade.query", { out_trade_no: outTradeNo });
      if (data && data.code === "10000") {
        tradeStatus = data.trade_status ?? tradeStatus;
        status = isPaidStatus(tradeStatus) ? "paid" : data.trade_status === "TRADE_CLOSED" ? "closed" : "pending";
        buyerId = data.buyer_user_id ?? null;
        buyerLogonId = data.buyer_logon_id ?? null;
        await supabase
          .from("alipay_orders")
          .update({
            status,
            trade_status: tradeStatus,
            trade_no: data.trade_no ?? null,
            buyer_id: buyerId,
            buyer_logon_id: buyerLogonId,
            raw_payload: data,
            paid_at: isPaidStatus(tradeStatus) ? new Date().toISOString() : null,
          })
          .eq("out_trade_no", outTradeNo);
      }
    } catch {
      // ignore query failure; client can retry polling
    }
  }

  let active = false;
  let expiresAt: string | null = null;
  if (isPaidStatus(tradeStatus)) {
    const { data: billing } = await supabase
      .from("billing_customers")
      .select("subscription_expires_at")
      .eq("user_id", user.id)
      .maybeSingle();
    const currentExpires = billing?.subscription_expires_at ?? null;
    expiresAt = currentExpires;
    if (!order.paid_at) {
      expiresAt = nextExpiry(currentExpires);
      await supabase
        .from("billing_customers")
        .upsert(
          {
            user_id: user.id,
            customer_id: buyerId ? `alipay:${buyerId}` : null,
            customer_email: buyerLogonId ?? user.email ?? null,
            subscription_active: true,
            product_id: PRODUCT_ID,
            subscription_source: "alipay",
            subscription_expires_at: expiresAt,
          },
          { onConflict: "user_id" },
        );
      await supabase
        .from("alipay_orders")
        .update({ paid_at: new Date().toISOString(), status: "paid" })
        .eq("out_trade_no", outTradeNo);
    }
    active = true;
  }

  return NextResponse.json({
    status,
    tradeStatus,
    active,
    expiresAt,
    qrCode: order.qr_code ?? null,
  });
}
