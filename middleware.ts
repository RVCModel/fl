import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales, type Locale } from "./i18n/config";

const LOCALE_COOKIE = "demixr_locale";

function isLocale(value: string | null | undefined): value is Locale {
  return !!value && locales.includes(value as Locale);
}

function detectLocaleFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;

  const items = header
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
}

function detectLocaleFromUserAgent(userAgent: string | null): Locale | null {
  const ua = String(userAgent || "").toLowerCase();
  if (!ua) return null;

  // China-focused crawlers
  if (
    ua.includes("baiduspider") ||
    ua.includes("sogou") ||
    ua.includes("360spider") ||
    ua.includes("bytespider") ||
    ua.includes("yisouspider")
  ) {
    return "zh";
  }

  // Global crawlers (prefer English)
  if (
    ua.includes("googlebot") ||
    ua.includes("bingbot") ||
    ua.includes("duckduckbot") ||
    ua.includes("yandexbot") ||
    ua.includes("slurp")
  ) {
    return "en";
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes("/fonts") ||
    /\.(.*)$/.test(pathname);

  if (isPublicAsset) {
    return;
  }

  const segments = pathname.split("/").filter(Boolean);
  const localeFromPath = segments[0];

  if (isLocale(localeFromPath)) {
    const current = String(localeFromPath);
    const existing = request.cookies.get(LOCALE_COOKIE)?.value;
    const headers = new Headers(request.headers);
    headers.set("x-demixr-locale", current);
    const res = NextResponse.next({ request: { headers } });
    if (existing === current) return res;
    res.cookies.set(LOCALE_COOKIE, current, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return res;
  }

  const remembered = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(remembered)
    ? remembered
    : detectLocaleFromAcceptLanguage(request.headers.get("accept-language")) ||
      detectLocaleFromUserAgent(request.headers.get("user-agent")) ||
      defaultLocale;

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
  const res = NextResponse.redirect(url);
  res.cookies.set(LOCALE_COOKIE, String(locale), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
