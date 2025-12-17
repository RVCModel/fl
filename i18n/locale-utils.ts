import { defaultLocale, Locale, locales } from "./config";

export type LocaleMap<T> = Record<Locale, T>;

export function normalizeLocale(input: unknown): Locale {
  const value = String(input ?? "").toLowerCase();
  return (locales as readonly string[]).includes(value) ? (value as Locale) : defaultLocale;
}

export function pickLocale<T>(locale: unknown, map: LocaleMap<T>): T {
  return map[normalizeLocale(locale)];
}

