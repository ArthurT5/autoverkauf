"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/logo";
import { HalftoneCanvas } from "@/components/motion/halftone-canvas";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const t = useTranslations("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError(t("invalid"));
      setLoading(false);
      return;
    }
    // route by role: dealers and admins have their own dashboards
    try {
      const session = await fetch("/api/auth/session").then((r) => r.json());
      const role = session?.user?.role;
      router.push(
        role === "DEALER"
          ? "/dealer/dashboard"
          : role === "ADMIN"
            ? "/admin/dashboard"
            : "/buyer/dashboard"
      );
    } catch {
      router.push("/buyer/dashboard");
    }
  }

  return (
    <main className="grain-dark relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[oklch(0.068_0.008_27)] px-6 py-12">
      <HalftoneCanvas inkAlpha={0.45} farBase={0.72} nearBase={0.88} phase={6.2} />
      <div className="relative z-10 w-full max-w-sm">
        <a href="/" className="mb-8 block">
          <Logo dark />
        </a>

        <div className="rounded-3xl border border-[var(--hairline)] bg-white p-8 shadow-[var(--shadow-float)]">
        <h1 className="text-[1.75rem] font-bold tracking-[-0.025em] text-[oklch(0.112_0.012_27.0)]">
          {t("title")}
        </h1>
        <p className="mt-1.5 text-[14.5px] text-[oklch(0.468_0.012_27.0)]">
          {t("subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[var(--ink-700)]">
              {t("email")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-[var(--hairline)] bg-white px-4 py-3 text-[14px] text-[var(--ink-900)] outline-none transition focus:border-[var(--red)] focus:ring-2 focus:ring-[var(--red)]/20"
              placeholder={t("emailPh")}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[var(--ink-700)]">
              {t("password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-[var(--hairline)] bg-white px-4 py-3 text-[14px] text-[var(--ink-900)] outline-none transition focus:border-[var(--red)] focus:ring-2 focus:ring-[var(--red)]/20"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-lift mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--red)] px-6 py-3.5 text-[14px] font-semibold text-white shadow-[var(--shadow-red)] transition disabled:opacity-60"
          >
            {loading ? t("submitting") : <><span>{t("submit")}</span> <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
        </div>

        <div className="mt-7 space-y-2.5 text-center text-[13.5px] text-white/55">
          <p>
            {t("newTo")}{" "}
            <a href="/buyer/requests/new" className="font-medium text-white hover:underline">
              {t("findCar")}
            </a>
          </p>
          <p>
            {t("areDealer")}{" "}
            <a href="/dealer/signup" className="font-medium text-white hover:underline">
              {t("apply")}
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
