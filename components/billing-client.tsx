"use client";

import { useEffect, useMemo, useState } from "react";
import { CreemCheckout, CreemPortal } from "@creem_io/nextjs";
import { Dictionary } from "@/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient, getValidAccessToken } from "@/lib/auth-client";

type BillingStatus = {
  active: boolean;
  customerId: string | null;
  productId: string | null;
};

export default function BillingClient({
  dictionary,
  locale,
}: {
  dictionary: Dictionary;
  locale: string;
}) {
  const productId = process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID || "";
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user ?? null;
      setUserId(user?.id ?? null);
      setEmail(user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setUserId(user?.id ?? null);
      setEmail(user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = await getValidAccessToken();
        if (!token) {
          setStatus(null);
          return;
        }
        const res = await fetch("/api/billing/status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await res.json()) as BillingStatus;
        setStatus({
          active: !!data.active,
          customerId: data.customerId ?? null,
          productId: data.productId ?? null,
        });
        if (!data?.active) {
          await fetch("/api/billing/refresh", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => {});
          const res2 = await fetch("/api/billing/status", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data2 = (await res2.json()) as BillingStatus;
          setStatus({
            active: !!data2.active,
            customerId: data2.customerId ?? null,
            productId: data2.productId ?? null,
          });
        }
      } catch {
        setStatus(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const lists = useMemo(() => {
    return {
      nonSubscriber: dictionary.billing.nonSubscriberBenefits,
      subscriber: dictionary.billing.subscriberBenefits,
    };
  }, [dictionary.billing.nonSubscriberBenefits, dictionary.billing.subscriberBenefits]);

  const title = dictionary.billing.title;
  const subtitle = dictionary.billing.subtitle;

  const canCheckout = !!userId && !!productId;
  const isActive = !!status?.active;
  const customerId = status?.customerId ?? null;

  return (
    <div className="min-h-screen bg-[#17171e] px-6 py-12 text-white">
      <div className="mx-auto w-full max-w-5xl">
        <header className="text-center">
          <h1 className="text-4xl font-bold md:text-5xl">{title}</h1>
          <p className="mt-3 text-lg text-slate-300">{subtitle}</p>
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-black/30 p-8 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="text-lg font-semibold">{dictionary.billing.nonSubscriberTitle}</div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                {dictionary.billing.inactive}
              </span>
            </div>
            <ul className="mt-6 space-y-2 text-sm text-slate-300">
              {lists.nonSubscriber.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-300/60" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/30 p-8 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="text-lg font-semibold">{dictionary.billing.subscriberTitle}</div>
              <span
                className={
                  "rounded-full px-3 py-1 text-xs font-semibold " +
                  (isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-slate-200")
                }
              >
                {isActive ? dictionary.billing.active : dictionary.billing.inactive}
              </span>
            </div>

            <ul className="mt-6 space-y-2 text-sm text-slate-300">
              {lists.subscriber.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              {!userId ? (
                <Button
                  className="rounded-full bg-indigo-600 px-6 hover:bg-indigo-700"
                  onClick={() => (window.location.href = `/${locale}/auth/login`)}
                >
                  {dictionary.billing.needLogin}
                </Button>
              ) : isActive && customerId ? (
                <CreemPortal customerId={customerId}>
                  <Button
                    className="rounded-full bg-white/10 px-6 text-white hover:bg-white/15"
                    disabled={loading}
                  >
                    {dictionary.billing.manage}
                  </Button>
                </CreemPortal>
              ) : (
                <CreemCheckout
                  productId={productId}
                  successUrl={`/${locale}/billing/success`}
                  referenceId={userId ?? undefined}
                  customer={email ? { email } : undefined}
                  metadata={{ referenceId: userId ?? undefined, source: "web", locale }}
                >
                  <Button
                    className="rounded-full bg-indigo-600 px-6 hover:bg-indigo-700"
                    disabled={!canCheckout || loading}
                    title={!productId ? dictionary.billing.missingProduct : undefined}
                  >
                    {dictionary.billing.subscribe}
                  </Button>
                </CreemCheckout>
              )}

              <Button
                variant="outline"
                className="rounded-full border-white/10 bg-transparent text-white hover:bg-white/5"
                onClick={() => (window.location.href = `/${locale}`)}
              >
                {locale === "zh"
                  ? "返回"
                  : locale === "ja"
                    ? "戻る"
                    : locale === "ko"
                      ? "뒤로"
                      : locale === "ru"
                        ? "Назад"
                        : locale === "de"
                          ? "Zurück"
                          : locale === "pt"
                            ? "Voltar"
                            : locale === "it"
                              ? "Indietro"
                              : locale === "ar"
                                ? "رجوع"
                                : locale === "es"
                                  ? "Volver"
                                  : locale === "fr"
                                    ? "Retour"
                                    : "Back"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
