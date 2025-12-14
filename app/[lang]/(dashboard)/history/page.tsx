"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { defaultLocale, Locale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2 } from "lucide-react";
import { getValidAccessToken } from "@/lib/auth-client";

type HistoryItem = {
  id: string;
  task_id: string;
  vocals_url: string;
  instrumental_url: string;
  status: string;
  duration: number | null;
  created_at: string;
};

type PageProps = {
  params: Promise<{ lang: string }>;
};

export default function HistoryPage({ params }: PageProps) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dictionary, setDictionary] = useState(() => getDictionary(defaultLocale));
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ lang }) => {
      const nextLocale = locales.includes(lang as Locale) ? (lang as Locale) : defaultLocale;
      setLocale(nextLocale);
      setDictionary(getDictionary(nextLocale));
    });
  }, [params]);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getValidAccessToken();
        if (!token) {
          setError(locale === "en" ? "Please login first" : locale === "ja" ? "先にログインしてください" : "请先登录");
          setLoading(false);
          return;
        }
        const res = await fetch("/api/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load history");
        }
        setItems(data.items ?? []);
      } catch (err: any) {
        setError(err.message || "Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [locale]);

  const t = dictionary.history!;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t.title}</h1>
          <p className="text-sm text-muted-foreground">
            {dictionary.tagline}
          </p>
        </div>
        <Link href={`/${locale}`}>
          <Button variant="outline" size="sm">
            ← {dictionary.home.title}
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
          Loading...
        </div>
      ) : error ? (
        <Alert variant="destructive" className="px-4 py-6">
          <AlertDescription className="text-foreground">{error}</AlertDescription>
        </Alert>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          {t.empty}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="grid grid-cols-5 bg-muted/50 px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
            <div>{t.cols.task}</div>
            <div>{t.cols.inst}</div>
            <div>{t.cols.vocal}</div>
            <div>{t.cols.created}</div>
            <div className="text-right">{t.cols.action || "Actions"}</div>
          </div>
          <div className="divide-y divide-border/60">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                <div className="truncate font-mono text-xs text-muted-foreground">{item.task_id}</div>
                <div className="truncate">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(item.instrumental_url, "_blank")}
                  >
                    {t.downloadInst}
                  </Button>
                </div>
                <div className="truncate">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(item.vocals_url, "_blank")}
                  >
                    {t.downloadVocal}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleString(locale === "zh" ? "zh-CN" : locale === "ja" ? "ja-JP" : "en-US")}
                </div>
                <div className="flex justify-end gap-2 text-xs text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deleting === item.id}
                    onClick={async () => {
                      setDeleting(item.id);
                      try {
                        const token = await getValidAccessToken();
                        if (!token) {
                          setError(locale === "en" ? "Please login first" : locale === "ja" ? "先にログインしてください" : "请先登录");
                          return;
                        }
                        const res = await fetch(`/api/history?id=${item.id}`, {
                          method: "DELETE",
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        if (!res.ok) {
                          const data = await res.json();
                          throw new Error(data.error || "Delete failed");
                        }
                        setItems((prev) => prev.filter((x) => x.id !== item.id));
                      } catch (err: any) {
                        setError(err.message || "Delete failed");
                      } finally {
                        setDeleting(null);
                      }
                    }}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    {t.delete}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
