import { NextRequest, NextResponse } from "next/server";
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

async function getAdminFlag(userId: string) {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();
  return !!(data as any)?.is_admin;
}

async function getTicket(ticketId: string) {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("support_tickets")
    .select("id,user_id,category,subject,status,created_at,updated_at")
    .eq("id", ticketId)
    .maybeSingle();
  return data as any | null;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ ticketId: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();

  const { ticketId } = await ctx.params;
  const admin = await getAdminFlag(user.id);
  const ticket = await getTicket(ticketId);
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!admin && ticket.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let userInfo: { email: string | null; full_name: string | null } | null = null;
  if (admin) {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from("profiles")
      .select("email,full_name")
      .eq("id", ticket.user_id)
      .maybeSingle();
    userInfo = { email: (data as any)?.email ?? null, full_name: (data as any)?.full_name ?? null };
  }

  const supabase = getSupabaseServerClient();
  const { data: messages } = await supabase
    .from("support_ticket_messages")
    .select("id,ticket_id,sender_id,sender_role,body,created_at")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  return NextResponse.json(
    { isAdmin: admin, ticket: { ...ticket, user: userInfo }, messages: messages ?? [] },
    { status: 200 },
  );
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ ticketId: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();

  const { ticketId } = await ctx.params;
  const admin = await getAdminFlag(user.id);
  const ticket = await getTicket(ticketId);
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!admin && ticket.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const content = String(body.content || "").trim().slice(0, 4000);
  if (!content) return NextResponse.json({ error: "Content is required" }, { status: 400 });

  const supabase = getSupabaseServerClient();
  const { error: msgErr } = await supabase.from("support_ticket_messages").insert({
    ticket_id: ticketId,
    sender_id: user.id,
    sender_role: admin ? "admin" : "user",
    body: content,
  });
  if (msgErr) {
    return NextResponse.json({ error: msgErr.message || "Reply failed" }, { status: 500 });
  }

  const nextStatus = admin ? "answered" : "open";
  await supabase
    .from("support_tickets")
    .update({ status: nextStatus })
    .eq("id", ticketId);

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ ticketId: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();

  const { ticketId } = await ctx.params;
  const admin = await getAdminFlag(user.id);
  const ticket = await getTicket(ticketId);
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!admin && ticket.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const status = String(body.status || "");
  const allowed = admin ? ["open", "answered", "closed"] : ["open", "closed"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("support_tickets").update({ status }).eq("id", ticketId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ ticketId: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();

  const { ticketId } = await ctx.params;
  const admin = await getAdminFlag(user.id);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("support_tickets").delete().eq("id", ticketId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 200 });
}
