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

  const zh = {
    title: "在线去混响工具",
    description: "在线去混响工具，智能降低房间混响与尾音，保留清晰干声。",
    keywords: ["去混响", "人声去混响", "降混响", "去混响在线", "免费去混响"],
  };
  const en = {
    title: "Online Dereverb Tool",
    description: "Online dereverb tool to reduce room reverb and tail while keeping vocals clear.",
    keywords: ["dereverb", "reverb removal", "vocal cleanup", "ai audio", "online dereverb"],
  };
  const ja = {
    title: "オンライン・リバーブ除去ツール",
    description: "オンラインでリバーブを低減し、声の明瞭さを保ちます。",
    keywords: ["リバーブ除去", "残響除去", "ボーカル補正", "音声処理", "オンライン"],
  };
  const copy = locale === "en" ? en : locale === "ja" ? ja : zh;
  const fullTitle = `${copy.title}-Demixr.com`;

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

export default async function DereverbPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = locales.includes(lang as Locale)
    ? (lang as Locale)
    : defaultLocale;
  const dictionary = getDictionary(locale);

  return <DereverbHero dictionary={dictionary} locale={locale} />;
}
