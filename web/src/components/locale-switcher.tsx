"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserLocale } from "@/i18n/locale";
import { locales, localeLabels, type Locale } from "@/i18n/config";

export function LocaleSwitcher({ dark = false }: { dark?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onSelect = (next: Locale) => {
    if (next === locale) return;
    startTransition(async () => {
      await setUserLocale(next);
      router.refresh();
    });
  };

  return (
    <div
      className={[
        "flex items-center gap-0.5 rounded-lg border p-0.5 transition-opacity",
        dark ? "border-white/15" : "border-[oklch(0.910_0.008_27.0)]",
        isPending ? "opacity-60" : "",
      ].join(" ")}
    >
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onSelect(l)}
          aria-pressed={l === locale}
          className={[
            "px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all duration-150 cursor-pointer tracking-wide",
            l === locale
              ? dark
                ? "bg-white text-[oklch(0.15_0.012_27.0)]"
                : "bg-[oklch(0.112_0.012_27.0)] text-white"
              : dark
                ? "text-white/50 hover:text-white"
                : "text-[oklch(0.500_0.010_27.0)] hover:text-[oklch(0.200_0.012_27.0)]",
          ].join(" ")}
        >
          {localeLabels[l]}
        </button>
      ))}
    </div>
  );
}
