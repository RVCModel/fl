export const locales = ["zh", "en", "ja", "ko", "ru", "de", "pt", "it", "ar", "es", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "zh";
