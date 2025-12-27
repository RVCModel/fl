import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { alipayRequest } from "@/lib/alipay";

const AMOUNT_CNY = "25.00";
const SUBJECT_DEFAULT = "Demixr Pro Monthly";

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

function createOutTradeNo() {
  const rand = Math.random().toString(16).slice(2, 10);
  return `ALI${Date.now()}${rand}`;
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const subject = typeof body?.subject === "string" && body.subject.trim()
    ? body.subject.trim()
    : SUBJECT_DEFAULT;
  const outTradeNo = createOutTradeNo();

  const bizContent = {
    out_trade_no: outTradeNo,
    total_amount: AMOUNT_CNY,
    subject,
    product_code: "FACE_TO_FACE_PAYMENT",
    timeout_express: "30m",
  };

  let data: any = null;
  try {
    const res = await alipayRequest("alipay.trade.precreate", bizContent);
    data = res.data;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Alipay request failed" }, { status: 500 });
  }
  if (!data || data.code !== "10000" || !data.qr_code) {
    const message = data?.sub_msg || data?.msg || "Alipay precreate failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  await supabase
    .from("alipay_orders")
    .insert({
      user_id: user.id,
      out_trade_no: outTradeNo,
      subject,
      total_amount: AMOUNT_CNY,
      currency: "CNY",
      status: "created",
      trade_status: data.trade_status ?? null,
      qr_code: data.qr_code,
      raw_payload: data,
    });

  return NextResponse.json({
    out_trade_no: outTradeNo,
    qr_code: data.qr_code,
    amount: AMOUNT_CNY,
    currency: "CNY",
  });
}
