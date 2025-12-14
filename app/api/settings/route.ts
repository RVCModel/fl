import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
  return { user: data.user, token };
}

export async function PATCH(req: Request) {
  const userCtx = await getUserFromRequest(req);
  if (!userCtx) return unauthorized();
  const { user } = userCtx;

  let body: any = {};
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  if (body.action === "name") {
    const { name } = body;
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, name },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ user: data.user });
  }

  if (body.action === "password") {
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "currentPassword and newPassword are required" }, { status: 400 });
    }
    if (!supabaseUrl || !supabaseAnon) {
      return NextResponse.json({ error: "Missing supabase config" }, { status: 500 });
    }
    const anonClient = createClient(supabaseUrl, supabaseAnon, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const email = user.email;
    if (!email) return NextResponse.json({ error: "No email found" }, { status: 400 });

    // Verify current password via anon client
    const { error: signInErr } = await anonClient.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (signInErr) {
      return NextResponse.json({ error: "Current password incorrect" }, { status: 401 });
    }

    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
