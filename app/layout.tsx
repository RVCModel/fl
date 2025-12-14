import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://demixr.com"),
  title: {
    default: "Demixr.com",
    template: "%s-Demixr.com",
  },
  description: "AI audio tools: demix vocals/instrumental, dereverb, and BPM/key/Camelot detection.",
  applicationName: "Demixr.com",
  alternates: {
    canonical: "/",
    languages: {
      zh: "/zh",
      en: "/en",
      ja: "/ja",
    },
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
