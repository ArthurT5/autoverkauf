"use client";

import { useTranslations } from "next-intl";
import { useWizardStore, VehicleType } from "@/store/request-wizard";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";
import { useState } from "react";

const VEHICLE_TYPES: VehicleType[] = [
  "any", "suv", "sedan", "estate", "coupe", "convertible", "van", "pickup",
];

const POPULAR_BRANDS = [
  "BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Toyota",
  "Volvo", "Skoda", "Ford", "Opel", "Renault", "Peugeot",
  "Seat", "Honda", "Hyundai", "Kia", "Tesla", "Porsche",
];

const currentYear = new Date().getFullYear();

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

export function StepVehicle() {
  const t = useTranslations("wizard.vehicle");
  const tTypes = useTranslations("vehicleTypes");
  const { data, update } = useWizardStore();
  const [brandInput, setBrandInput] = useState("");

  const filteredBrands = brandInput.length > 0
    ? POPULAR_BRANDS.filter(
        (b) =>
          b.toLowerCase().includes(brandInput.toLowerCase()) &&
          !data.brands.includes(b)
      )
    : POPULAR_BRANDS.filter((b) => !data.brands.includes(b)).slice(0, 8);

  const addBrand = (brand: string) => {
    if (!data.brands.includes(brand)) {
      update({ brands: [...data.brands, brand] });
    }
    setBrandInput("");
  };

  const removeBrand = (brand: string) => {
    update({ brands: data.brands.filter((b) => b !== brand) });
  };

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

      {/* Body type */}
      <div className="space-y-3">
        <p className="text-[13px] font-medium text-[oklch(0.300_0.012_27.0)]">{t("bodyType")}</p>
        <div className="flex flex-wrap gap-2">
          {VEHICLE_TYPES.map((value) => (
            <Chip
              key={value}
              label={tTypes(value)}
              selected={data.vehicleType === value}
              onClick={() => update({ vehicleType: value })}
            />
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-3">
        <div className="flex items-baseline gap-2">
          <p className="text-[13px] font-medium text-[oklch(0.300_0.012_27.0)]">{t("brands")}</p>
          <span className="text-[12px] text-[oklch(0.600_0.010_27.0)]">{t("brandsOptional")}</span>
        </div>

        {data.brands.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.brands.map((brand) => (
              <span
                key={brand}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-[oklch(0.112_0.012_27.0)] text-white rounded-lg"
              >
                {brand}
                <button
                  onClick={() => removeBrand(brand)}
                  className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            placeholder={t("brandsPlaceholder")}
            value={brandInput}
            onChange={(e) => setBrandInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && brandInput.trim()) addBrand(brandInput.trim());
            }}
            className="w-full h-10 px-3.5 rounded-lg border border-[oklch(0.910_0.008_27.0)] bg-white text-[14px] text-[oklch(0.150_0.012_27.0)] placeholder:text-[oklch(0.700_0.008_27.0)] outline-none focus:border-[oklch(0.448_0.228_27.3)] focus:ring-3 focus:ring-[oklch(0.448_0.228_27.3)/0.12] transition-all duration-150"
          />
        </div>

        {filteredBrands.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {filteredBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => addBrand(brand)}
                className="px-3 py-1.5 text-[12px] font-medium text-[oklch(0.450_0.012_27.0)] bg-white border border-[oklch(0.910_0.008_27.0)] hover:border-[oklch(0.600_0.010_27.0)] hover:text-[oklch(0.200_0.012_27.0)] rounded-lg transition-all duration-150 cursor-pointer"
              >
                + {brand}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Year range — dual slider */}
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <p className="text-[13px] font-medium text-[oklch(0.300_0.012_27.0)]">{t("yearRange")}</p>
          <span className="text-[15px] font-semibold tabular-nums text-[oklch(0.112_0.012_27.0)]">
            {data.yearFrom} – {data.yearTo}
          </span>
        </div>
        <Slider
          min={2000}
          max={currentYear}
          step={1}
          value={[data.yearFrom, data.yearTo]}
          onValueChange={(value) => {
            const [from, to] = value as number[];
            update({ yearFrom: from, yearTo: to });
          }}
          className="w-full"
        />
        <div className="flex justify-between text-[11px] text-[oklch(0.700_0.008_27.0)]">
          <span>2000</span>
          <span>{currentYear}</span>
        </div>
      </div>
    </div>
  );
}
