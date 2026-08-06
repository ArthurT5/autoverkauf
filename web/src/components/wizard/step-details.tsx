"use client";

import { useTranslations } from "next-intl";
import { useWizardStore } from "@/store/request-wizard";
import { MapPin, MessageSquare, ShieldCheck } from "lucide-react";

const SWISS_CANTONS = [
  "Aargau", "Appenzell Ausserrhoden", "Appenzell Innerrhoden", "Basel-Landschaft",
  "Basel-Stadt", "Bern", "Fribourg", "Geneva", "Glarus", "Graubünden",
  "Jura", "Lucerne", "Neuchâtel", "Nidwalden", "Obwalden", "Schaffhausen",
  "Schwyz", "Solothurn", "St. Gallen", "Thurgau", "Ticino", "Uri",
  "Valais", "Vaud", "Zug", "Zurich",
];

export function StepDetails() {
  const t = useTranslations("wizard.details");
  const { data, update } = useWizardStore();

  return (
    <div className="space-y-9">
      <div>
        <h2 className="text-[2.25rem] font-semibold tracking-[-0.02em] leading-[1.1] text-[oklch(0.112_0.012_27.0)]" style={{ textWrap: "balance" }}>
          {t("title")}
        </h2>
        <p className="mt-2 text-[oklch(0.500_0.012_27.0)] text-[15px] leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label htmlFor="location" className="flex items-center gap-1.5 text-[13px] font-medium text-[oklch(0.300_0.012_27.0)]">
          <MapPin className="w-3.5 h-3.5 text-[oklch(0.500_0.010_27.0)]" />
          {t("location")}
        </label>
        <input
          id="location"
          type="text"
          list="cantons"
          placeholder={t("locationPlaceholder")}
          value={data.location}
          onChange={(e) => update({ location: e.target.value })}
          autoComplete="off"
          className="w-full h-11 px-3.5 rounded-lg border border-[oklch(0.910_0.008_27.0)] bg-white text-[14px] text-[oklch(0.150_0.012_27.0)] placeholder:text-[oklch(0.700_0.008_27.0)] outline-none focus:border-[oklch(0.448_0.228_27.3)] focus:ring-3 focus:ring-[oklch(0.448_0.228_27.3)/0.12] transition-all duration-150"
        />
        <datalist id="cantons">
          {SWISS_CANTONS.map((c) => <option key={c} value={c} />)}
        </datalist>
        <p className="text-[12px] text-[oklch(0.600_0.010_27.0)]">
          {t("locationHint")}
        </p>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label htmlFor="notes" className="flex items-center gap-1.5 text-[13px] font-medium text-[oklch(0.300_0.012_27.0)]">
          <MessageSquare className="w-3.5 h-3.5 text-[oklch(0.500_0.010_27.0)]" />
          {t("notes")}
          <span className="text-[12px] font-normal text-[oklch(0.600_0.010_27.0)] ml-1">{t("notesOptional")}</span>
        </label>
        <textarea
          id="notes"
          placeholder={t("notesPlaceholder")}
          value={data.notes}
          onChange={(e) => update({ notes: e.target.value })}
          rows={4}
          maxLength={500}
          className="w-full px-3.5 py-3 rounded-lg border border-[oklch(0.910_0.008_27.0)] bg-white text-[14px] text-[oklch(0.150_0.012_27.0)] placeholder:text-[oklch(0.700_0.008_27.0)] outline-none focus:border-[oklch(0.448_0.228_27.3)] focus:ring-3 focus:ring-[oklch(0.448_0.228_27.3)/0.12] transition-all duration-150 resize-none leading-relaxed"
        />
        <div className="flex justify-end">
          <span className="text-[11px] text-[oklch(0.700_0.008_27.0)]">{data.notes.length} / 500</span>
        </div>
      </div>

      {/* What happens next */}
      <div className="rounded-xl bg-[oklch(0.977_0.005_27.0)] border border-[oklch(0.920_0.006_27.0)] p-5 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[oklch(0.448_0.228_27.3)]" />
          <span className="text-[13px] font-semibold text-[oklch(0.112_0.012_27.0)]">{t("whatNext")}</span>
        </div>
        <p className="text-[13px] text-[oklch(0.468_0.012_27.0)] leading-relaxed">
          {t("whatNextBody")}
        </p>
      </div>
    </div>
  );
}
