import { defaultLocale, Locale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import UploadHero from "@/components/upload-hero";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = locales.includes(lang as Locale) ? (lang as Locale) : defaultLocale;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://demixr.com";

  const languageAlternates = Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}`])) as Record<
    string,
    string
  >;

  const copyByLocale: Record<Locale, { title: string; description: string; keywords: string[] }> = {
    zh: {
      title: "在线人声分离网站",
      description: "Demixr 是一个在线人声分离网站，并支持去混响与 BPM/调性（Camelot）查询。",
      keywords: ["人声分离", "去混响", "去人声", "免费分离", "伴奏分离"],
    },
    en: {
      title: "Online Vocal Separation Tool",
      description: "Demixr is an online vocal separation tool with dereverb and BPM/key (Camelot) detection.",
      keywords: ["vocal separation", "dereverb", "vocal remover", "free separation", "instrumental extraction"],
    },
    ja: {
      title: "オンラインボーカル分離ツール",
      description: "Demixrはオンラインのボーカル分離ツールで、リバーブ除去とBPM/キー（Camelot）解析にも対応します。",
      keywords: ["ボーカル分離", "リバーブ除去", "ボーカル除去", "無料分離", "伴奏分離"],
    },
    ko: {
      title: "온라인 보컬 분리 도구",
      description: "Demixr는 온라인 보컬 분리 도구로, 디리버브와 BPM/키(Camelot) 분석도 지원합니다.",
      keywords: ["보컬 분리", "디리버브", "보컬 리무버", "무료 분리", "반주 추출"],
    },
    ru: {
      title: "Онлайн-сервис для отделения вокала",
      description: "Demixr — онлайн-инструмент для отделения вокала с удалением реверберации и определением BPM/тона (Camelot).",
      keywords: ["разделение вокала", "удаление реверберации", "удаление вокала", "бесплатное разделение", "инструментал"],
    },
    de: {
      title: "Online-Tool zur Vocal-Trennung",
      description: "Demixr ist ein Online-Tool zur Vocal-Trennung mit Dereverb sowie BPM/Tonart (Camelot)-Analyse.",
      keywords: ["Vocal Separation", "Dereverb", "Vocal Remover", "kostenlos trennen", "Instrumental extrahieren"],
    },
    pt: {
      title: "Ferramenta online de separação vocal",
      description: "O Demixr é uma ferramenta online para separar vocais, com dereverb e detecção de BPM/tom (Camelot).",
      keywords: ["separação vocal", "dereverb", "removedor de voz", "separação grátis", "instrumental"],
    },
    it: {
      title: "Strumento online per separare la voce",
      description: "Demixr è uno strumento online per separare la voce, con dereverb e analisi BPM/tonalità (Camelot).",
      keywords: ["separazione voce", "dereverb", "rimozione voce", "separazione gratis", "strumentale"],
    },
    ar: {
      title: "أداة فصل الغناء عبر الإنترنت",
      description: "Demixr أداة عبر الإنترنت لفصل الغناء، مع إزالة الصدى وتحليل BPM/المقام (Camelot).",
      keywords: ["فصل الغناء", "إزالة الصدى", "إزالة الصوت", "فصل مجاني", "موسيقى بدون غناء"],
    },
    es: {
      title: "Herramienta online de separación vocal",
      description: "Demixr es una herramienta online para separar voces con dereverb y detección de BPM/tonalidad (Camelot).",
      keywords: ["separación vocal", "dereverb", "eliminar voz", "separación gratis", "instrumental"],
    },
    fr: {
      title: "Outil en ligne de séparation vocale",
      description: "Demixr est un outil en ligne pour séparer la voix, avec dereverb et détection BPM/tonalité (Camelot).",
      keywords: ["séparation vocale", "dereverb", "suppression de voix", "séparation gratuite", "instrumental"],
    },
  };

  const copy = copyByLocale[locale];
  const fullTitle = `${copy.title} - Demixr.com`;

  return {
    title: copy.title,
    description: copy.description,
    keywords: copy.keywords,
    alternates: {
      canonical: `/${locale}`,
      languages: languageAlternates,
    },
    openGraph: {
      title: fullTitle,
      description: copy.description,
      url: `${siteUrl}/${locale}`,
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

export default async function HomePage({ params }: PageProps) {
  const { lang } = await params;
  const locale = locales.includes(lang as Locale)
    ? (lang as Locale)
    : defaultLocale;
  const dictionary = getDictionary(locale);

  return (
    <UploadHero dictionary={dictionary} locale={locale} />
  );
}
