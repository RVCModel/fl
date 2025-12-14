import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const { email, password, name } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Missing email or password." }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Missing supabase config" }, { status: 500 });
  }
  const anon = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await anon.auth.signUp({
    email,
    password,
    options: {
      data: name ? { name } : undefined,
      emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Explicitly upsert profile (also backed by DB trigger; this is a safe fallback).
  if (data.user?.id) {
    const supabase = getSupabaseServerClient();
    const fullName = typeof name === "string" && name.trim().length ? name.trim() : null;
    await supabase
      .from("profiles")
      .upsert(
        {
          id: data.user.id,
          email,
          full_name: fullName,
        },
        { onConflict: "id" },
      );

    // If there is no admin yet, promote the very first registered user.
    try {
      const { data: existingAdmin } = await supabase
        .from("profiles")
        .select("id")
        .eq("is_admin", true)
        .maybeSingle();
      if (!existingAdmin) {
        await supabase.from("profiles").update({ is_admin: true }).eq("id", data.user.id);
      }
    } catch {
      // Ignore if column or RLS is not ready yet.
    }
  }

  return NextResponse.json({
    user: data.user,
    needsEmailConfirm: !data.session,
  });
}
