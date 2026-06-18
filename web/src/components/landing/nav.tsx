"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useTranslations, useLocale } from "next-intl";

export function Nav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const prefix = locale === "de" ? "" : `/${locale}`;

  const NAV_LINKS = [
    { label: t("howItWorks"), href: `${prefix}/#how-it-works` },
    { label: t("forDealers"), href: `${prefix}/#dealers` },
    { label: t("earlyAccess"), href: `${prefix}/#testimonials` },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        className={[
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-black/5 shadow-sm"
            : "bg-transparent",
        ].join(" ")}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href={`${prefix}/`}>
            <Logo />
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[14px] text-[oklch(0.400_0.010_27.0)] hover:text-[oklch(0.112_0.012_27.0)] transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <LocaleSwitcher />
            <a
              href={`${prefix}/login`}
              className="text-[13px] font-medium text-[oklch(0.400_0.010_27.0)] hover:text-[oklch(0.112_0.012_27.0)] transition-colors px-3 py-1.5"
            >
              {t("login")}
            </a>
            <a
              href={`${prefix}/buyer/requests/new`}
              className="px-4 py-2 bg-[oklch(0.448_0.228_27.3)] text-white text-[13px] font-medium rounded-lg hover:bg-[oklch(0.400_0.218_27.3)] transition-colors duration-150"
            >
              {t("findMyCar")}
            </a>
          </div>

          <button
            className="md:hidden p-2 text-[oklch(0.400_0.010_27.0)] cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-b border-black/5 shadow-lg md:hidden"
          >
            <div className="px-6 py-6 space-y-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-[16px] text-[oklch(0.250_0.010_27.0)] py-1"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 border-t border-[oklch(0.920_0.006_27.0)] space-y-3">
                <div className="py-1">
                  <LocaleSwitcher />
                </div>
                <a href={`${prefix}/login`} className="block text-[15px] text-[oklch(0.400_0.010_27.0)]">
                  {t("login")}
                </a>
                <a
                  href={`${prefix}/buyer/requests/new`}
                  className="block w-full text-center px-4 py-3 bg-[oklch(0.448_0.228_27.3)] text-white text-[14px] font-medium rounded-xl"
                >
                  {t("findMyCar")} →
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
