"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dictionary } from "@/i18n/dictionaries";
import { getValidAccessToken } from "@/lib/auth-client";

type BillingStatus = {
  active: boolean;
  customerId: string | null;
  productId: string | null;
};

export default function BillingSuccessClient({
  dictionary,
  locale,
}: {
  dictionary: Dictionary;
  locale: string;
}) {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const labels = useMemo(() => {
    if (locale === "en") {
      return {
        syncing: "Syncing subscription status…",
        tip: "If it stays inactive, make sure the Creem webhook is configured and reachable.",
        refresh: "Refresh",
      };
    }
    if (locale === "ja") {
      return {
        syncing: "購読ステータスを同期中…",
        tip: "反映されない場合は、Creem のWebhook設定と到達性（ローカルはトンネル）が必要です。",
        refresh: "更新",
      };
    }
    return {
      syncing: "正在同步订阅状态…",
      tip: "如果一直未订阅，请检查 Creem Webhook 是否已配置且可访问（本地需要内网穿透）。",
      refresh: "刷新",
    };
  }, [locale]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        setStatus(null);
        setError(dictionary.billing.needLogin);
        return;
      }

      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const checkoutId = params?.get("checkout_id");
      if (checkoutId) {
        await fetch("/api/billing/confirm", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ checkout_id: checkoutId }),
        }).catch(() => {});
      }

      const res = await fetch("/api/billing/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as BillingStatus;
      setStatus(data);
      if (!data?.active) {
        await fetch("/api/billing/refresh", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } catch (e: any) {
      setError(e?.message || "Failed to fetch status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer: any;
    const run = async () => {
      await load();
      timer = setInterval(load, 2500);
    };
    run();
    return () => timer && clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isActive = !!status?.active;

  return (
    <div className="mt-6">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-200">
            {locale === "en" ? "Status" : locale === "ja" ? "ステータス" : "状态"}
          </div>
          <span
            className={
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold " +
              (isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-slate-200")
            }
          >
            {isActive ? dictionary.billing.active : dictionary.billing.inactive}
          </span>
        </div>

        {!isActive && (
          <p className="mt-3 text-sm text-slate-300">
            {loading ? labels.syncing : labels.tip}
          </p>
        )}

        {error && (
          <div className="mt-3">
            <Alert variant="destructive">
              <AlertDescription className="text-foreground">{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="rounded-full border-white/10 bg-transparent text-white hover:bg-white/5"
            onClick={load}
            disabled={loading}
          >
            {labels.refresh}
          </Button>
          <Link href={`/${locale}/billing`}>
            <Button className="rounded-full bg-indigo-600 px-6 hover:bg-indigo-700">
              {dictionary.billing.manage}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
