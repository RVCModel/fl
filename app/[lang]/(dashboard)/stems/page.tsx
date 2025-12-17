import { defaultLocale, Locale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import DemucsHero from "@/components/demucs-hero";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = locales.includes(lang as Locale) ? (lang as Locale) : defaultLocale;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://demixr.com";
  const path = "/stems";

  const languageAlternates = Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}${path}`])) as Record<
    string,
    string
  >;

  const copyByLocale: Record<Locale, { title: string; description: string; keywords: string[] }> = {
    zh: {
      title: "在线乐器分离（四轨）",
      description: "在线将音乐分离为人声、鼓、贝斯与其他四个轨道，适合混音与编曲。",
      keywords: ["乐器分离", "四轨分离", "Demucs", "人声鼓贝斯", "在线分离"],
    },
    en: {
      title: "Online 4-Stem Instrument Separator",
      description: "Separate music into vocals, drums, bass and other online with Demucs.",
      keywords: ["instrument separation", "4 stems", "demucs", "vocals drums bass", "online separator"],
    },
    ja: {
      title: "オンライン楽器分離（4トラック）",
      description: "Demucsでボーカル/ドラム/ベース/その他の4トラックに分離します。",
      keywords: ["楽器分離", "4トラック", "Demucs", "ボーカル分離", "オンライン"],
    },
    ko: {
      title: "온라인 악기 분리(4 스템)",
      description: "Demucs로 보컬/드럼/베이스/기타 4개 스템으로 온라인 분리합니다.",
      keywords: ["악기 분리", "4 스템", "demucs", "보컬 드럼 베이스", "온라인 분리"],
    },
    ru: {
      title: "Онлайн-разделение на 4 стема",
      description: "Разделяйте трек на вокал, барабаны, бас и другое онлайн с Demucs.",
      keywords: ["разделение инструментов", "4 стема", "demucs", "вокал барабаны бас", "онлайн разделение"],
    },
    de: {
      title: "Online-4-Stem-Instrumententrenner",
      description: "Trenne Musik online mit Demucs in Vocals, Drums, Bass und Other.",
      keywords: ["instrumententrennung", "4 stems", "demucs", "vocals drums bass", "online separator"],
    },
    pt: {
      title: "Separador de instrumentos em 4 stems online",
      description: "Separe a música em vocais, bateria, baixo e outros online com Demucs.",
      keywords: ["separação de instrumentos", "4 stems", "demucs", "vocais bateria baixo", "separador online"],
    },
    it: {
      title: "Separatore di strumenti online in 4 stem",
      description: "Separa la musica in voce, batteria, basso e altro online con Demucs.",
      keywords: ["separazione strumenti", "4 stem", "demucs", "voce batteria basso", "separatore online"],
    },
    ar: {
      title: "فصل الآلات إلى 4 مسارات عبر الإنترنت",
      description: "افصل الموسيقى إلى غناء وطبول وباص وآخر عبر الإنترنت باستخدام Demucs.",
      keywords: ["فصل الآلات", "4 مسارات", "demucs", "غناء طبول باص", "فصل عبر الإنترنت"],
    },
    es: {
      title: "Separador online de instrumentos en 4 stems",
      description: "Separa música en voz, batería, bajo y otros online con Demucs.",
      keywords: ["separación de instrumentos", "4 stems", "demucs", "voz batería bajo", "separador online"],
    },
    fr: {
      title: "Séparateur d’instruments 4 stems en ligne",
      description: "Séparez la musique en voix, batterie, basse et autres en ligne avec Demucs.",
      keywords: ["séparation d’instruments", "4 stems", "demucs", "voix batterie basse", "séparateur en ligne"],
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

export default async function StemsPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = locales.includes(lang as Locale) ? (lang as Locale) : defaultLocale;
  const dictionary = getDictionary(locale);
  return <DemucsHero dictionary={dictionary} locale={locale} />;
}

