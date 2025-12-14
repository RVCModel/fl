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
    .select("customer_id,subscription_active,product_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { active: false, customerId: null, productId: null },
      { status: 200 },
    );
  }

  return NextResponse.json({
    active: !!data?.subscription_active,
    customerId: data?.customer_id ?? null,
    productId: data?.product_id ?? null,
  });
}

