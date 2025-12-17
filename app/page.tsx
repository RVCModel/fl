import { redirect } from "next/navigation";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import { headers } from "next/headers";

function isLocale(value: string | null | undefined): value is Locale {
  return !!value && locales.includes(value as Locale);
}

export default async function Home() {
  const headerList = await headers();
  const acceptLanguage = headerList.get("accept-language");
  const userAgent = (headerList.get("user-agent") || "").toLowerCase();

  const fromAcceptLanguage = (() => {
    if (!acceptLanguage) return null;
    const items = acceptLanguage
      .split(",")
      .map((raw) => raw.trim())
      .filter(Boolean)
      .map((part) => {
        const [langRaw, ...params] = part.split(";").map((x) => x.trim());
        const qParam = params.find((p) => p.startsWith("q="));
        const q = qParam ? Number(qParam.slice(2)) : 1;
        return { lang: (langRaw || "").toLowerCase(), q: Number.isFinite(q) ? q : 0 };
      })
      .sort((a, b) => b.q - a.q);
    for (const { lang } of items) {
      const normalized = lang.replace(/_/g, "-");
      const primary = normalized.split("-")[0];
      if (isLocale(primary)) return primary;
    }
    return null;
  })();

  const fromBotUa = (() => {
    if (!userAgent) return null;
    if (
      userAgent.includes("baiduspider") ||
      userAgent.includes("sogou") ||
      userAgent.includes("360spider") ||
      userAgent.includes("bytespider") ||
      userAgent.includes("yisouspider")
    ) {
      return "zh";
    }
    if (
      userAgent.includes("googlebot") ||
      userAgent.includes("bingbot") ||
      userAgent.includes("duckduckbot") ||
      userAgent.includes("yandexbot") ||
      userAgent.includes("slurp")
    ) {
      return "en";
    }
    return null;
  })();

  redirect(`/${fromAcceptLanguage || fromBotUa || defaultLocale}`);
}
