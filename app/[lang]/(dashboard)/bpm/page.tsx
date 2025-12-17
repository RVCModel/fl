import { defaultLocale, Locale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import BpmHero from "@/components/bpm-hero";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = locales.includes(lang as Locale) ? (lang as Locale) : defaultLocale;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://demixr.com";
  const path = "/bpm";

  const languageAlternates = Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}${path}`])) as Record<
    string,
    string
  >;

  const copyByLocale: Record<Locale, { title: string; description: string; keywords: string[] }> = {
    zh: {
      title: "在线 BPM 与调性（Camelot）查询",
      description: "在线检测歌曲 BPM、调性与 Camelot 值，适合 DJ、混音与编曲。",
      keywords: ["BPM 查询", "调性查询", "Camelot", "节拍检测", "音乐分析"],
    },
    en: {
      title: "Online BPM & Key (Camelot) Finder",
      description: "Find BPM, musical key and Camelot value online for DJing, remixing and mixing.",
      keywords: ["bpm finder", "key finder", "camelot wheel", "beat detection", "music analysis"],
    },
    ja: {
      title: "オンラインBPM・キー（Camelot）解析",
      description: "曲のBPM、キー、Camelotをオンラインで解析。DJ、リミックス、ミキシングに便利。",
      keywords: ["BPM解析", "キー解析", "Camelot", "ビート検出", "音楽解析"],
    },
    ko: {
      title: "온라인 BPM 및 키(Camelot) 찾기",
      description: "DJ, 리믹스, 믹싱을 위해 BPM, 키와 Camelot 값을 온라인에서 분석합니다.",
      keywords: ["bpm 찾기", "키 찾기", "camelot 휠", "비트 감지", "음악 분석"],
    },
    ru: {
      title: "Онлайн-определение BPM и тональности (Camelot)",
      description: "Определяйте BPM, тональность и значение Camelot онлайн для DJ-сетов, ремиксов и сведения.",
      keywords: ["поиск bpm", "поиск тональности", "camelot", "определение ритма", "анализ музыки"],
    },
    de: {
      title: "Online BPM- & Tonart-(Camelot)-Finder",
      description: "Finde BPM, Tonart und Camelot-Wert online – ideal für DJing, Remixes und Mixing.",
      keywords: ["bpm finder", "tonart finder", "camelot wheel", "beat detection", "musik analyse"],
    },
    pt: {
      title: "Encontrar BPM e tom (Camelot) online",
      description: "Encontre BPM, tom musical e valor Camelot online para DJ, remixes e mixagem.",
      keywords: ["encontrar bpm", "encontrar tom", "camelot", "detecção de batida", "análise musical"],
    },
    it: {
      title: "Trova BPM e tonalità (Camelot) online",
      description: "Trova BPM, tonalità musicale e valore Camelot online per DJ, remix e mixaggio.",
      keywords: ["trova bpm", "trova tonalità", "camelot", "rilevamento beat", "analisi musica"],
    },
    ar: {
      title: "اكتشاف BPM والمقام (Camelot) عبر الإنترنت",
      description: "اكتشف BPM والمقام وقيمة Camelot عبر الإنترنت لأعمال DJ والريمكس والمكساج.",
      keywords: ["اكتشاف bpm", "اكتشاف المقام", "camelot", "اكتشاف الإيقاع", "تحليل الموسيقى"],
    },
    es: {
      title: "Buscador online de BPM y tonalidad (Camelot)",
      description: "Encuentra BPM, tonalidad musical y valor Camelot online para DJ, remezclas y mezcla.",
      keywords: ["buscador bpm", "buscador tonalidad", "camelot", "detección de ritmo", "análisis musical"],
    },
    fr: {
      title: "Détecteur BPM & tonalité (Camelot) en ligne",
      description: "Trouvez le BPM, la tonalité et la valeur Camelot en ligne pour DJ, remix et mixage.",
      keywords: ["détecteur bpm", "détecteur tonalité", "camelot", "détection de rythme", "analyse musicale"],
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

export default async function BpmPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = locales.includes(lang as Locale) ? (lang as Locale) : defaultLocale;
  const dictionary = getDictionary(locale);

  return <BpmHero dictionary={dictionary} locale={locale} />;
}

