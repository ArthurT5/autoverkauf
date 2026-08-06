"use client";

import { AnimatePresence, motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useWizardStore, type WizardData } from "@/store/request-wizard";
import { StepBudget } from "./step-budget";
import { StepVehicle } from "./step-vehicle";
import { StepSpecs } from "./step-specs";
import { StepFeatures } from "./step-features";
import { StepDetails } from "./step-details";
import { WizardSummary } from "./wizard-summary";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

/** map wizard fields to the /api/requests payload shape */
function toPayload(data: WizardData) {
  return {
    budgetMin: data.budgetMin,
    budgetMax: data.budgetMax,
    bodyTypes: data.vehicleType === "any" ? [] : [data.vehicleType],
    brands: data.brands,
    yearMin: data.yearFrom,
    yearMax: data.yearTo,
    fuelTypes: data.fuelType === "any" ? [] : [data.fuelType],
    transmissions: data.transmission === "any" ? [] : [data.transmission],
    mileageMax: data.maxMileage,
    mustHave: data.requiredFeatures,
    niceToHave: data.niceFeatures,
    canton: data.location || null,
    notes: data.notes || null,
  };
}

async function postRequest(data: WizardData): Promise<Response> {
  return fetch("/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(data)),
  });
}

const STEP_KEYS = ["budget", "vehicle", "specs", "features", "details"] as const;

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
  const t = useTranslations("wizard.success");
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
          {t("title")}
        </h2>
        <p className="text-[oklch(0.468_0.012_27.0)] text-[15px] max-w-sm leading-relaxed mb-8">
          {t("body")}
        </p>
        <button
          onClick={() => (window.location.href = "/buyer/dashboard")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[oklch(0.448_0.228_27.3)] text-white text-[14px] font-medium rounded-lg hover:bg-[oklch(0.400_0.218_27.3)] transition-colors duration-150 cursor-pointer"
        >
          {t("cta")}
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}

const AUTH_FIELD =
  "w-full rounded-xl border border-[oklch(0.920_0.006_27.0)] bg-white px-4 py-3 text-[14px] text-[oklch(0.112_0.012_27.0)] outline-none transition focus:border-[oklch(0.448_0.228_27.3)] focus:ring-2 focus:ring-[oklch(0.448_0.228_27.3)]/20";

/** Shown when the request POST returns 401: create an account (or sign in)
 *  without leaving the wizard, then the request is retried automatically. */
function AuthPanel({ onDone }: { onDone: () => Promise<void> }) {
  const t = useTranslations("wizard.auth");
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, role: "BUYER" }),
        });
        if (res.status === 409) {
          setMode("signin");
          setError(t("emailTaken"));
          setLoading(false);
          return;
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? t("createFailed"));
        }
      }
      const signRes = await signIn("credentials", { email, password, redirect: false });
      if (signRes?.error) throw new Error(t("invalid"));
      await onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("generic"));
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <h2 className="text-[1.4rem] font-semibold tracking-tight text-[oklch(0.112_0.012_27.0)]">
        {mode === "signup" ? t("title") : t("signinTitle")}
      </h2>
      <p className="mt-1.5 text-[14px] leading-relaxed text-[oklch(0.468_0.012_27.0)]">
        {mode === "signup" ? t("subtitle") : t("signinSubtitle")}
      </p>

      <form onSubmit={handleAuth} className="mt-6 space-y-4">
        {mode === "signup" && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            placeholder={t("namePh")}
            className={AUTH_FIELD}
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder={t("emailPh")}
          className={AUTH_FIELD}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          placeholder={mode === "signup" ? t("passwordNewPh") : t("passwordPh")}
          className={AUTH_FIELD}
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[oklch(0.448_0.228_27.3)] px-6 py-3.5 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-[oklch(0.400_0.218_27.3)] disabled:opacity-60 cursor-pointer"
        >
          {loading ? t("sending") : mode === "signup" ? t("submitSignup") : t("submitSignin")}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <button
        type="button"
        onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(""); }}
        className="mt-5 text-[13.5px] text-[oklch(0.468_0.012_27.0)] hover:text-[oklch(0.112_0.012_27.0)] transition-colors cursor-pointer"
      >
        {mode === "signup" ? t("toSignin") : t("toSignup")}
      </button>
    </motion.div>
  );
}

export function RequestWizard() {
  const t = useTranslations("wizard");
  const tSteps = useTranslations("steps");
  const tDesc = useTranslations("stepsDesc");
  const { step, nextStep, prevStep, data } = useWizardStore();
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const StepComponent = STEP_COMPONENTS[step - 1];

  const handleNext = () => { setDirection(1); nextStep(); };
  const handlePrev = () => { setDirection(-1); prevStep(); };

  const sendRequest = async () => {
    const res = await postRequest(data);
    if (res.status === 401) {
      setNeedsAuth(true);
      return;
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? t("auth.sendFailed"));
    }
    setSubmitted(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      await sendRequest();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t("auth.generic"));
    } finally {
      setSubmitting(false);
    }
  };

  // called by AuthPanel after successful sign-in; errors surface in the panel
  const retryAfterAuth = async () => {
    const res = await postRequest(data);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? t("auth.sendFailed"));
    }
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
            {STEP_KEYS.map((key, i) => {
              const num = i + 1;
              const done = num < step;
              const active = num === step;
              return (
                <div key={key} className="flex items-center gap-3 py-2">
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
                      {tSteps(key)}
                    </div>
                    <div className="text-[11px] text-[oklch(0.700_0.008_27.0)] mt-0.5">{tDesc(key)}</div>
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
            {t("privacyNote")}
          </div>
        </aside>

        {/* Right content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile stepper */}
          <div className="lg:hidden px-4 py-4 border-b border-[oklch(0.920_0.006_27.0)] bg-white">
            <div className="flex items-center gap-2">
              {STEP_KEYS.map((_, i) => {
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
                {tSteps(STEP_KEYS[step - 1])}
              </span>
              <span className="text-[12px] text-[oklch(0.700_0.008_27.0)]">
                {t("stepOf", { current: step, total: STEP_KEYS.length })}
              </span>
            </div>
          </div>

          {/* Step content area */}
          <div className="flex-1 flex flex-col items-center px-6 pt-10 pb-6 lg:px-12 lg:pt-14">
            <div className="w-full max-w-[560px]">
              <div className="min-h-[440px] relative">
                {needsAuth ? (
                  <AuthPanel onDone={retryAfterAuth} />
                ) : (
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
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-8 mt-8 border-t border-[oklch(0.920_0.006_27.0)]">
                <button
                  onClick={needsAuth ? () => setNeedsAuth(false) : handlePrev}
                  disabled={!needsAuth && step === 1}
                  className="inline-flex items-center gap-2 text-[13px] font-medium text-[oklch(0.468_0.012_27.0)] hover:text-[oklch(0.112_0.012_27.0)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t("back")}
                </button>

                <div className="flex items-center gap-3">
                  {/* Step counter */}
                  {!needsAuth && (
                    <span className="text-[12px] text-[oklch(0.700_0.008_27.0)] hidden sm:block">
                      {t("stepOf", { current: step, total: STEP_KEYS.length })}
                    </span>
                  )}

                  {!needsAuth && step < 5 && (
                    <button
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[oklch(0.112_0.012_27.0)] text-white text-[13px] font-medium rounded-lg hover:bg-[oklch(0.200_0.012_27.0)] active:scale-[0.98] transition-all duration-150 cursor-pointer"
                    >
                      {t("continue")}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {!needsAuth && step === 5 && (
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[oklch(0.448_0.228_27.3)] text-white text-[13px] font-medium rounded-lg hover:bg-[oklch(0.400_0.218_27.3)] active:scale-[0.98] transition-all duration-150 disabled:opacity-60 cursor-pointer"
                    >
                      {submitting ? t("auth.sending") : t("sendRequest")}
                      {!submitting && <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              {submitError && !needsAuth && (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-700">
                  {submitError}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
