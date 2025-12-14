import { Webhook } from "@creem_io/nextjs";
import { getSupabaseServerClient } from "@/lib/supabase-server";

function getReferenceId(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") return null;
  const anyMeta = metadata as Record<string, unknown>;
  const referenceId =
    (anyMeta.referenceId as string | undefined) ||
    (anyMeta.userId as string | undefined) ||
    (anyMeta.user_id as string | undefined);
  return referenceId || null;
}

export const POST = Webhook({
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,
  onCheckoutCompleted: async ({ customer, metadata, product }) => {
    const userId = getReferenceId(metadata);
    if (!userId || !customer) return;
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from("billing_customers")
      .upsert(
        {
          user_id: userId,
          customer_id: customer.id,
          customer_email: customer.email,
          subscription_active: true,
          product_id: product?.id ?? null,
        },
        { onConflict: "user_id" },
      );
    if (error) {
      console.error("creem webhook onCheckoutCompleted upsert failed", error);
    }
  },
  onGrantAccess: async ({ customer, metadata, product }) => {
    const userId = getReferenceId(metadata);
    if (!userId || !customer) return;
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from("billing_customers")
      .upsert(
        {
          user_id: userId,
          customer_id: customer.id,
          customer_email: customer.email,
          subscription_active: true,
          product_id: product?.id ?? null,
        },
        { onConflict: "user_id" },
      );
    if (error) {
      console.error("creem webhook onGrantAccess upsert failed", error);
    }
  },
  onRevokeAccess: async ({ customer, metadata, product }) => {
    const userId = getReferenceId(metadata);
    if (!userId || !customer) return;
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from("billing_customers")
      .upsert(
        {
          user_id: userId,
          customer_id: customer.id,
          customer_email: customer.email,
          subscription_active: false,
          product_id: product?.id ?? null,
        },
        { onConflict: "user_id" },
      );
    if (error) {
      console.error("creem webhook onRevokeAccess upsert failed", error);
    }
  },
});
