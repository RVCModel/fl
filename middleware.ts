import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "./i18n/config";

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
    return;
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
