import { LocaleProvider } from "@/components/locale-provider";
import { defaultLocale, Locale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = locales.includes(lang as Locale) ? (lang as Locale) : defaultLocale;
  const dictionary = getDictionary(locale);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://demixr.com";

  const languageAlternates = Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}`])) as Record<
    string,
    string
  >;

  const baseTitleByLocale: Record<Locale, string> = {
    zh: "在线人声分离网站",
    en: "Online Vocal Separation Website",
    ja: "オンラインボーカル分離サイト",
    ko: "온라인 보컬 분리 웹사이트",
    ru: "Онлайн-сервис для отделения вокала",
    de: "Online-Website zur Vocal-Trennung",
    pt: "Site de separação vocal online",
    it: "Sito di separazione vocale online",
    ar: "موقع فصل الغناء عبر الإنترنت",
    es: "Sitio web de separación vocal en línea",
    fr: "Site de séparation vocale en ligne",
  };
  const baseTitle = baseTitleByLocale[locale];
  const fullBaseTitle = `${baseTitle} - Demixr.com`;

  return {
    title: {
      default: baseTitle,
      template: "%s - Demixr.com",
    },
    description: dictionary.tagline,
    alternates: {
      canonical: `/${locale}`,
      languages: languageAlternates,
    },
    openGraph: {
      type: "website",
      siteName: "demixr",
      title: fullBaseTitle,
      description: dictionary.tagline,
      url: `${siteUrl}/${locale}`,
      locale,
    },
    twitter: {
      card: "summary_large_image",
      title: fullBaseTitle,
      description: dictionary.tagline,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = locales.includes(lang as Locale) ? (lang as Locale) : null;

  if (!locale) {
    redirect(`/${defaultLocale}`);
  }

  const dictionary = getDictionary(locale ?? defaultLocale);

  return (
    <LocaleProvider locale={locale ?? defaultLocale} dictionary={dictionary}>
      {children}
    </LocaleProvider>
  );
}
