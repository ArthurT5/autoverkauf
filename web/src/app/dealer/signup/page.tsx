"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Nav } from "@/components/landing/nav";
import { PageHero } from "@/components/page-hero";
import { ArrowRight, CheckCircle } from "lucide-react";

const CANTONS = [
  "AG", "AI", "AR", "BE", "BL", "BS", "FR", "GE", "GL", "GR",
  "JU", "LU", "NE", "NW", "OW", "SG", "SH", "SO", "SZ", "TG",
  "TI", "UR", "VD", "VS", "ZG", "ZH",
];

const FIELD_CLASS =
  "w-full rounded-xl border border-[var(--hairline)] bg-white px-4 py-3 text-[14px] text-[var(--ink-900)] outline-none transition focus:border-[var(--red)] focus:ring-2 focus:ring-[var(--red)]/20";

export default function DealerSignupPage() {
  const t = useTranslations("dealerSignup");
  const [form, setForm] = useState({ name: "", company: "", email: "", password: "", canton: "", website: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const update = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dealer/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
          companyName: form.company,
          canton: form.canton,
          website: form.website,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? t("generic"));
      }
      setSubmittedEmail(form.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("generic"));
      setLoading(false);
    }
  }

  if (submittedEmail) {
    return (
      <main>
        <Nav />
        <div className="flex min-h-screen flex-col items-center justify-center px-6 pt-16 text-center">
          <span className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle className="h-8 w-8" />
          </span>
          <h1 className="text-[1.75rem] font-bold tracking-[-0.025em] text-[var(--ink-900)]">
            {t("successTitle")}
          </h1>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-[var(--ink-500)]">
            {t("successBody", { email: submittedEmail })}
          </p>
          <a
            href="/"
            className="mt-8 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--red)] hover:underline"
          >
            {t("back")} <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Nav />
      <PageHero eyebrow={t("eyebrow")} title={t("title")} sub={t("sub")} phase={4.9} />
      <div data-nav-theme="light" className="mx-auto max-w-lg px-6 pb-24 pt-14">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[var(--ink-700)]">
                {t("name")}
              </label>
              <input type="text" value={form.name} onChange={update("name")} required className={FIELD_CLASS} placeholder={t("namePh")} />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[var(--ink-700)]">
                {t("company")}
              </label>
              <input type="text" value={form.company} onChange={update("company")} required className={FIELD_CLASS} placeholder={t("companyPh")} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[var(--ink-700)]">
              {t("email")}
            </label>
            <input type="email" value={form.email} onChange={update("email")} required autoComplete="email" className={FIELD_CLASS} placeholder={t("emailPh")} />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[var(--ink-700)]">
              {t("password")}
            </label>
            <input type="password" value={form.password} onChange={update("password")} required minLength={8} autoComplete="new-password" className={FIELD_CLASS} placeholder={t("passwordPh")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[var(--ink-700)]">
                {t("canton")}
              </label>
              <select value={form.canton} onChange={update("canton")} required className={FIELD_CLASS}>
                <option value="">{t("select")}</option>
                {CANTONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[var(--ink-700)]">
                {t("website")}{" "}
                <span className="font-normal text-[var(--ink-400)]">({t("optional")})</span>
              </label>
              <input type="url" value={form.website} onChange={update("website")} className={FIELD_CLASS} placeholder="https://example.ch" />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-lift flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--red)] px-6 py-3.5 text-[14px] font-semibold text-white shadow-[var(--shadow-red)] transition disabled:opacity-60"
          >
            {loading ? t("submitting") : <><span>{t("submit")}</span> <ArrowRight className="h-4 w-4" /></>}
          </button>

          <p className="text-center text-[12.5px] text-[var(--ink-400)]">
            {t("already")}{" "}
            <a href="/login" className="text-[var(--red)] hover:underline">
              {t("signIn")}
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
