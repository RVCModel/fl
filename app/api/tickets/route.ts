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

async function isAdmin(userId: string) {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();
  return !!(data as any)?.is_admin;
}

const categories = ["demix", "billing", "other"] as const;
type Category = (typeof categories)[number];

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();

  const url = new URL(req.url);
  const scope = url.searchParams.get("scope");
  const admin = await isAdmin(user.id);

  const supabase = getSupabaseServerClient();
  const query = supabase
    .from("support_tickets")
    .select("id,user_id,category,subject,status,created_at,updated_at")
    .order("updated_at", { ascending: false });

  const isAll = scope === "all" && admin;
  const { data, error } = isAll ? await query : await query.eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ isAdmin: admin, tickets: [] }, { status: 200 });
  }

  const tickets = (data ?? []) as any[];
  if (isAll && tickets.length) {
    const userIds = Array.from(new Set(tickets.map((t) => String(t.user_id))));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id,email,full_name")
      .in("id", userIds);
    const map = new Map<string, { email: string | null; full_name: string | null }>();
    for (const p of (profiles ?? []) as any[]) {
      map.set(String(p.id), { email: p.email ?? null, full_name: p.full_name ?? null });
    }
    for (const t of tickets) {
      t.user = map.get(String(t.user_id)) ?? { email: null, full_name: null };
    }
  }

  return NextResponse.json({ isAdmin: admin, tickets }, { status: 200 });
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

  const category = String(body.category || "") as Category;
  const subject = String(body.subject || "").trim().slice(0, 120);
  const content = String(body.content || "").trim().slice(0, 4000);

  if (!categories.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data: ticket, error: ticketErr } = await supabase
    .from("support_tickets")
    .insert({
      user_id: user.id,
      category,
      subject,
      status: "open",
    })
    .select("id")
    .maybeSingle();

  if (ticketErr || !ticket?.id) {
    return NextResponse.json({ error: ticketErr?.message || "Create ticket failed" }, { status: 500 });
  }

  const { error: msgErr } = await supabase.from("support_ticket_messages").insert({
    ticket_id: ticket.id,
    sender_id: user.id,
    sender_role: "user",
    body: content,
  });

  if (msgErr) {
    return NextResponse.json({ error: msgErr.message || "Create message failed" }, { status: 500 });
  }

  return NextResponse.json({ ticketId: ticket.id }, { status: 200 });
}
