export const locales = ["de", "fr", "it", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "de";

export const localeLabels: Record<Locale, string> = {
  de: "DE",
  fr: "FR",
  it: "IT",
  en: "EN",
};

export const COOKIE_NAME = "NEXT_LOCALE";
