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
  const { data: billing } = await supabase
    .from("billing_customers")
    .select("subscription_active")
    .eq("user_id", user.id)
    .maybeSingle();

  const subscribed = !!billing?.subscription_active;
  const limit = subscribed ? 200 : 10;

  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("separation_jobs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", start.toISOString())
    .in("model", ["demix", "dereverb"]);

  const used = typeof count === "number" ? count : 0;

  return NextResponse.json({
    subscribed,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  });
}

