import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getCheckout } from "@/lib/creem-api";

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

function getStringId(v: unknown) {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (typeof v === "object" && "id" in (v as any) && typeof (v as any).id === "string") {
    return (v as any).id as string;
  }
  return null;
}

function getMetadataRef(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") return null;
  const m = metadata as Record<string, unknown>;
  const ref =
    (m.referenceId as string | undefined) ||
    (m.userId as string | undefined) ||
    (m.user_id as string | undefined);
  return ref || null;
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
  const checkoutId = body.checkout_id || body.checkoutId || null;
  if (!checkoutId || typeof checkoutId !== "string") {
    return NextResponse.json({ error: "checkout_id is required" }, { status: 400 });
  }

  const checkout = await getCheckout(checkoutId);
  const status = String(checkout?.status ?? "");
  const productId = getStringId(checkout?.product);
  const customerId = getStringId(checkout?.customer);
  const subscriptionId = getStringId(checkout?.subscription);

  const referenceId = getMetadataRef(checkout?.metadata) || (checkout as any)?.request_id || null;
  if (referenceId && referenceId !== user.id) {
    return NextResponse.json({ error: "checkout does not belong to user" }, { status: 403 });
  }

  const active = status === "completed";

  const supabase = getSupabaseServerClient();
  await supabase
    .from("billing_customers")
    .upsert(
      {
        user_id: user.id,
        customer_id: customerId,
        customer_email: user.email ?? null,
        subscription_active: active,
        product_id: productId,
        subscription_source: "creem",
        subscription_expires_at: null,
      },
      { onConflict: "user_id" },
    );

  return NextResponse.json(
    {
      active,
      status,
      checkoutId,
      productId,
      customerId,
      subscriptionId,
    },
    { status: 200 },
  );
}
