"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

// ─── Animated product demo ─────────────────────────────────────────────────

const ease = [0.16, 1, 0.3, 1] as const;

function RequestPhase() {
  return (
    <motion.div
      key="request"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease }}
      className="space-y-3"
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[oklch(0.500_0.006_27.0)] mb-4">
        Your request
      </p>
      {[
        { label: "Budget", value: "CHF 35,000 – 50,000" },
        { label: "Brand", value: "BMW  ·  Mercedes" },
        { label: "Year", value: "2019 or newer" },
        { label: "Fuel", value: "Diesel  ·  Hybrid" },
        { label: "Canton", value: "Zürich" },
      ].map((row, i) => (
        <motion.div
          key={row.label}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3, ease }}
          className="flex items-center justify-between py-2.5 border-b border-[oklch(0.920_0.004_27.0)] last:border-0"
        >
          <span className="text-[12px] text-[oklch(0.580_0.006_27.0)]">{row.label}</span>
          <span className="text-[13px] font-medium text-[oklch(0.150_0.012_27.0)]">{row.value}</span>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.38, duration: 0.3, ease }}
        className="mt-4 w-full py-2.5 bg-[oklch(0.448_0.228_27.3)] text-white text-[13px] font-semibold rounded-xl text-center flex items-center justify-center gap-1.5"
      >
        Send to dealers <ArrowRight className="w-3.5 h-3.5" />
      </motion.div>
    </motion.div>
  );
}

function DealersPhase() {
  const dealers = [
    { name: "BMW Zürich AG", canton: "ZH" },
    { name: "AutoCenter Basel", canton: "BS" },
    { name: "Premium Cars Bern", canton: "BE" },
    { name: "TopAutos Winterthur", canton: "ZH" },
  ];
  return (
    <motion.div
      key="dealers"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-[oklch(0.448_0.228_27.3)] animate-pulse" />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[oklch(0.500_0.006_27.0)]">
          Notifying dealers
        </p>
      </div>
      <div className="space-y-2.5">
        {dealers.map((d, i) => (
          <motion.div
            key={d.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12, duration: 0.35, ease }}
            className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-[oklch(0.975_0.002_27.0)] border border-[oklch(0.920_0.004_27.0)]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-[oklch(0.448_0.228_27.3)]/10 flex items-center justify-center">
                <span className="text-[9px] font-bold text-[oklch(0.448_0.228_27.3)]">{d.canton}</span>
              </div>
              <span className="text-[13px] font-medium text-[oklch(0.200_0.010_27.0)]">{d.name}</span>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 + i * 0.12, duration: 0.25, ease }}
              className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"
            >
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          </motion.div>
        ))}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-[12px] text-[oklch(0.580_0.006_27.0)] pt-1"
        >
          + more verified dealers across Switzerland
        </motion.p>
      </div>
    </motion.div>
  );
}

function OffersPhase() {
  const offers = [
    { dealer: "BMW Zürich AG", car: "530d xDrive 2021", price: "CHF 38,500", km: "62,000 km" },
    { dealer: "AutoCenter Basel", car: "520i M Sport 2022", price: "CHF 41,200", km: "28,000 km" },
    { dealer: "Premium Cars Bern", car: "530e Hybrid 2020", price: "CHF 36,900", km: "71,000 km" },
  ];
  return (
    <motion.div
      key="offers"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[oklch(0.500_0.006_27.0)]">
          Your offers
        </p>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[oklch(0.448_0.228_27.3)] text-white">
          {offers.length} new
        </span>
      </div>
      <div className="space-y-2.5">
        {offers.map((o, i) => (
          <motion.div
            key={o.dealer}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.35, ease }}
            className="p-3 rounded-xl border border-[oklch(0.920_0.004_27.0)] bg-[oklch(0.975_0.002_27.0)]"
          >
            <p className="text-[11px] text-[oklch(0.580_0.006_27.0)] mb-0.5">{o.dealer}</p>
            <p className="text-[13px] font-semibold text-[oklch(0.200_0.010_27.0)]">{o.car}</p>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[16px] font-bold text-[oklch(0.448_0.228_27.3)] tabular-nums">{o.price}</span>
              <span className="text-[11px] text-[oklch(0.580_0.006_27.0)]">{o.km}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

const PHASES = ["request", "dealers", "offers"] as const;
type Phase = (typeof PHASES)[number];

const PHASE_LABELS: Record<Phase, string> = {
  request: "Describe your car",
  dealers: "Dealers are notified",
  offers: "Offers arrive",
};

function ProductDemo() {
  const [phase, setPhase] = useState<Phase>("request");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setPhase(PHASES[tick % PHASES.length]);
  }, [tick]);

  return (
    <div className="relative">
      {/* Screen chrome */}
      <div className="bg-white rounded-2xl shadow-[0_24px_64px_-12px_rgba(0,0,0,0.12),0_4px_16px_-4px_rgba(0,0,0,0.06)] border border-[oklch(0.916_0.004_27.0)] overflow-hidden">
        {/* Top bar */}
        <div className="px-4 py-3 border-b border-[oklch(0.920_0.004_27.0)] flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[oklch(0.820_0.000_0)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[oklch(0.820_0.000_0)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[oklch(0.820_0.000_0)]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-1.5 bg-[oklch(0.960_0.003_27.0)] rounded-lg px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[11px] text-[oklch(0.500_0.006_27.0)]">autoverkauf.ch</span>
            </div>
          </div>
        </div>

        {/* Phase step indicator */}
        <div className="flex border-b border-[oklch(0.920_0.004_27.0)]">
          {PHASES.map((p, i) => (
            <div
              key={p}
              className={[
                "flex-1 py-2.5 text-center text-[10px] font-semibold transition-all duration-300",
                phase === p
                  ? "text-[oklch(0.448_0.228_27.3)] border-b-2 border-[oklch(0.448_0.228_27.3)]"
                  : i < PHASES.indexOf(phase)
                  ? "text-[oklch(0.400_0.006_27.0)]"
                  : "text-[oklch(0.680_0.004_27.0)]",
              ].join(" ")}
            >
              {i + 1}. {PHASE_LABELS[p]}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 min-h-[280px]">
          <AnimatePresence mode="wait">
            {phase === "request" && <RequestPhase />}
            {phase === "dealers" && <DealersPhase />}
            {phase === "offers" && <OffersPhase />}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress bar below */}
      <div className="mt-3 flex gap-1.5 justify-center">
        {PHASES.map((p) => (
          <div
            key={p}
            className={[
              "h-1 rounded-full transition-all duration-500",
              phase === p ? "w-6 bg-[oklch(0.448_0.228_27.3)]" : "w-1.5 bg-[oklch(0.880_0.004_27.0)]",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────

export function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const prefix = locale === "de" ? "" : `/${locale}`;

  return (
    <section className="relative min-h-dvh flex flex-col justify-center overflow-hidden bg-white pt-16">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.022] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(oklch(0.448 0.228 27.3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.448 0.228 27.3) 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28 w-full">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* ── Left: Copy ── */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[oklch(0.960_0.004_27.0)] border border-[oklch(0.916_0.004_27.0)] mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.448_0.228_27.3)]" />
              <span className="text-[12px] font-medium text-[oklch(0.380_0.008_27.0)]">
                {t("badge")}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease, delay: 0.08 }}
              className="text-[clamp(2.8rem,7vw,5.5rem)] font-bold tracking-[-0.04em] leading-[1.04] text-[oklch(0.112_0.012_27.0)]"
            >
              {t("headline1")}
              <br />
              <span className="text-[oklch(0.448_0.228_27.3)]">{t("headline2")}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease, delay: 0.18 }}
              className="mt-7 text-[1.1rem] text-[oklch(0.450_0.008_27.0)] leading-[1.75] max-w-md"
            >
              {t("subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.28 }}
              className="mt-9 flex flex-col sm:flex-row gap-3"
            >
              <a
                href={`${prefix}/buyer/requests/new`}
                className="btn-lift inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[oklch(0.448_0.228_27.3)] text-white text-[14px] font-semibold rounded-xl hover:bg-[oklch(0.400_0.218_27.3)] transition-colors shadow-[0_4px_16px_-4px_oklch(0.448_0.228_27.3/0.5)]"
              >
                {t("cta")}
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#how-it-works"
                className="btn-lift inline-flex items-center justify-center px-6 py-3.5 bg-white text-[oklch(0.280_0.010_27.0)] text-[14px] font-medium rounded-xl border border-[oklch(0.916_0.004_27.0)] hover:bg-[oklch(0.970_0.003_27.0)] transition-colors"
              >
                {t("ctaSecondary")}
              </a>
            </motion.div>

            {/* Three pillars — honest */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.48, duration: 0.5 }}
              className="mt-10 flex flex-col gap-2.5"
            >
              {[t("pillar1"), t("pillar2"), t("pillar3")].map((text) => (
                <div key={text} className="flex items-center gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7.5" stroke="oklch(0.448 0.228 27.3)" strokeOpacity="0.25" />
                    <path d="M5 8.5L7 10.5L11 6" stroke="oklch(0.448 0.228 27.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[13px] text-[oklch(0.460_0.008_27.0)]">{text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Animated demo ── */}
          <motion.div
            initial={{ opacity: 0, x: 32, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, ease, delay: 0.22 }}
          >
            <ProductDemo />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-[oklch(0.700_0.004_27.0)] to-transparent"
        />
      </motion.div>
    </section>
  );
}
