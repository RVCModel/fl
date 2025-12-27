import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getCustomerByEmail, getSubscription, searchTransactions } from "@/lib/creem-api";

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

function isSubscriptionActive(status: string) {
  return status === "active" || status === "trialing" || status === "scheduled_cancel";
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();

  const email = user.email;
  if (!email) {
    return NextResponse.json({ active: false, reason: "no_email" }, { status: 200 });
  }

  const productId = process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID || "";
  if (!productId) {
    return NextResponse.json({ active: false, reason: "missing_product" }, { status: 200 });
  }

  const supabase = getSupabaseServerClient();
  const { data: existing } = await supabase
    .from("billing_customers")
    .select("subscription_source,subscription_expires_at,subscription_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.subscription_source === "alipay") {
    const expiresAt = existing.subscription_expires_at ? new Date(existing.subscription_expires_at) : null;
    const stillActive = !!existing.subscription_active && (!expiresAt || expiresAt.getTime() > Date.now());
    if (!stillActive && existing.subscription_active) {
      await supabase
        .from("billing_customers")
        .update({ subscription_active: false })
        .eq("user_id", user.id);
    }
    return NextResponse.json({ active: stillActive, reason: "alipay" }, { status: 200 });
  }

  try {
    const customer = await getCustomerByEmail(email);
    if (!customer) {
      await supabase
        .from("billing_customers")
        .upsert(
          {
            user_id: user.id,
            customer_email: email,
            subscription_active: false,
            product_id: productId,
            subscription_source: "creem",
            subscription_expires_at: null,
          },
          { onConflict: "user_id" },
        );
      return NextResponse.json({ active: false, reason: "no_customer" }, { status: 200 });
    }

    const txs = await searchTransactions({ customerId: customer.id, productId, pageSize: 30, pageNumber: 1 });
    const subscriptionId = txs.find((t) => t.subscription)?.subscription ?? null;

    let active = false;
    let resolvedSubscriptionId: string | null = null;

    if (subscriptionId) {
      const sub = await getSubscription(subscriptionId);
      resolvedSubscriptionId = sub?.id ? String(sub.id) : subscriptionId;
      active = isSubscriptionActive(String((sub as any)?.status ?? ""));
    }

    await supabase
      .from("billing_customers")
      .upsert(
        {
          user_id: user.id,
          customer_id: customer.id,
          customer_email: email,
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
        customerId: customer.id,
        productId,
        subscriptionId: resolvedSubscriptionId,
      },
      { status: 200 },
    );
  } catch (err) {
    const { data } = await supabase
      .from("billing_customers")
      .select("customer_id,subscription_active,product_id")
      .eq("user_id", user.id)
      .maybeSingle();
    return NextResponse.json(
      {
        active: !!(data as any)?.subscription_active,
        customerId: (data as any)?.customer_id ?? null,
        productId: (data as any)?.product_id ?? productId,
        reason: "refresh_failed",
      },
      { status: 200 },
    );
  }
}
