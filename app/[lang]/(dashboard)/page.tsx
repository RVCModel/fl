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

  const zh = {
    title: "在线人声分离网站",
    description: "Demixr是一个在线人声分离网站，并且支持人声去混响以及bpm在线查询。",
    keywords: ["人声分离", "去混响", "去人声", "免费分离", "伴奏分离"],
  };
  const en = {
    title: "Online Vocal Separation Tool",
    description:
      "Demixr is an online vocal separation tool with dereverb and BPM/key (Camelot) detection.",
    keywords: ["vocal separation", "dereverb", "vocal remover", "free separation", "instrumental extraction"],
  };
  const ja = {
    title: "オンラインボーカル分離ツール",
    description:
      "Demixrはオンラインのボーカル分離サイトで、リバーブ除去とBPM/キー（Camelot）解析にも対応します。",
    keywords: ["ボーカル分離", "リバーブ除去", "ボーカル除去", "無料分離", "伴奏分離"],
  };

  const copy = locale === "en" ? en : locale === "ja" ? ja : zh;
  const fullTitle = `${copy.title}-Demixr.com`;

  return {
    title: copy.title,
    description: copy.description,
    keywords: copy.keywords,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        zh: `${siteUrl}/zh`,
        en: `${siteUrl}/en`,
        ja: `${siteUrl}/ja`,
      },
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
