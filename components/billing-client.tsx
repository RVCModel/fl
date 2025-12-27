"use client";

import { useEffect, useMemo, useState } from "react";
import { CreemCheckout, CreemPortal } from "@creem_io/nextjs";
import { Dictionary } from "@/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getSupabaseBrowserClient, getValidAccessToken } from "@/lib/auth-client";
import QRCode from "qrcode";
import { Loader2 } from "lucide-react";

type BillingStatus = {
  active: boolean;
  customerId: string | null;
  productId: string | null;
  source?: string | null;
  expiresAt?: string | null;
};

function AlipayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="6" fill="#1677ff" />
      <path
        d="M8 17 12 7l4 10h-2l-.8-2h-2.4L9.9 17H8zm3.3-3.5h1.9L12.2 9.9l-.9 3.6z"
        fill="white"
      />
    </svg>
  );
}

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
  const [alipayOpen, setAlipayOpen] = useState(false);
  const [alipayLoading, setAlipayLoading] = useState(false);
  const [alipayOrderNo, setAlipayOrderNo] = useState<string | null>(null);
  const [alipayQrCode, setAlipayQrCode] = useState<string | null>(null);
  const [alipayQrImage, setAlipayQrImage] = useState<string | null>(null);
  const [alipayStatus, setAlipayStatus] = useState<string | null>(null);
  const [alipayError, setAlipayError] = useState<string | null>(null);
  const [alipaySuccess, setAlipaySuccess] = useState(false);

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

  const fetchStatus = async () => {
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
        source: data.source ?? null,
        expiresAt: data.expiresAt ?? null,
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
          source: data2.source ?? null,
          expiresAt: data2.expiresAt ?? null,
        });
      }
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [userId]);

  const startAlipayCheckout = async () => {
    if (!userId) {
      window.location.href = `/${locale}/auth/login`;
      return;
    }
    setAlipayOpen(true);
    setAlipayLoading(true);
    setAlipayError(null);
    setAlipayOrderNo(null);
    setAlipayQrCode(null);
    setAlipayQrImage(null);
    setAlipayStatus(null);

    try {
      const token = await getValidAccessToken();
      if (!token) {
        setAlipayError(dictionary.billing.needLogin);
        return;
      }
      const res = await fetch("/api/billing/alipay/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ locale }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Alipay create failed");
      }
      setAlipayOrderNo(data.out_trade_no || null);
      setAlipayQrCode(data.qr_code || null);
      if (data.qr_code) {
        const qrImage = await QRCode.toDataURL(String(data.qr_code), { width: 260, margin: 1 });
        setAlipayQrImage(qrImage);
      }
    } catch (err: any) {
      setAlipayError(err?.message || "Alipay request failed");
    } finally {
      setAlipayLoading(false);
    }
  };

  useEffect(() => {
    if (!alipayOpen || !alipayOrderNo) return;

    let active = true;
    const poll = async () => {
      try {
        const token = await getValidAccessToken();
        if (!token || !active) return;
        const res = await fetch(
          `/api/billing/alipay/status?out_trade_no=${encodeURIComponent(alipayOrderNo)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        if (!active) return;
        if (data?.active) {
          setAlipayStatus("paid");
          setAlipayOpen(false);
          setAlipaySuccess(true);
          fetchStatus();
          return;
        }
        if (data?.tradeStatus === "TRADE_CLOSED") {
          setAlipayStatus("closed");
        }
      } catch {
        if (active) setAlipayStatus("pending");
      }
    };

    poll();
    const timer = window.setInterval(poll, 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [alipayOpen, alipayOrderNo]);

  useEffect(() => {
    if (!alipaySuccess) return;
    const timer = window.setTimeout(() => setAlipaySuccess(false), 8000);
    return () => window.clearTimeout(timer);
  }, [alipaySuccess]);

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
  const source = status?.source ?? null;
  const expiresAt = status?.expiresAt ?? null;
  const isAlipayActive = isActive && source === "alipay";

  const formattedExpiry = (() => {
    if (!expiresAt) return null;
    const dt = new Date(expiresAt);
    if (Number.isNaN(dt.getTime())) return null;
    return locale === "zh" ? dt.toLocaleDateString("zh-CN") : dt.toLocaleDateString("en-US");
  })();

  const alipayLabel = locale === "zh" ? "支付宝当面付" : "Alipay QR Pay";
  const alipayPrice =
    locale === "zh" ? (
      <span>
        限时 ¥25/月 <span className="text-slate-500 line-through">原价 ¥30</span> ≈ $4
      </span>
    ) : (
      <span>
        $4/mo (<span className="text-slate-500 line-through">¥30</span> → ¥25)
      </span>
    );

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
            {isAlipayActive && formattedExpiry && (
              <div className="mt-2 text-xs text-slate-400">
                {locale === "zh" ? `有效期至 ${formattedExpiry}` : `Valid until ${formattedExpiry}`}
              </div>
            )}

            <ul className="mt-6 space-y-2 text-sm text-slate-300">
              {lists.subscriber.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {alipaySuccess && (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                {locale === "zh" ? "支付成功，订阅已激活。" : "Payment successful. Subscription activated."}
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {!userId ? (
                <Button
                  className="rounded-full bg-indigo-600 px-6 hover:bg-indigo-700"
                  onClick={() => (window.location.href = `/${locale}/auth/login`)}
                >
                  {dictionary.billing.needLogin}
                </Button>
              ) : isActive && customerId && !isAlipayActive ? (
                <CreemPortal customerId={customerId}>
                  <Button
                    className="rounded-full bg-white/10 px-6 text-white hover:bg-white/15"
                    disabled={loading}
                  >
                    {dictionary.billing.manage}
                  </Button>
                </CreemPortal>
              ) : !isActive ? (
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
              ) : null}

              <Button
                className="rounded-full bg-emerald-500/15 px-6 text-emerald-100 hover:bg-emerald-500/25"
                onClick={startAlipayCheckout}
                disabled={!userId || alipayLoading}
              >
                {alipayLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {locale === "zh" ? "生成中…" : "Preparing..."}
                  </>
                ) : isAlipayActive ? (
                  <>
                    <AlipayIcon className="mr-2 h-4 w-4" />
                    {locale === "zh" ? "支付宝续费" : "Renew via Alipay"}
                  </>
                ) : (
                  <>
                    <AlipayIcon className="mr-2 h-4 w-4" />
                    {alipayLabel}
                  </>
                )}
              </Button>

              <div className="w-full text-xs text-slate-400">{alipayPrice}</div>

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

        <Dialog
          open={alipayOpen}
          onOpenChange={(open) => {
            setAlipayOpen(open);
            if (!open) {
              setAlipayStatus(null);
              setAlipayError(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{alipayLabel}</DialogTitle>
              <DialogDescription>
                {locale === "zh"
                  ? "使用支付宝扫码完成订阅，付款成功后会自动激活。"
                  : "Scan with Alipay to complete the subscription. It will activate after payment."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-3">
              {alipayLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {locale === "zh" ? "正在生成二维码…" : "Generating QR code..."}
                </div>
              ) : alipayQrImage ? (
                <img src={alipayQrImage} alt="Alipay QR" className="h-[260px] w-[260px] rounded-xl bg-white p-3" />
              ) : (
                <div className="text-sm text-red-400">
                  {alipayError || (locale === "zh" ? "二维码生成失败" : "Failed to generate QR code")}
                </div>
              )}

              {!alipayQrImage && alipayQrCode && (
                <div className="break-all rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-slate-300">
                  {alipayQrCode}
                </div>
              )}

              {alipayStatus === "closed" && (
                <div className="text-xs text-amber-300">
                  {locale === "zh" ? "订单已关闭，请重新生成二维码" : "Order closed. Please generate a new QR code."}
                </div>
              )}

              {alipayOrderNo && (
                <div className="text-xs text-slate-500">#{alipayOrderNo}</div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                className="rounded-full border-white/10 bg-transparent text-white hover:bg-white/5"
                onClick={() => setAlipayOpen(false)}
              >
                {locale === "zh" ? "关闭" : "Close"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
