"use client";

import { useEffect, useState } from "react";
import { defaultLocale, Locale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { SupportTickets } from "@/components/support-tickets";

type PageProps = {
  params: Promise<{ lang: string }>;
};

export default function TicketsManagePage({ params }: PageProps) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [dictionary, setDictionary] = useState(getDictionary(defaultLocale));

  useEffect(() => {
    params.then(({ lang }) => {
      const nextLocale = locales.includes(lang as Locale) ? (lang as Locale) : defaultLocale;
      setLocale(nextLocale);
      setDictionary(getDictionary(nextLocale));
    });
  }, [params]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 lg:px-10">
      <SupportTickets dictionary={dictionary} locale={locale} mode="admin" />
    </div>
  );
}
