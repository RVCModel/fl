import type { Metadata } from "next";
import { defaultLocale, Locale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import VadHero from "@/components/vad-hero";

type PageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = locales.includes(lang as Locale) ? (lang as Locale) : defaultLocale;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://demixr.com";
  const path = "/vad";

  const languageAlternates = Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}${path}`])) as Record<
    string,
    string
  >;

  const copyByLocale: Partial<Record<Locale, { title: string; description: string; keywords: string[] }>> = {
    zh: {
      title: "VAD 语音标记",
      description: "上传音频后自动标记人声说话区间。",
      keywords: ["VAD", "语音标记", "人声检测", "音频分段"],
    },
    en: {
      title: "VAD Speech Marker",
      description: "Upload audio and detect speech segments.",
      keywords: ["VAD", "speech detection", "audio markers", "voice activity"],
    },
  };

  const copy = copyByLocale[locale] ?? copyByLocale.en!;
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

export default async function VadPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = locales.includes(lang as Locale) ? (lang as Locale) : defaultLocale;
  const dictionary = getDictionary(locale);

  return <VadHero dictionary={dictionary} locale={locale} />;
}
