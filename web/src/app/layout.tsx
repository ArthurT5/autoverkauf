import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { LenisProvider } from "@/components/motion/lenis-provider";
import { Preloader } from "@/components/motion/preloader";
import { RouteTransition } from "@/components/motion/route-transition";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("hero");
  return {
    title: "AutoVerkauf — Stop searching. Dealers come to you.",
    description: t("subtitle"),
  };
}

const HTML_LANG: Record<string, string> = {
  de: "de-CH",
  fr: "fr-CH",
  it: "it-CH",
  en: "en",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={HTML_LANG[locale] ?? "de-CH"}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <LenisProvider>
            <Preloader />
            <RouteTransition>{children}</RouteTransition>
          </LenisProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
