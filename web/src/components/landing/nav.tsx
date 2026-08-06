"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useTranslations } from "next-intl";

export function Nav() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  // hero is dark — default dark until first light section scrolls in
  const [onDark, setOnDark] = useState(true);

  const NAV_LINKS = [
    { label: t("howItWorks"), href: "/#how-it-works" },
    { label: t("forDealers"), href: "/for-dealers" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-driven nav theme: the section under the nav (60px line) controls
  // the color. Live rects instead of ScrollTrigger positions — the pinned
  // HowItWorks scene inserts a pin-spacer that makes cached positions stale.
  useEffect(() => {
    const NAV_H = 60;
    let raf = 0;
    const update = () => {
      raf = 0;
      let dark = true; // hero (dark) is the top of every landing page
      document.querySelectorAll<HTMLElement>("[data-nav-theme]").forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top <= NAV_H && r.bottom > NAV_H) {
          dark = s.dataset.navTheme === "dark";
        }
      });
      setOnDark(dark);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <motion.header
        className={[
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          scrolled
            ? onDark
              ? "bg-[oklch(0.10_0.01_27)]/80 backdrop-blur-xl border-b border-white/[0.08]"
              : "bg-white/85 backdrop-blur-xl border-b border-black/5 shadow-sm"
            : "bg-transparent",
        ].join(" ")}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className={[
            "max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between transition-[height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            scrolled ? "h-14" : "h-16",
          ].join(" ")}
        >
          <a href="/">
            <Logo dark={onDark} />
          </a>

          <nav className="hidden md:flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onMouseEnter={() => setHovered(link.href)}
                className={[
                  "relative px-3.5 py-2 text-[14px] font-medium transition-colors duration-200",
                  onDark
                    ? "text-white/60 hover:text-white"
                    : "text-[var(--ink-500)] hover:text-[var(--ink-900)]",
                ].join(" ")}
              >
                {hovered === link.href && (
                  <motion.span
                    layoutId="nav-pill"
                    className={[
                      "absolute inset-0 -z-10 rounded-lg",
                      onDark ? "bg-white/[0.07]" : "bg-[var(--surface-2)]",
                    ].join(" ")}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <LocaleSwitcher dark={onDark} />
            <a
              href="/login"
              className={[
                "text-[13px] font-medium transition-colors px-3 py-1.5",
                onDark
                  ? "text-white/50 hover:text-white"
                  : "text-[oklch(0.400_0.010_27.0)] hover:text-[oklch(0.112_0.012_27.0)]",
              ].join(" ")}
            >
              {t("login")}
            </a>
            <a
              href="/buyer/requests/new"
              className="btn-lift rounded-lg bg-[var(--red)] px-4 py-2 text-[13px] font-semibold text-white shadow-[var(--shadow-red)] transition-colors duration-150 hover:bg-[oklch(0.470_0.225_27.3)]"
            >
              {t("findMyCar")}
            </a>
          </div>

          <button
            className={[
              "md:hidden p-2 cursor-pointer transition-colors",
              onDark ? "text-white/60 hover:text-white" : "text-[oklch(0.400_0.010_27.0)]",
            ].join(" ")}
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
            className={[
              "fixed top-16 inset-x-0 z-40 backdrop-blur-xl border-b shadow-lg md:hidden",
              onDark
                ? "bg-[oklch(0.10_0.01_27)]/95 border-white/[0.08]"
                : "bg-white/95 border-black/5",
            ].join(" ")}
          >
            <div className="px-6 py-6 space-y-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    "block text-[16px] py-1",
                    onDark ? "text-white/85" : "text-[oklch(0.250_0.010_27.0)]",
                  ].join(" ")}
                >
                  {link.label}
                </a>
              ))}
              <div
                className={[
                  "pt-4 border-t space-y-3",
                  onDark ? "border-white/[0.08]" : "border-[oklch(0.920_0.006_27.0)]",
                ].join(" ")}
              >
                <div className="py-1">
                  <LocaleSwitcher dark={onDark} />
                </div>
                <a
                  href="/login"
                  className={[
                    "block text-[15px]",
                    onDark ? "text-white/55" : "text-[oklch(0.400_0.010_27.0)]",
                  ].join(" ")}
                >
                  {t("login")}
                </a>
                <a
                  href="/buyer/requests/new"
                  className="block w-full text-center px-4 py-3 bg-[oklch(0.448_0.228_27.3)] text-white text-[14px] font-medium rounded-xl"
                >
                  {t("findMyCar")} →
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
