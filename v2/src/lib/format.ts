import type { Locale } from "./i18n/ui";

// Swiss French/Italian format prices the same way German-CH does on this
// platform: apostrophe thousands separator, no decimals for whole francs.
// de-CH → "CHF 38'500". We normalise all locales to the Swiss convention.
const CHF = new Intl.NumberFormat("de-CH", {
  style: "currency",
  currency: "CHF",
  maximumFractionDigits: 0,
});

/** Format a whole-franc amount as e.g. `CHF 38'500`. */
export function chf(amount: number): string {
  return CHF.format(amount);
}

/** Franc amount without the currency word, e.g. `38'500` — for large displays. */
export function chfValue(amount: number): string {
  return new Intl.NumberFormat("de-CH", { maximumFractionDigits: 0 }).format(amount);
}

/** Relative "x min ago" style stamps, localised. */
const RELATIVE: Record<Locale, Intl.RelativeTimeFormat> = {
  en: new Intl.RelativeTimeFormat("en", { numeric: "auto" }),
  de: new Intl.RelativeTimeFormat("de-CH", { numeric: "auto" }),
  fr: new Intl.RelativeTimeFormat("fr-CH", { numeric: "auto" }),
  it: new Intl.RelativeTimeFormat("it-CH", { numeric: "auto" }),
};

export function minutesAgo(minutes: number, locale: Locale = "en"): string {
  return RELATIVE[locale].format(-minutes, "minute");
}
