"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useWizardStore } from "@/store/request-wizard";
import { StepBudget } from "./step-budget";
import { StepVehicle } from "./step-vehicle";
import { StepSpecs } from "./step-specs";
import { StepFeatures } from "./step-features";
import { StepDetails } from "./step-details";
import { WizardSummary } from "./wizard-summary";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

const STEPS = [
  { label: "Budget", desc: "Price range" },
  { label: "Vehicle", desc: "Type & brand" },
  { label: "Specs", desc: "Fuel & mileage" },
  { label: "Features", desc: "Equipment" },
  { label: "Details", desc: "Location & notes" },
];

const STEP_COMPONENTS = [StepBudget, StepVehicle, StepSpecs, StepFeatures, StepDetails];

function Logo() {
  return (
    <a href="/" className="inline-flex items-center gap-2.5 group">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="7" y="0" width="4" height="18" rx="1.5" fill="oklch(0.448 0.228 27.3)" />
        <rect x="0" y="7" width="18" height="4" rx="1.5" fill="oklch(0.448 0.228 27.3)" />
      </svg>
      <span className="text-[15px] font-semibold tracking-[-0.025em] text-[oklch(0.112_0.012_27.0)]">
        AutoVerkauf
      </span>
    </a>
  );
}

function SuccessState() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="w-16 h-16 rounded-full bg-[oklch(0.95_0.015_145)] flex items-center justify-center mb-8"
      >
        <Check className="w-8 h-8 text-[oklch(0.50_0.15_145)]" strokeWidth={2.5} />
      </motion.div>
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="text-[1.75rem] font-semibold tracking-tight text-[oklch(0.112_0.012_27.0)] mb-2">
          Request sent
        </h2>
        <p className="text-[oklch(0.468_0.012_27.0)] text-[15px] max-w-sm leading-relaxed mb-8">
          Verified Swiss dealerships are reviewing your request. Offers will appear in your dashboard.
        </p>
        <button
          onClick={() => (window.location.href = "/buyer/dashboard")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[oklch(0.448_0.228_27.3)] text-white text-[14px] font-medium rounded-lg hover:bg-[oklch(0.400_0.218_27.3)] transition-colors duration-150 cursor-pointer"
        >
          Go to dashboard
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}

export function RequestWizard() {
  const { step, nextStep, prevStep, data } = useWizardStore();
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const StepComponent = STEP_COMPONENTS[step - 1];

  const handleNext = () => { setDirection(1); nextStep(); };
  const handlePrev = () => { setDirection(-1); prevStep(); };
  const handleSubmit = async () => {
    setSubmitted(true);
  };

  if (submitted) return <SuccessState />;

  return (
    <div className="min-h-screen bg-[oklch(0.985_0.003_27.0)] flex flex-col">
      {/* Thin top header */}
      <header className="h-14 flex items-center px-6 border-b border-[oklch(0.920_0.006_27.0)] bg-white">
        <Logo />
      </header>

      {/* Main two-column body */}
      <div className="flex-1 flex">
        {/* Left sidebar */}
        <aside className="hidden lg:flex flex-col w-[260px] shrink-0 border-r border-[oklch(0.920_0.006_27.0)] bg-white px-6 pt-10 pb-8 gap-8">
          {/* Step list */}
          <nav className="space-y-1">
            {STEPS.map((s, i) => {
              const num = i + 1;
              const done = num < step;
              const active = num === step;
              return (
                <div key={s.label} className="flex items-center gap-3 py-2">
                  <div
                    className={[
                      "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 transition-all duration-200",
                      done
                        ? "bg-[oklch(0.448_0.228_27.3)] text-white"
                        : active
                        ? "bg-[oklch(0.112_0.012_27.0)] text-white"
                        : "bg-[oklch(0.940_0.006_27.0)] text-[oklch(0.600_0.010_27.0)]",
                    ].join(" ")}
                  >
                    {done ? <Check className="w-3 h-3" strokeWidth={2.5} /> : num}
                  </div>
                  <div>
                    <div
                      className={[
                        "text-[13px] font-medium leading-none",
                        active
                          ? "text-[oklch(0.112_0.012_27.0)]"
                          : done
                          ? "text-[oklch(0.468_0.012_27.0)]"
                          : "text-[oklch(0.700_0.008_27.0)]",
                      ].join(" ")}
                    >
                      {s.label}
                    </div>
                    <div className="text-[11px] text-[oklch(0.700_0.008_27.0)] mt-0.5">{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Live summary */}
          <div className="flex-1">
            <WizardSummary currentStep={step} data={data} />
          </div>

          {/* Privacy note */}
          <div className="text-[11px] text-[oklch(0.700_0.008_27.0)] leading-relaxed border-t border-[oklch(0.920_0.006_27.0)] pt-4">
            Your contact details are never shared with dealers without your consent.
          </div>
        </aside>

        {/* Right content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile stepper */}
          <div className="lg:hidden px-4 py-4 border-b border-[oklch(0.920_0.006_27.0)] bg-white">
            <div className="flex items-center gap-2">
              {STEPS.map((_, i) => {
                const num = i + 1;
                const done = num < step;
                const active = num === step;
                return (
                  <div
                    key={i}
                    className={[
                      "h-1 rounded-full flex-1 transition-all duration-300",
                      done || active
                        ? "bg-[oklch(0.448_0.228_27.3)]"
                        : "bg-[oklch(0.920_0.006_27.0)]",
                    ].join(" ")}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[12px] font-medium text-[oklch(0.448_0.228_27.3)]">
                {STEPS[step - 1].label}
              </span>
              <span className="text-[12px] text-[oklch(0.700_0.008_27.0)]">
                {step} of {STEPS.length}
              </span>
            </div>
          </div>

          {/* Step content area */}
          <div className="flex-1 flex flex-col items-center px-6 pt-10 pb-6 lg:px-12 lg:pt-14">
            <div className="w-full max-w-[560px]">
              <div className="min-h-[440px] relative">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={step}
                    custom={direction}
                    initial={{ x: direction > 0 ? 28 : -28, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: direction > 0 ? -28 : 28, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <StepComponent />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-8 mt-8 border-t border-[oklch(0.920_0.006_27.0)]">
                <button
                  onClick={handlePrev}
                  disabled={step === 1}
                  className="inline-flex items-center gap-2 text-[13px] font-medium text-[oklch(0.468_0.012_27.0)] hover:text-[oklch(0.112_0.012_27.0)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>

                <div className="flex items-center gap-3">
                  {/* Step counter */}
                  <span className="text-[12px] text-[oklch(0.700_0.008_27.0)] hidden sm:block">
                    Step {step} of {STEPS.length}
                  </span>

                  {step < 5 ? (
                    <button
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[oklch(0.112_0.012_27.0)] text-white text-[13px] font-medium rounded-lg hover:bg-[oklch(0.200_0.012_27.0)] active:scale-[0.98] transition-all duration-150 cursor-pointer"
                    >
                      Continue
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[oklch(0.448_0.228_27.3)] text-white text-[13px] font-medium rounded-lg hover:bg-[oklch(0.400_0.218_27.3)] active:scale-[0.98] transition-all duration-150 cursor-pointer"
                    >
                      Send request
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
