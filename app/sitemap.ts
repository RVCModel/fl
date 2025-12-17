import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://demixr.com";
  const now = new Date();
  const supportedLocales = locales;

  const paths = [
    "", // demix home
    "/dereverb",
    "/bpm",
    "/stems",
  ];

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of supportedLocales) {
    for (const path of paths) {
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: path === "" ? 1 : 0.8,
      });
    }
  }

  return entries;
}
