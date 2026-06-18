"use client";

import { useWizardStore } from "@/store/request-wizard";
import { Slider } from "@/components/ui/slider";

function formatCHF(value: number) {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    maximumFractionDigits: 0,
  }).format(value);
}

export function StepBudget() {
  const { data, update } = useWizardStore();

  const handleSlider = (value: number | readonly number[]) => {
    const [min, max] = value as number[];
    update({ budgetMin: min, budgetMax: max });
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-[2.25rem] font-semibold tracking-[-0.02em] leading-[1.1] text-[oklch(0.112_0.012_27.0)]" style={{ textWrap: "balance" }}>
          What's your budget?
        </h2>
        <p className="mt-2 text-[oklch(0.500_0.012_27.0)] text-[15px] leading-relaxed">
          Dealers only send offers within your range.
        </p>
      </div>

      {/* Range display */}
      <div className="flex items-end gap-3">
        <div className="flex-1 rounded-xl border border-[oklch(0.910_0.008_27.0)] bg-white px-5 py-4">
          <div className="text-[12px] font-medium text-[oklch(0.600_0.010_27.0)] mb-1">From</div>
          <div className="text-[2rem] font-bold tabular-nums tracking-tight text-[oklch(0.112_0.012_27.0)]">
            {formatCHF(data.budgetMin)}
          </div>
        </div>
        <div className="text-[oklch(0.700_0.008_27.0)] text-xl font-light pb-4">–</div>
        <div className="flex-1 rounded-xl border border-[oklch(0.448_0.228_27.3)/0.3] bg-[oklch(0.448_0.228_27.3)/0.04] px-5 py-4">
          <div className="text-[12px] font-medium text-[oklch(0.448_0.228_27.3)/0.7] mb-1">To</div>
          <div className="text-[2rem] font-bold tabular-nums tracking-tight text-[oklch(0.448_0.228_27.3)]">
            {formatCHF(data.budgetMax)}
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="space-y-3">
        <Slider
          min={5000}
          max={200000}
          step={1000}
          value={[data.budgetMin, data.budgetMax]}
          onValueChange={handleSlider}
          className="w-full"
        />
        <div className="flex justify-between text-[11px] text-[oklch(0.700_0.008_27.0)]">
          <span>CHF 5,000</span>
          <span>CHF 200,000+</span>
        </div>
      </div>

      {/* Quick presets */}
      <div className="space-y-2">
        <p className="text-[12px] font-medium text-[oklch(0.600_0.010_27.0)]">Quick range</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Under 20k", min: 5000, max: 20000 },
            { label: "20k – 40k", min: 20000, max: 40000 },
            { label: "40k – 80k", min: 40000, max: 80000 },
            { label: "80k – 150k", min: 80000, max: 150000 },
            { label: "150k+", min: 150000, max: 200000 },
          ].map((preset) => {
            const active = data.budgetMin === preset.min && data.budgetMax === preset.max;
            return (
              <button
                key={preset.label}
                onClick={() => update({ budgetMin: preset.min, budgetMax: preset.max })}
                className={[
                  "px-3.5 py-1.5 rounded-lg text-[12px] font-medium border transition-all duration-150 cursor-pointer",
                  active
                    ? "bg-[oklch(0.112_0.012_27.0)] text-white border-[oklch(0.112_0.012_27.0)]"
                    : "bg-white text-[oklch(0.400_0.012_27.0)] border-[oklch(0.910_0.008_27.0)] hover:border-[oklch(0.700_0.010_27.0)] hover:text-[oklch(0.200_0.012_27.0)]",
                ].join(" ")}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
