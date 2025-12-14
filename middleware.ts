import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "./i18n/config";

const LOCALE_COOKIE = "demixr_locale";

function detectLocaleFromAcceptLanguage(header: string | null) {
  if (!header) return defaultLocale;

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
    if (lang.startsWith("zh")) return "zh";
    if (lang.startsWith("ja")) return "ja";
    if (lang.startsWith("en")) return "en";
  }
  return defaultLocale;
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

  if (locales.includes(localeFromPath as (typeof locales)[number])) {
    const current = String(localeFromPath);
    const existing = request.cookies.get(LOCALE_COOKIE)?.value;
    if (existing === current) return NextResponse.next();
    const res = NextResponse.next();
    res.cookies.set(LOCALE_COOKIE, current, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return res;
  }

  const remembered = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale =
    remembered && locales.includes(remembered as (typeof locales)[number])
      ? (remembered as (typeof locales)[number])
      : detectLocaleFromAcceptLanguage(request.headers.get("accept-language"));

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
