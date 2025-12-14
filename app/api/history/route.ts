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
    .from("history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();
  const supabase = getSupabaseServerClient();
  let body: any = {};
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { task_id, vocals_url, instrumental_url, duration } = body;
  if (!task_id || !vocals_url || !instrumental_url) {
    return NextResponse.json(
      { error: "task_id, vocals_url, instrumental_url are required" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("history")
    .upsert(
      {
        user_id: user.id,
        task_id,
        vocals_url,
        instrumental_url,
        duration,
        status: "completed",
      },
      { onConflict: "user_id,task_id" },
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ item: data });
}

export async function DELETE(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("history")
    .delete()
    .match({ id, user_id: user.id });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
