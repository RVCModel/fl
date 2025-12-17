import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { locales } from "@/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const languageAlternates = Object.fromEntries(locales.map((locale) => [locale, `/${locale}`])) as Record<
  string,
  string
>;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://demixr.com"),
  title: {
    default: "Demixr.com",
    template: "%s - Demixr.com",
  },
  description: "AI audio tools: demix vocals/instrumental, dereverb, and BPM/key/Camelot detection.",
  applicationName: "Demixr.com",
  alternates: {
    canonical: "/",
    languages: languageAlternates,
  },
  openGraph: {
    type: "website",
    siteName: "demixr",
    title: "Demixr.com",
    description: "AI audio tools: demix vocals/instrumental, dereverb, and BPM/key/Camelot detection.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Demixr.com",
    description: "AI audio tools: demix vocals/instrumental, dereverb, and BPM/key/Camelot detection.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>
      </body>
    </html>
  );
}
