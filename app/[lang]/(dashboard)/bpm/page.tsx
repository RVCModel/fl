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

  const zh = {
    title: "在线BPM查询与调号（Camelot）分析",
    description: "在线查询音乐BPM、调式与Camelot值，适合DJ编曲与混音参考。",
    keywords: ["BPM查询", "音乐调", "Camelot", "节拍检测", "调号检测"],
  };
  const en = {
    title: "Online BPM & Key (Camelot) Finder",
    description: "Find BPM, musical key and Camelot value online for DJing, remixing and mixing.",
    keywords: ["bpm finder", "key finder", "camelot wheel", "beat detection", "music analysis"],
  };
  const ja = {
    title: "オンラインBPM・キー（Camelot）解析",
    description: "BPM・キー（調）・Camelotをオンラインで解析し、DJや制作に役立てます。",
    keywords: ["BPM解析", "キー検出", "Camelot", "ビート検出", "音楽解析"],
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

export default async function BpmPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = locales.includes(lang as Locale)
    ? (lang as Locale)
    : defaultLocale;
  const dictionary = getDictionary(locale);

  return <BpmHero dictionary={dictionary} locale={locale} />;
}
