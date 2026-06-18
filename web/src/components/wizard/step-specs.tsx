"use client";

import { useWizardStore, FuelType, TransmissionType } from "@/store/request-wizard";
import { Slider } from "@/components/ui/slider";

const FUEL_TYPES: { value: FuelType; label: string; desc?: string }[] = [
  { value: "any", label: "Any" },
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Electric" },
  { value: "hybrid", label: "Hybrid" },
  { value: "phev", label: "Plug-in Hybrid" },
];

const TRANSMISSIONS: { value: TransmissionType; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
];

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-4 py-2 rounded-lg text-[13px] font-medium border transition-all duration-150 cursor-pointer active:scale-[0.97]",
        selected
          ? "bg-[oklch(0.112_0.012_27.0)] text-white border-[oklch(0.112_0.012_27.0)]"
          : "bg-white text-[oklch(0.350_0.012_27.0)] border-[oklch(0.910_0.008_27.0)] hover:border-[oklch(0.600_0.010_27.0)] hover:text-[oklch(0.150_0.012_27.0)]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function formatMileage(km: number) {
  if (km >= 200000) return "200,000+ km";
  return `${new Intl.NumberFormat("de-CH").format(km)} km`;
}

export function StepSpecs() {
  const { data, update } = useWizardStore();

  return (
    <div className="space-y-9">
      <div>
        <h2 className="text-[2.25rem] font-semibold tracking-[-0.02em] leading-[1.1] text-[oklch(0.112_0.012_27.0)]" style={{ textWrap: "balance" }}>
          Technical preferences
        </h2>
        <p className="mt-2 text-[oklch(0.500_0.012_27.0)] text-[15px] leading-relaxed">
          Choose "Any" to receive the broadest range of offers.
        </p>
      </div>

      {/* Fuel */}
      <div className="space-y-3">
        <p className="text-[13px] font-medium text-[oklch(0.300_0.012_27.0)]">Fuel type</p>
        <div className="flex flex-wrap gap-2">
          {FUEL_TYPES.map((f) => (
            <Chip
              key={f.value}
              label={f.label}
              selected={data.fuelType === f.value}
              onClick={() => update({ fuelType: f.value })}
            />
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div className="space-y-3">
        <p className="text-[13px] font-medium text-[oklch(0.300_0.012_27.0)]">Transmission</p>
        <div className="flex flex-wrap gap-2">
          {TRANSMISSIONS.map((t) => (
            <Chip
              key={t.value}
              label={t.label}
              selected={data.transmission === t.value}
              onClick={() => update({ transmission: t.value })}
            />
          ))}
        </div>
      </div>

      {/* Mileage */}
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <p className="text-[13px] font-medium text-[oklch(0.300_0.012_27.0)]">Maximum mileage</p>
          <span className="text-[1.5rem] font-bold tabular-nums tracking-tight text-[oklch(0.112_0.012_27.0)]">
            {formatMileage(data.maxMileage)}
          </span>
        </div>
        <Slider
          min={10000}
          max={200000}
          step={5000}
          value={[data.maxMileage]}
          onValueChange={(value) => update({ maxMileage: (value as number[])[0] })}
          className="w-full"
        />
        <div className="flex justify-between text-[11px] text-[oklch(0.700_0.008_27.0)]">
          <span>10,000 km</span>
          <span>200,000+ km</span>
        </div>
      </div>
    </div>
  );
}
