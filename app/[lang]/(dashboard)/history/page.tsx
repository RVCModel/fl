"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { defaultLocale, Locale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pickLocale } from "@/i18n/locale-utils";
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

  const loadingText = pickLocale(locale, {
    zh: "加载中…",
    en: "Loading…",
    ja: "読み込み中…",
    ko: "로딩 중…",
    ru: "Загрузка…",
    de: "Wird geladen…",
    pt: "Carregando…",
    it: "Caricamento…",
    ar: "جارٍ التحميل…",
    es: "Cargando…",
    fr: "Chargement…",
  });
  const loadFailedFallback = pickLocale(locale, {
    zh: "加载历史记录失败",
    en: "Failed to load history",
    ja: "履歴の読み込みに失敗しました",
    ko: "기록을 불러오지 못했습니다",
    ru: "Не удалось загрузить историю",
    de: "Verlauf konnte nicht geladen werden",
    pt: "Falha ao carregar o histórico",
    it: "Impossibile caricare la cronologia",
    ar: "تعذر تحميل السجل",
    es: "No se pudo cargar el historial",
    fr: "Impossible de charger l’historique",
  });
  const deleteFailedFallback = pickLocale(locale, {
    zh: "删除失败",
    en: "Delete failed",
    ja: "削除に失敗しました",
    ko: "삭제에 실패했습니다",
    ru: "Не удалось удалить",
    de: "Löschen fehlgeschlagen",
    pt: "Falha ao excluir",
    it: "Eliminazione non riuscita",
    ar: "فشل الحذف",
    es: "Error al eliminar",
    fr: "Échec de la suppression",
  });
  const actionsText = pickLocale(locale, {
    zh: "操作",
    en: "Actions",
    ja: "操作",
    ko: "작업",
    ru: "Действия",
    de: "Aktionen",
    pt: "Ações",
    it: "Azioni",
    ar: "الإجراءات",
    es: "Acciones",
    fr: "Actions",
  });
  const backToText = pickLocale(locale, {
    zh: "返回",
    en: "Back to",
    ja: "戻る",
    ko: "돌아가기",
    ru: "Назад к",
    de: "Zurück zu",
    pt: "Voltar para",
    it: "Torna a",
    ar: "العودة إلى",
    es: "Volver a",
    fr: "Retour à",
  });

  const dateLocale =
    locale === "zh"
      ? "zh-CN"
      : locale === "ja"
        ? "ja-JP"
        : locale === "ko"
          ? "ko-KR"
          : locale === "ru"
            ? "ru-RU"
            : locale === "de"
              ? "de-DE"
              : locale === "pt"
                ? "pt-PT"
                : locale === "it"
                  ? "it-IT"
                  : locale === "ar"
                    ? "ar"
                    : locale === "es"
                      ? "es-ES"
                      : locale === "fr"
                        ? "fr-FR"
                        : "en-US";

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
          setError(dictionary.errors.needLogin);
          setLoading(false);
          return;
        }
        const res = await fetch("/api/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || loadFailedFallback);
        }
        setItems(data.items ?? []);
      } catch (err: any) {
        setError(err.message || loadFailedFallback);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [dictionary.errors.needLogin, loadFailedFallback, locale]);

  const t = dictionary.history!;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t.title}</h1>
          <p className="text-sm text-muted-foreground">{dictionary.tagline}</p>
        </div>
        <Link href={`/${locale}`}>
          <Button variant="outline" size="sm">
            {backToText} {dictionary.home.title}
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">{loadingText}</div>
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
            <div className="text-right">{t.cols.action || actionsText}</div>
          </div>
          <div className="divide-y divide-border/60">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                <div className="truncate font-mono text-xs text-muted-foreground">{item.task_id}</div>
                <div className="truncate">
                  <Button variant="ghost" size="sm" onClick={() => window.open(item.instrumental_url, "_blank")}>
                    {t.downloadInst}
                  </Button>
                </div>
                <div className="truncate">
                  <Button variant="ghost" size="sm" onClick={() => window.open(item.vocals_url, "_blank")}>
                    {t.downloadVocal}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString(dateLocale)}</div>
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
                          setError(dictionary.errors.needLogin);
                          return;
                        }
                        const res = await fetch(`/api/history?id=${item.id}`, {
                          method: "DELETE",
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        if (!res.ok) {
                          const data = await res.json();
                          throw new Error(data.error || deleteFailedFallback);
                        }
                        setItems((prev) => prev.filter((x) => x.id !== item.id));
                      } catch (err: any) {
                        setError(err.message || deleteFailedFallback);
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

