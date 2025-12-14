import { getCreemTestMode } from "@/lib/creem";

function getBaseUrl() {
  return getCreemTestMode() ? "https://test-api.creem.io" : "https://api.creem.io";
}

async function creemGet<T>(pathWithQuery: string): Promise<T> {
  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) throw new Error("Missing CREEM_API_KEY");
  const url = `${getBaseUrl()}${pathWithQuery}`;
  const res = await fetch(url, {
    headers: { "x-api-key": apiKey },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`Creem API error ${res.status}: ${text}`);
    (err as any).status = res.status;
    throw err;
  }
  return (await res.json()) as T;
}

export type CreemCustomer = {
  id: string;
  email: string;
};

export async function getCustomerByEmail(email: string): Promise<CreemCustomer | null> {
  try {
    const data = await creemGet<any>(`/v1/customers?email=${encodeURIComponent(email)}`);
    if (!data?.id) return null;
    return { id: String(data.id), email: String(data.email || email) };
  } catch (e: any) {
    if (e?.status === 404) return null;
    throw e;
  }
}

export type CreemTransaction = {
  id: string;
  status: string;
  subscription: string | null;
  created_at?: number;
};

export async function searchTransactions(params: {
  customerId?: string;
  productId?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<CreemTransaction[]> {
  const query = new URLSearchParams();
  if (params.customerId) query.set("customer_id", params.customerId);
  if (params.productId) query.set("product_id", params.productId);
  query.set("page_number", String(params.pageNumber ?? 1));
  query.set("page_size", String(params.pageSize ?? 20));
  const data = await creemGet<any>(`/v1/transactions/search?${query.toString()}`);
  const items = Array.isArray(data?.items) ? data.items : [];
  return items.map((t: any) => ({
    id: String(t.id),
    status: String(t.status ?? ""),
    subscription: t.subscription ? String(t.subscription) : null,
    created_at: typeof t.created_at === "number" ? t.created_at : undefined,
  }));
}

export type CreemSubscription = {
  id: string;
  status: "active" | "canceled" | "unpaid" | "paused" | "trialing" | "scheduled_cancel" | string;
  product?: { id?: string } | string;
  customer?: { id?: string; email?: string } | string;
};

export async function getSubscription(subscriptionId: string): Promise<CreemSubscription> {
  const query = new URLSearchParams();
  query.set("subscription_id", subscriptionId);
  return await creemGet<CreemSubscription>(`/v1/subscriptions?${query.toString()}`);
}

export type CreemCheckout = {
  id: string;
  status: "pending" | "processing" | "completed" | "expired" | string;
  request_id?: string;
  product?: { id?: string } | string;
  subscription?: { id?: string } | string | null;
  customer?: { id?: string; email?: string } | string | null;
  metadata?: Record<string, unknown> | null;
};

export async function getCheckout(checkoutId: string): Promise<CreemCheckout> {
  const query = new URLSearchParams();
  query.set("checkout_id", checkoutId);
  return await creemGet<CreemCheckout>(`/v1/checkouts?${query.toString()}`);
}
