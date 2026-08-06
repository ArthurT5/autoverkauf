"use server";

import { cookies } from "next/headers";
import { COOKIE_NAME, defaultLocale, locales, type Locale } from "./config";

// The active locale is stored in a cookie, so every language shares one URL.
export async function getUserLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  return value && locales.includes(value as Locale) ? (value as Locale) : defaultLocale;
}

export async function setUserLocale(locale: Locale): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // one year
    sameSite: "lax",
  });
}
