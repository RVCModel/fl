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

  return {
    title: "demixr",
    description: dictionary.tagline,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        zh: `${siteUrl}/zh`,
        en: `${siteUrl}/en`,
        ja: `${siteUrl}/ja`,
      },
    },
    openGraph: {
      type: "website",
      siteName: "demixr",
      title: "demixr",
      description: dictionary.tagline,
      url: `${siteUrl}/${locale}`,
      locale,
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
