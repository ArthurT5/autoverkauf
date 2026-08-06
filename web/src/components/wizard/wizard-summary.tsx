"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import type { WizardData } from "@/store/request-wizard";

function formatCHF(value: number) {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMileage(km: number) {
  if (km >= 200000) return "200,000+ km";
  return `${new Intl.NumberFormat("de-CH").format(km)} km`;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="py-2.5 border-b border-[oklch(0.940_0.004_27.0)] last:border-0"
    >
      <div className="text-[10px] font-medium text-[oklch(0.700_0.008_27.0)] mb-0.5">{label}</div>
      <div className="text-[12px] font-medium text-[oklch(0.200_0.012_27.0)] leading-snug">{value}</div>
    </motion.div>
  );
}

export function WizardSummary({ currentStep, data }: { currentStep: number; data: WizardData }) {
  const t = useTranslations("wizard.summary");
  const tW = useTranslations("wizard.features");
  const tTypes = useTranslations("vehicleTypes");
  const tFuel = useTranslations("fuelTypes");
  const tTrans = useTranslations("transmissions");
  if (currentStep <= 1) return null;

  const rows: { label: string; value: string }[] = [];

  if (currentStep > 1) {
    rows.push({
      label: t("budget"),
      value: `${formatCHF(data.budgetMin)} – ${formatCHF(data.budgetMax)}`,
    });
  }

  if (currentStep > 2) {
    const parts = [];
    if (data.vehicleType !== "any") {
      parts.push(tTypes(data.vehicleType));
    }
    if (data.brands.length > 0) {
      parts.push(data.brands.slice(0, 2).join(", ") + (data.brands.length > 2 ? ` +${data.brands.length - 2}` : ""));
    }
    if (data.yearFrom || data.yearTo) {
      parts.push(`${data.yearFrom}–${data.yearTo}`);
    }
    if (parts.length > 0) {
      rows.push({ label: t("vehicle"), value: parts.join(" · ") });
    }
  }

  if (currentStep > 3) {
    const parts = [];
    if (data.fuelType !== "any") {
      parts.push(tFuel(data.fuelType));
    }
    if (data.transmission !== "any") {
      parts.push(tTrans(data.transmission));
    }
    parts.push(`≤ ${formatMileage(data.maxMileage)}`);
    rows.push({ label: t("specs"), value: parts.join(" · ") });
  }

  if (currentStep > 4) {
    const total = data.requiredFeatures.length + data.niceFeatures.length;
    if (total > 0) {
      const parts = [];
      if (data.requiredFeatures.length > 0)
        parts.push(`${data.requiredFeatures.length} × ${tW("mustHave").toLowerCase()}`);
      if (data.niceFeatures.length > 0)
        parts.push(`${data.niceFeatures.length} × ${tW("niceToHave").toLowerCase()}`);
      rows.push({ label: t("features"), value: parts.join(", ") });
    }
  }

  if (rows.length === 0) return null;

  return (
    <div className="rounded-lg border border-[oklch(0.920_0.006_27.0)] overflow-hidden">
      <div className="px-3 py-2 bg-[oklch(0.977_0.005_27.0)] border-b border-[oklch(0.920_0.006_27.0)]">
        <span className="text-[10px] font-semibold tracking-wide text-[oklch(0.500_0.010_27.0)] uppercase">{t("title")}</span>
      </div>
      <div className="px-3">
        <AnimatePresence>
          {rows.map((row) => (
            <SummaryRow key={row.label} label={row.label} value={row.value} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
