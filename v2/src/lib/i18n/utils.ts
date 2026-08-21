import { ui, defaultLocale, type Locale, type UIKey } from "./ui";

/** Read the active locale from the URL (`/de`, `/fr`, `/it`, else default en). */
export function getLangFromUrl(url: URL): Locale {
  const [, seg] = url.pathname.split("/");
  if (seg === "de" || seg === "fr" || seg === "it") return seg;
  return defaultLocale;
}

/** Bound translator for a locale: `t("hero.h1.line1")`. Falls back to German. */
export function useTranslations(locale: Locale) {
  return function t(key: UIKey): string {
    return ui[locale][key] ?? ui[defaultLocale][key];
  };
}

/** Prefix a path with the locale segment (default locale stays unprefixed). */
export function localizedPath(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return locale === defaultLocale ? clean : `/${locale}${clean}`;
}

/** Same page, different locale: strip the current locale prefix and apply the target. */
export function switchLocalePath(url: URL, locale: Locale): string {
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments[0] === "de" || segments[0] === "fr" || segments[0] === "it") segments.shift();
  const rest = segments.length ? `/${segments.join("/")}` : "/";
  return localizedPath(rest, locale);
}

export const localeList: Locale[] = ["en", "de", "fr", "it"];
