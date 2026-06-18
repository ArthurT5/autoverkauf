"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_LABELS: Record<string, string> = {
  de: "DE",
  fr: "FR",
  it: "IT",
  en: "EN",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (next: string) => {
    if (next === locale) return;

    // Replace the current locale prefix in the pathname
    const segments = pathname.split("/");
    const isLocaleSegment = routing.locales.includes(segments[1] as "de" | "fr" | "it" | "en");

    let newPath: string;
    if (isLocaleSegment) {
      segments[1] = next === routing.defaultLocale ? "" : next;
      newPath = segments.filter(Boolean).join("/");
      newPath = newPath ? `/${newPath}` : "/";
    } else {
      newPath = next === routing.defaultLocale ? pathname : `/${next}${pathname}`;
    }

    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-[oklch(0.910_0.008_27.0)] p-0.5">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={[
            "px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all duration-150 cursor-pointer tracking-wide",
            l === locale
              ? "bg-[oklch(0.112_0.012_27.0)] text-white"
              : "text-[oklch(0.500_0.010_27.0)] hover:text-[oklch(0.200_0.012_27.0)]",
          ].join(" ")}
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
