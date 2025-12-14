"use client";

import { createClient, type Session } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    if (!supabaseUrl || !supabaseAnon) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }
    browserClient = createClient(supabaseUrl, supabaseAnon, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }
  return browserClient;
}

export async function applySession(session: Session | null) {
  if (!session) return null;
  const supabase = getSupabaseBrowserClient();
  await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
  if (typeof window !== "undefined" && session.access_token) {
    localStorage.setItem("vofl:token", session.access_token);
  }
  return session;
}

export async function getValidAccessToken() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  const token = data.session.access_token;
  if (typeof window !== "undefined" && token) {
    localStorage.setItem("vofl:token", token);
  }
  return token;
}
