import { create } from "zustand";

export type FuelType = "petrol" | "diesel" | "electric" | "hybrid" | "phev" | "any";
export type TransmissionType = "automatic" | "manual" | "any";
export type VehicleType = "sedan" | "suv" | "estate" | "coupe" | "convertible" | "van" | "pickup" | "any";

export interface WizardData {
  // Step 1 — Budget
  budgetMin: number;
  budgetMax: number;

  // Step 2 — Vehicle
  vehicleType: VehicleType;
  brands: string[];
  yearFrom: number;
  yearTo: number;

  // Step 3 — Specs
  fuelType: FuelType;
  transmission: TransmissionType;
  maxMileage: number;

  // Step 4 — Features
  requiredFeatures: string[];
  niceFeatures: string[];

  // Step 5 — Details
  location: string;
  notes: string;
}

interface WizardState {
  step: number;
  data: WizardData;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  update: (partial: Partial<WizardData>) => void;
  reset: () => void;
}

const defaultData: WizardData = {
  budgetMin: 10000,
  budgetMax: 40000,
  vehicleType: "any",
  brands: [],
  yearFrom: 2018,
  yearTo: new Date().getFullYear(),
  fuelType: "any",
  transmission: "any",
  maxMileage: 100000,
  requiredFeatures: [],
  niceFeatures: [],
  location: "",
  notes: "",
};

export const useWizardStore = create<WizardState>((set) => ({
  step: 1,
  data: defaultData,
  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 5) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),
  update: (partial) => set((s) => ({ data: { ...s.data, ...partial } })),
  reset: () => set({ step: 1, data: defaultData }),
}));
