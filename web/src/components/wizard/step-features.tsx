"use client";

import { useTranslations } from "next-intl";
import { useWizardStore } from "@/store/request-wizard";
import { Check } from "lucide-react";

// stable ids stored in the request; labels come from the `features` namespace
const FEATURE_IDS = [
  "panoramaRoof", "heatedSeats", "navigation", "parkingSensors",
  "rearCamera", "camera360", "adaptiveCruise", "laneAssist",
  "blindSpot", "carplay", "wirelessCharging",
  "keyless", "electricTailgate", "towHitch", "leatherSeats",
  "headUpDisplay", "ambientLighting", "awd", "sportPackage",
  "winterTyres",
] as const;

type FeatureState = "required" | "nice" | null;

export function StepFeatures() {
  const t = useTranslations("wizard.features");
  const tFeatures = useTranslations("features");
  const { data, update } = useWizardStore();

  const getState = (feature: string): FeatureState => {
    if (data.requiredFeatures.includes(feature)) return "required";
    if (data.niceFeatures.includes(feature)) return "nice";
    return null;
  };

  const cycle = (feature: string) => {
    const current = getState(feature);
    const required = data.requiredFeatures.filter((f) => f !== feature);
    const nice = data.niceFeatures.filter((f) => f !== feature);

    if (current === null) {
      update({ requiredFeatures: [...required, feature], niceFeatures: nice });
    } else if (current === "required") {
      update({ requiredFeatures: required, niceFeatures: [...nice, feature] });
    } else {
      update({ requiredFeatures: required, niceFeatures: nice });
    }
  };

  const totalSelected = data.requiredFeatures.length + data.niceFeatures.length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[2.25rem] font-semibold tracking-[-0.02em] leading-[1.1] text-[oklch(0.112_0.012_27.0)]" style={{ textWrap: "balance" }}>
          {t("title")}
        </h2>
        <p className="mt-2 text-[oklch(0.500_0.012_27.0)] text-[15px] leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* Legend + count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <span className="inline-flex items-center gap-1.5 text-[12px] text-[oklch(0.400_0.012_27.0)]">
            <span className="w-4 h-4 rounded-md bg-[oklch(0.112_0.012_27.0)] flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            </span>
            {t("mustHave")}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12px] text-[oklch(0.400_0.012_27.0)]">
            <span className="w-4 h-4 rounded-md border-2 border-[oklch(0.500_0.015_27.0)] bg-white" />
            {t("niceToHave")}
          </span>
        </div>
        {totalSelected > 0 && (
          <span className="text-[11px] font-medium text-[oklch(0.500_0.012_27.0)]">
            {t("selected", { count: totalSelected })}
          </span>
        )}
      </div>

      {/* Feature chips grid */}
      <div className="flex flex-wrap gap-2">
        {FEATURE_IDS.map((feature) => {
          const state = getState(feature);
          return (
            <button
              key={feature}
              onClick={() => cycle(feature)}
              className={[
                "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium border transition-all duration-150 cursor-pointer active:scale-[0.97]",
                state === "required"
                  ? "bg-[oklch(0.112_0.012_27.0)] text-white border-[oklch(0.112_0.012_27.0)]"
                  : state === "nice"
                  ? "bg-white text-[oklch(0.300_0.012_27.0)] border-[oklch(0.500_0.015_27.0)] border-2"
                  : "bg-white text-[oklch(0.350_0.012_27.0)] border-[oklch(0.910_0.008_27.0)] hover:border-[oklch(0.600_0.010_27.0)] hover:text-[oklch(0.150_0.012_27.0)]",
              ].join(" ")}
            >
              {state === "required" && (
                <Check className="w-3 h-3 shrink-0" strokeWidth={2.5} />
              )}
              {state === "nice" && (
                <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1l1.23 3.29h3.27l-2.65 2.14 1.02 3.29L6 7.7 3.13 9.72l1.02-3.29L1.5 4.29h3.27z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
              )}
              {tFeatures(feature)}
            </button>
          );
        })}
      </div>

      {/* Optional skip */}
      <p className="text-[12px] text-[oklch(0.600_0.010_27.0)]">
        {t("skip")}
      </p>
    </div>
  );
}
