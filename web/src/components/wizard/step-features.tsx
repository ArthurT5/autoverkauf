"use client";

import { useWizardStore } from "@/store/request-wizard";
import { Check } from "lucide-react";

const FEATURE_OPTIONS = [
  "Panorama roof", "Heated seats", "Navigation", "Parking sensors",
  "Rear camera", "360° camera", "Adaptive cruise control", "Lane assist",
  "Blind spot monitoring", "Apple CarPlay / Android Auto", "Wireless charging",
  "Keyless entry", "Electric tailgate", "Tow hitch", "Leather seats",
  "Head-up display", "Ambient lighting", "4WD / AWD", "Sport package",
  "Winter tyres included",
];

type FeatureState = "required" | "nice" | null;

export function StepFeatures() {
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
      // null → required
      update({ requiredFeatures: [...required, feature], niceFeatures: nice });
    } else if (current === "required") {
      // required → nice
      update({ requiredFeatures: required, niceFeatures: [...nice, feature] });
    } else {
      // nice → null
      update({ requiredFeatures: required, niceFeatures: nice });
    }
  };

  const totalRequired = data.requiredFeatures.length;
  const totalNice = data.niceFeatures.length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[2.25rem] font-semibold tracking-[-0.02em] leading-[1.1] text-[oklch(0.112_0.012_27.0)]" style={{ textWrap: "balance" }}>
          Which features matter?
        </h2>
        <p className="mt-2 text-[oklch(0.500_0.012_27.0)] text-[15px] leading-relaxed">
          Tap once for must-have, again for nice-to-have, once more to clear.
        </p>
      </div>

      {/* Legend + count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <span className="inline-flex items-center gap-1.5 text-[12px] text-[oklch(0.400_0.012_27.0)]">
            <span className="w-4 h-4 rounded-md bg-[oklch(0.112_0.012_27.0)] flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            </span>
            Must have
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12px] text-[oklch(0.400_0.012_27.0)]">
            <span className="w-4 h-4 rounded-md border-2 border-[oklch(0.500_0.015_27.0)] bg-white" />
            Nice to have
          </span>
        </div>
        {(totalRequired + totalNice) > 0 && (
          <span className="text-[11px] font-medium text-[oklch(0.500_0.012_27.0)]">
            {totalRequired + totalNice} selected
          </span>
        )}
      </div>

      {/* Feature chips grid */}
      <div className="flex flex-wrap gap-2">
        {FEATURE_OPTIONS.map((feature) => {
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
              {feature}
            </button>
          );
        })}
      </div>

      {/* Optional skip */}
      <p className="text-[12px] text-[oklch(0.600_0.010_27.0)]">
        You can skip this step — dealers will send offers for any configuration.
      </p>
    </div>
  );
}
