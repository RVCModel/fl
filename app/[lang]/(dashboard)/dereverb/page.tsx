import { defaultLocale, Locale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import DereverbHero from "@/components/dereverb-hero";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = locales.includes(lang as Locale) ? (lang as Locale) : defaultLocale;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://demixr.com";
  const path = "/dereverb";

  const languageAlternates = Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}${path}`])) as Record<
    string,
    string
  >;

  const copyByLocale: Record<Locale, { title: string; description: string; keywords: string[] }> = {
    zh: {
      title: "在线去混响工具",
      description: "在线去混响工具，智能降低房间混响与尾音，保留清晰干声。",
      keywords: ["去混响", "人声去混响", "降混响", "去混响在线", "免费去混响"],
    },
    en: {
      title: "Online Dereverb Tool",
      description: "Online dereverb tool to reduce room reverb and tail while keeping vocals clear.",
      keywords: ["dereverb", "reverb removal", "vocal cleanup", "ai audio", "online dereverb"],
    },
    ja: {
      title: "オンライン・リバーブ除去ツール",
      description: "オンラインでリバーブを低減し、声の明瞭さを保ちます。",
      keywords: ["リバーブ除去", "残響除去", "ボーカル補正", "音声処理", "オンライン"],
    },
    ko: {
      title: "온라인 디리버브 도구",
      description: "온라인에서 방 잔향과 꼬리 리버브를 줄이고 보컬을 더 선명하게 만듭니다.",
      keywords: ["디리버브", "리버브 제거", "보컬 정리", "AI 오디오", "온라인 디리버브"],
    },
    ru: {
      title: "Онлайн-инструмент для удаления реверберации",
      description: "Снижайте комнатную реверберацию и хвосты, сохраняя голос чистым.",
      keywords: ["dereverb", "удаление реверберации", "очистка вокала", "ai аудио", "онлайн dereverb"],
    },
    de: {
      title: "Online-Dereverb-Tool",
      description: "Reduziere Raumhall und Nachhall, während Vocals klar bleiben.",
      keywords: ["dereverb", "hall entfernen", "vocal cleanup", "ki audio", "online dereverb"],
    },
    pt: {
      title: "Ferramenta online de dereverb",
      description: "Reduza a reverberação do ambiente e a cauda mantendo os vocais claros.",
      keywords: ["dereverb", "remoção de reverb", "limpeza vocal", "áudio IA", "dereverb online"],
    },
    it: {
      title: "Strumento dereverb online",
      description: "Riduci riverbero ambientale e code mantenendo la voce nitida.",
      keywords: ["dereverb", "rimozione riverbero", "pulizia voce", "audio AI", "dereverb online"],
    },
    ar: {
      title: "أداة إزالة الصدى عبر الإنترنت",
      description: "قلّل صدى الغرفة والنهايات مع الحفاظ على وضوح الغناء.",
      keywords: ["إزالة الصدى", "إزالة الريفيرب", "تنقية الغناء", "صوت بالذكاء الاصطناعي", "إزالة الصدى عبر الإنترنت"],
    },
    es: {
      title: "Herramienta de dereverb online",
      description: "Reduce la reverberación de sala y las colas manteniendo la voz clara.",
      keywords: ["dereverb", "eliminar reverb", "limpieza vocal", "audio IA", "dereverb online"],
    },
    fr: {
      title: "Outil dereverb en ligne",
      description: "Réduisez la réverbération de pièce et les queues tout en gardant la voix claire.",
      keywords: ["dereverb", "suppression de réverb", "nettoyage vocal", "audio IA", "dereverb en ligne"],
    },
  };

  const copy = copyByLocale[locale];
  const fullTitle = `${copy.title} - Demixr.com`;

  return {
    title: copy.title,
    description: copy.description,
    keywords: copy.keywords,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: languageAlternates,
    },
    openGraph: {
      title: fullTitle,
      description: copy.description,
      url: `${siteUrl}/${locale}${path}`,
      siteName: "demixr",
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: copy.description,
    },
  };
}

export default async function DereverbPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = locales.includes(lang as Locale) ? (lang as Locale) : defaultLocale;
  const dictionary = getDictionary(locale);

  return <DereverbHero dictionary={dictionary} locale={locale} />;
}

