"use client";

import { useTranslations } from "next-intl";
import { Logo } from "@/components/logo";

export function Footer() {
  const t = useTranslations("footer");

  const COLUMNS = [
    {
      heading: t("forBuyers"),
      links: [
        { label: t("howItWorks"), href: "/#how-it-works" },
        { label: t("findYourCar"), href: "/buyer/requests/new" },
      ],
    },
    {
      heading: t("forDealers"),
      links: [
        { label: t("registerDealer"), href: "/dealer/signup" },
        { label: t("dealerLogin"), href: "/login" },
      ],
    },
    {
      heading: t("company"),
      links: [
        { label: t("about"), href: "/about" },
        { label: t("contact"), href: "/contact" },
        { label: t("privacy"), href: "/privacy" },
        { label: t("terms"), href: "/terms" },
      ],
    },
  ];

  return (
    <footer data-nav-theme="dark" className="grain relative overflow-hidden bg-[var(--surface-ink)] text-white">
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-2 gap-10 border-b border-white/10 pb-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Logo dark />
            <p className="mt-4 max-w-[220px] text-[13px] leading-relaxed text-white/55">
              {t("tagline")}
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="mb-4 text-[12px] font-semibold text-white/40">{col.heading}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[13.5px] text-white/65 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 text-[12px] text-white/40">
          © {new Date().getFullYear()} AutoVerkauf · {t("rights")}
        </div>
      </div>
    </footer>
  );
}
