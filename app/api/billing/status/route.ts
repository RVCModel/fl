import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

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

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("billing_customers")
    .select("customer_id,subscription_active,product_id,subscription_expires_at,subscription_source")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { active: false, customerId: null, productId: null, source: null, expiresAt: null },
      { status: 200 },
    );
  }

  const expiresAtRaw = data?.subscription_expires_at ?? null;
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;
  let active = !!data?.subscription_active;
  if (active && expiresAt && expiresAt.getTime() <= Date.now()) {
    active = false;
    await supabase
      .from("billing_customers")
      .update({ subscription_active: false })
      .eq("user_id", user.id);
  }

  return NextResponse.json({
    active,
    customerId: data?.customer_id ?? null,
    productId: data?.product_id ?? null,
    source: data?.subscription_source ?? null,
    expiresAt: expiresAtRaw,
  });
}
