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

type JobPayload = {
  external_task_id?: string;
  source_url?: string;
  status?: string;
  model?: string;
  progress?: number;
  result_url?: string | null;
};

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();

  let body: JobPayload = {};
  try {
    body = (await req.json()) as JobPayload;
  } catch {
    body = {};
  }

  const externalTaskId = body.external_task_id;
  if (!externalTaskId || typeof externalTaskId !== "string") {
    return NextResponse.json({ error: "external_task_id is required" }, { status: 400 });
  }

  const sourceUrl =
    typeof body.source_url === "string" && body.source_url.trim().length
      ? body.source_url.trim()
      : `task:${externalTaskId}`;

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("separation_jobs")
    .upsert(
      {
        user_id: user.id,
        external_task_id: externalTaskId,
        source_url: sourceUrl,
        status: body.status ?? "queued",
        model: body.model ?? null,
        progress: typeof body.progress === "number" ? body.progress : 0,
        result_url: body.result_url ?? null,
      },
      { onConflict: "user_id,external_task_id" },
    )
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ job: data });
}

