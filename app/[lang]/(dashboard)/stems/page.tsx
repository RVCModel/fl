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

  const zh = {
    title: "在线乐器分离（四轨）",
    description: "在线将音乐分离为人声、鼓、贝斯与其他四个轨道，适合混音与编曲。",
    keywords: ["乐器分离", "四轨分离", "Demucs", "人声鼓贝斯", "在线分离"],
  };
  const en = {
    title: "Online 4-Stem Instrument Separator",
    description: "Separate music into vocals, drums, bass and other online with Demucs.",
    keywords: ["instrument separation", "4 stems", "demucs", "vocals drums bass", "online separator"],
  };
  const ja = {
    title: "オンライン楽器分離（4トラック）",
    description: "Demucsでボーカル/ドラム/ベース/その他の4トラックに分離します。",
    keywords: ["楽器分離", "4トラック", "Demucs", "ボーカル分離", "オンライン"],
  };
  const copy = locale === "en" ? en : locale === "ja" ? ja : zh;
  const fullTitle = `${copy.title} - Demixr.com`;

  return {
    title: copy.title,
    description: copy.description,
    keywords: copy.keywords,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: {
        zh: `${siteUrl}/zh${path}`,
        en: `${siteUrl}/en${path}`,
        ja: `${siteUrl}/ja${path}`,
      },
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

