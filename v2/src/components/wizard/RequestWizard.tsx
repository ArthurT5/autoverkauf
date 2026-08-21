import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { chf } from "@/lib/format";
import { CANTONS } from "@/lib/cantons";
import { MAKES, type WizardDict } from "@/lib/i18n/wizard";
import { supabaseBrowser } from "@/lib/auth/client";

/* ─────────────────────────────────────────────────────────────────────────────
   The request wizard — the product's front door. Light, ultra-focused stage:
   one grouped question per screen, tick-ruler progress with a travelling red
   dot, and a live dossier that assembles the request as you answer (right
   panel on desktop, expandable sticky bar on mobile). Anonymous until the
   final step; draft auto-saves to localStorage; every dossier row is a
   shortcut back to its step. Subtle, fast GSAP transitions; reduced-motion
   and no-JS safe (island only — page requires JS by nature of a wizard).
   Submission is frontend-only for now (stored locally) — backend TODO.
   ──────────────────────────────────────────────────────────────────────────── */

type Lang = "en" | "de" | "fr" | "it";

interface Draft {
  v: 1;
  id: string;
  make: string | null; // make name or "ANY"
  model: string; // free text; "" = any
  modelSimilar: boolean; // "or similar" — buyer is open to comparable models
  body: string | null; // only when make === ANY
  budget: number;
  yearFrom: number;
  kmMax: number;
  fuel: string | null; // dict value or null = any
  gear: string | null;
  canton: string | null; // code, or "CH" = whole Switzerland
  radius: number;
  plz: string;
  email: string;
}

const ANY = "ANY";
const CH = "CH";
const YEAR_MAX = new Date().getFullYear();
const DRAFT_KEY = "av-request-draft";

const newDraft = (): Draft => ({
  v: 1,
  id: String(1000 + Math.floor(Math.random() * 9000)),
  make: null,
  model: "",
  modelSimilar: false,
  body: null,
  budget: 40000,
  yearFrom: 2018,
  kmMax: 100000,
  fuel: null,
  gear: null,
  canton: null,
  radius: 50,
  plz: "",
  email: "",
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const fmtKm = (n: number) => `${new Intl.NumberFormat("de-CH").format(n)} km`;

export default function RequestWizard({ dict, lang, homeHref, kontoHref }: { dict: WizardDict; lang: Lang; homeHref: string; kontoHref: string }) {
  const [d, setD] = useState<Draft>(newDraft);
  const [step, setStep] = useState(0); // 0..5, 6 = confirmation
  const [emailTouched, setEmailTouched] = useState(false);
  const [makeQuery, setMakeQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const stage = useRef<HTMLDivElement>(null);

  /* ── account step state: the email becomes the buyer's account ── */
  const [password, setPassword] = useState("");
  const [haveAccount, setHaveAccount] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    // Already signed in → no password step, submit straight to the account.
    // Subscribe as well: the session can land after mount (cookie flush,
    // token refresh, sign-out in another tab).
    const sb = supabaseBrowser();
    const apply = (email: string | null | undefined) => {
      if (email) {
        setSessionEmail(email);
        setD((p) => ({ ...p, email }));
      } else {
        setSessionEmail(null);
      }
    };
    sb.auth.getSession().then(({ data }) => apply(data.session?.user.email));
    const { data: sub } = sb.auth.onAuthStateChange((_evt, session) => apply(session?.user.email));
    return () => sub.subscription.unsubscribe();
  }, []);

  const set = (patch: Partial<Draft>) => setD((p) => ({ ...p, ...patch }));

  /* ── draft persistence ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.v === 1 && parsed.draft && typeof parsed.step === "number") {
          setD({ ...newDraft(), ...parsed.draft });
          setStep(Math.min(5, Math.max(0, parsed.step)));
        }
      }
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated || step > 5) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ v: 1, draft: d, step }));
    } catch {}
  }, [d, step, hydrated]);

  /* ── subtle, fast step transition ── */
  useEffect(() => {
    if (!stage.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".wz-in",
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.32, ease: "power3.out", stagger: 0.05, overwrite: true }
      );
    }, stage);
    return () => ctx.revert();
  }, [step]);

  /* ── validity per step ── */
  const emailOk = EMAIL_RE.test(d.email.trim());
  const passwordOk = sessionEmail !== null || password.length >= (haveAccount ? 1 : 8);
  const canNext = useMemo(() => {
    switch (step) {
      case 0: return d.make !== null;
      case 4: return d.canton !== null;
      case 5: return emailOk && passwordOk;
      default: return true;
    }
  }, [step, d.make, d.canton, emailOk, passwordOk]);

  const next = () => {
    if (!canNext) { if (step === 5) setEmailTouched(true); return; }
    if (step === 5) { void submit(); return; }
    setStep((s) => s + 1);
  };
  const back = () => setStep((s) => Math.max(0, s - 1));
  const jump = (s: number) => { if (step <= 5) { setStep(s); setSheetOpen(false); } };

  /* Sign in / create the account with the request's email, then insert the
     request under that account (RLS: buyer_id must equal auth.uid()). */
  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    const sb = supabaseBrowser();
    const email = d.email.trim();
    try {
      let userId: string;
      if (sessionEmail) {
        const { data } = await sb.auth.getUser();
        if (!data.user) throw new Error("generic");
        userId = data.user.id;
      } else if (haveAccount) {
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error || !data.user) throw new Error("wrong");
        userId = data.user.id;
      } else {
        const { data, error } = await sb.auth.signUp({ email, password });
        if (error) {
          if (/already|exists/i.test(error.message)) {
            // Account exists — maybe they typed their real password; try it.
            const retry = await sb.auth.signInWithPassword({ email, password });
            if (retry.error || !retry.data.user) throw new Error("exists");
            userId = retry.data.user.id;
          } else if (/password/i.test(error.message)) {
            throw new Error("weak");
          } else {
            throw new Error("generic");
          }
        } else {
          if (!data.user) throw new Error("generic");
          userId = data.user.id;
        }
      }

      const { error: insErr } = await sb.from("requests").insert({
        buyer_id: userId,
        make: d.make === ANY ? null : d.make,
        model: d.model.trim() || null,
        model_similar: d.modelSimilar,
        body: d.body === ANY ? null : d.body,
        budget_chf: d.budget,
        year_from: d.yearFrom <= 2005 ? null : d.yearFrom,
        km_max: d.kmMax,
        fuel: d.fuel,
        gear: d.gear,
        canton: d.canton,
        radius_km: d.canton === CH ? null : d.radius,
        plz: d.plz.trim() || null,
        buyer_email: email,
      });
      if (insErr) throw new Error("generic");

      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      setSessionEmail(email);
      setStep(6);
    } catch (e) {
      const code = (e as Error).message;
      setSubmitError(
        code === "wrong" ? dict.s6errWrong
        : code === "exists" ? dict.s6errExists
        : code === "weak" ? dict.s6errWeak
        : dict.s6errGeneric,
      );
    } finally {
      setSubmitting(false);
    }
  };
  const restart = () => { setD(newDraft()); setStep(0); setEmailTouched(false); setMakeQuery(""); };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !(e.target as HTMLElement).closest("textarea")) {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" && (t as HTMLInputElement).type === "text" && step === 0) return; // model field: Enter shouldn't skip make
      next();
    }
  };

  /* ── derived display values for the dossier ── */
  const cantonName = (code: string) => {
    if (code === CH) return dict.s5wholeCH;
    const c = CANTONS.find((x) => x.code === code);
    if (!c) return code;
    const l = lang === "en" ? "de" : lang;
    return c[l as "de" | "fr" | "it"];
  };
  const regionValue = d.canton === null ? null : d.canton === CH ? dict.s5wholeCH : `${cantonName(d.canton)} +${d.radius} km`;

  const rows: { label: string; value: string | null; step: number }[] = [
    { label: dict.dMake, value: d.make === null ? null : d.make === ANY ? dict.s1anyMake : d.make, step: 0 },
    d.make === ANY
      ? { label: dict.dBody, value: d.body === null ? null : d.body === ANY ? dict.anyBody : d.body, step: 0 }
      : { label: dict.dModel, value: d.make === null ? null : d.model.trim() ? `${d.model.trim()}${d.modelSimilar ? ` · ${dict.s1orSimilar}` : ""}` : dict.s1anyModel, step: 0 },
    { label: dict.dBudget, value: step > 1 || d.make !== null ? `${dict.s2upTo} ${chf(d.budget)}` : null, step: 1 },
    { label: dict.dYear, value: step > 2 ? (d.yearFrom <= 2005 ? dict.anyYear : `${d.yearFrom}+`) : null, step: 2 },
    { label: dict.dKm, value: step > 2 ? `≤ ${fmtKm(d.kmMax)}` : null, step: 2 },
    { label: dict.dFuel, value: step > 3 ? (d.fuel ?? dict.any) : null, step: 3 },
    { label: dict.dGear, value: step > 3 ? (d.gear ?? dict.any) : null, step: 3 },
    { label: dict.dRegion, value: regionValue, step: 4 },
  ];
  const filledCount = rows.filter((r) => r.value !== null).length;

  const makesFiltered = MAKES.filter((m) => m.name.toLowerCase().includes(makeQuery.trim().toLowerCase()));
  const modelSuggestions = MAKES.find((m) => m.name === d.make)?.models ?? [];

  /* ═══════════════════════════ confirmation ═══════════════════════════ */
  if (step === 6) {
    return (
      <section data-nav="light" className="grain relative flex min-h-[100svh] flex-col items-center justify-center bg-paper px-[var(--gutter)] py-28 text-center text-ink">
        <span className="grid h-14 w-14 place-items-center rounded-full text-white" style={{ background: "var(--color-red)", boxShadow: "var(--shadow-red)" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <h1 className="mt-7 text-[clamp(2.2rem,4.6vw,3.6rem)] font-semibold leading-[1.0] tracking-[-0.03em] text-ink-900 [font-family:var(--font-display)]">
          {dict.cTitle}
        </h1>
        <p className="mt-4 max-w-[34rem] text-[1.05rem] leading-[1.6] text-ink-500">{dict.cLead}</p>

        <ol className="mt-10 flex w-full max-w-[30rem] flex-col text-left">
          {[dict.cNext1, dict.cNext2, dict.cNext3].map((s, i) => (
            <li key={i} className="flex items-start gap-4 border-t border-line py-4 last:border-b">
              <span className="mt-0.5 text-[12px] [font-family:var(--font-mono)]" style={{ color: "var(--color-red)" }}>0{i + 1}</span>
              <span className="text-[0.95rem] leading-[1.55] text-ink-700">{s}</span>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <a href={kontoHref} className="group inline-flex items-center gap-2.5 rounded-[var(--radius-md)] px-6 py-3.5 text-[0.95rem] font-medium text-white transition-transform duration-200 hover:-translate-y-px" style={{ background: "var(--color-red)", boxShadow: "var(--shadow-red)" }}>
            {dict.cDashboard}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-hover:translate-x-0.5"><path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
          <button onClick={restart} className="px-4 py-3.5 text-[0.95rem] font-medium text-ink-700 transition-colors hover:text-ink-900">
            {dict.cAgain}
          </button>
        </div>
      </section>
    );
  }

  /* ═══════════════════════════ the wizard ═══════════════════════════ */
  return (
    <section data-nav="light" className="grain relative min-h-[100svh] bg-paper text-ink" onKeyDown={onKey}>
      <div className="mx-auto flex min-h-[100svh] w-full max-w-[82rem] flex-col px-[var(--gutter)] pb-28 pt-24 lg:pb-16">
        {/* ── chrome: kicker · ruler · counter ── */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-500 [font-family:var(--font-mono)]">
              <span style={{ color: "var(--color-red)" }}>//</span> {dict.kicker}
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-ink-400 [font-family:var(--font-mono)]" aria-label={`${dict.stepLabel} ${step + 1} ${dict.ofSteps} 6`}>
              <span className="text-ink-900">0{step + 1}</span> / 06
            </span>
          </div>
          <div className="relative mt-4">
            <div
              className="h-2.5 w-full"
              style={{
                backgroundImage: "repeating-linear-gradient(to right, var(--color-line-2) 0 1px, transparent 1px 10px)",
                maskImage: "linear-gradient(to bottom, black 55%, transparent)",
                WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent)",
              }}
              aria-hidden
            />
            <span
              className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[left] duration-500"
              style={{ left: `${(step / 5) * 100}%`, background: "var(--color-red)", transitionTimingFunction: "cubic-bezier(0.25,1,0.5,1)" }}
              aria-hidden
            />
          </div>
        </div>

        {/* ── stage: question + dossier ── */}
        <div className="mt-10 grid flex-1 grid-cols-1 items-start gap-12 lg:mt-14 lg:grid-cols-[1fr_22rem] lg:gap-20">
          <div ref={stage} className="max-w-[38rem]">
            {/* STEP 1 · car */}
            {step === 0 && (
              <div>
                <h1 className="wz-in text-[clamp(1.9rem,3.6vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.02em] text-ink-900 [font-family:var(--font-display)]">{dict.s1q}</h1>
                <div className="wz-in mt-8">
                  <div className="flex items-baseline justify-between gap-4">
                    <label className="text-[11px] uppercase tracking-[0.14em] text-ink-400 [font-family:var(--font-mono)]" htmlFor="wz-make-search">{dict.s1makeLabel}</label>
                    <input
                      id="wz-make-search"
                      type="text"
                      value={makeQuery}
                      onChange={(e) => setMakeQuery(e.target.value)}
                      placeholder={dict.s1searchMakes}
                      className="w-40 border-b border-line bg-transparent pb-1 text-right text-[0.85rem] text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-ink-400"
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <Chip active={d.make === ANY} onClick={() => set({ make: d.make === ANY ? null : ANY, model: "", modelSimilar: false, body: null })} accent>
                      {dict.s1anyMake}
                    </Chip>
                    {makesFiltered.map((m) => (
                      <Chip key={m.name} active={d.make === m.name} onClick={() => set({ make: d.make === m.name ? null : m.name, body: null })}>
                        {m.name}
                      </Chip>
                    ))}
                  </div>
                </div>

                {d.make && d.make !== ANY && (
                  <div className="wz-in mt-8">
                    <label className="text-[11px] uppercase tracking-[0.14em] text-ink-400 [font-family:var(--font-mono)]" htmlFor="wz-model">{dict.s1modelLabel}</label>
                    <input
                      id="wz-model"
                      type="text"
                      value={d.model}
                      onChange={(e) => set({ model: e.target.value })}
                      placeholder={dict.s1modelPlaceholder}
                      className="mt-2 w-full border-b border-line-2 bg-transparent pb-2 text-[1.3rem] font-medium text-ink-900 outline-none transition-colors placeholder:font-normal placeholder:text-ink-400/70 focus:border-ink-900"
                    />
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Chip small active={d.model.trim() === ""} onClick={() => set({ model: "", modelSimilar: false })}>{dict.s1anyModel}</Chip>
                      {modelSuggestions.map((m) => (
                        <Chip small key={m} active={d.model === m} onClick={() => set({ model: d.model === m ? "" : m })}>{m}</Chip>
                      ))}
                    </div>
                    {d.model.trim() !== "" && (
                      <button
                        type="button"
                        aria-pressed={d.modelSimilar}
                        onClick={() => set({ modelSimilar: !d.modelSimilar })}
                        className={`mt-4 flex w-full items-center gap-3 rounded-[var(--radius-sm)] border p-3.5 text-left transition-all duration-150 ${
                          d.modelSimilar
                            ? "border-red bg-red/5"
                            : "border-line-2 hover:border-ink-400"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors ${
                            d.modelSimilar ? "border-red bg-red text-white" : "border-line-2 text-transparent"
                          }`}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.2l2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[0.9rem] font-medium text-ink-900">{dict.s1orSimilar}</span>
                          <span className="mt-0.5 block text-[0.8rem] leading-snug text-ink-500">{dict.s1orSimilarHint}</span>
                        </span>
                      </button>
                    )}
                  </div>
                )}

                {d.make === ANY && (
                  <div className="wz-in mt-8">
                    <span className="text-[11px] uppercase tracking-[0.14em] text-ink-400 [font-family:var(--font-mono)]">{dict.s1bodyLabel}</span>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Chip active={d.body === ANY} onClick={() => set({ body: d.body === ANY ? null : ANY })} accent>{dict.anyBody}</Chip>
                      {dict.bodies.map((b) => (
                        <Chip key={b} active={d.body === b} onClick={() => set({ body: d.body === b ? null : b })}>{b}</Chip>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2 · budget */}
            {step === 1 && (
              <div>
                <h1 className="wz-in text-[clamp(1.9rem,3.6vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.02em] text-ink-900 [font-family:var(--font-display)]">{dict.s2q}</h1>
                <div className="wz-in mt-12">
                  <BigValue prefix={dict.s2upTo} value={d.budget} display={chf(d.budget)} min={5000} max={150000} step={1000} onChange={(v) => set({ budget: v })} />
                  <Slider value={d.budget} min={5000} max={150000} step={1000} onChange={(v) => set({ budget: v })} ariaLabel={dict.dBudget} />
                  <p className="mt-4 text-[0.8rem] text-ink-400">{dict.s2hint}</p>
                </div>
              </div>
            )}

            {/* STEP 3 · year + km */}
            {step === 2 && (
              <div>
                <h1 className="wz-in text-[clamp(1.9rem,3.6vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.02em] text-ink-900 [font-family:var(--font-display)]">{dict.s3q}</h1>
                <div className="wz-in mt-10">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-ink-400 [font-family:var(--font-mono)]">{dict.s3fromYear}</span>
                  <BigValue value={d.yearFrom} display={d.yearFrom <= 2005 ? dict.anyYear : String(d.yearFrom)} min={2005} max={YEAR_MAX} step={1} onChange={(v) => set({ yearFrom: v })} compact />
                  <Slider value={d.yearFrom} min={2005} max={YEAR_MAX} step={1} onChange={(v) => set({ yearFrom: v })} ariaLabel={dict.s3fromYear} />
                </div>
                <div className="wz-in mt-10">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-ink-400 [font-family:var(--font-mono)]">{dict.s3maxKm}</span>
                  <BigValue value={d.kmMax} display={fmtKm(d.kmMax)} min={10000} max={200000} step={5000} onChange={(v) => set({ kmMax: v })} compact />
                  <Slider value={d.kmMax} min={10000} max={200000} step={5000} onChange={(v) => set({ kmMax: v })} ariaLabel={dict.s3maxKm} />
                </div>
              </div>
            )}

            {/* STEP 4 · fuel + gearbox */}
            {step === 3 && (
              <div>
                <h1 className="wz-in text-[clamp(1.9rem,3.6vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.02em] text-ink-900 [font-family:var(--font-display)]">{dict.s4q}</h1>
                <div className="wz-in mt-9">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-ink-400 [font-family:var(--font-mono)]">{dict.s4fuelLabel}</span>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Chip active={d.fuel === null} onClick={() => set({ fuel: null })} accent>{dict.any}</Chip>
                    {dict.fuels.map((f) => (
                      <Chip key={f} active={d.fuel === f} onClick={() => set({ fuel: d.fuel === f ? null : f })}>{f}</Chip>
                    ))}
                  </div>
                </div>
                <div className="wz-in mt-9">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-ink-400 [font-family:var(--font-mono)]">{dict.s4gearLabel}</span>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Chip active={d.gear === null} onClick={() => set({ gear: null })} accent>{dict.any}</Chip>
                    {dict.gears.map((g) => (
                      <Chip key={g} active={d.gear === g} onClick={() => set({ gear: d.gear === g ? null : g })}>{g}</Chip>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5 · region */}
            {step === 4 && (
              <div>
                <h1 className="wz-in text-[clamp(1.9rem,3.6vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.02em] text-ink-900 [font-family:var(--font-display)]">{dict.s5q}</h1>
                <div className="wz-in mt-8">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-ink-400 [font-family:var(--font-mono)]">{dict.s5cantonLabel}</span>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Chip active={d.canton === CH} onClick={() => set({ canton: d.canton === CH ? null : CH })} accent>{dict.s5wholeCH}</Chip>
                    {CANTONS.map((c) => (
                      <Chip small key={c.code} active={d.canton === c.code} onClick={() => set({ canton: d.canton === c.code ? null : c.code })} title={cantonName(c.code)}>
                        {c.code}
                      </Chip>
                    ))}
                  </div>
                </div>
                {d.canton && d.canton !== CH && (
                  <div className="wz-in mt-9 grid grid-cols-1 gap-8 sm:grid-cols-[1fr_auto]">
                    <div>
                      <span className="text-[11px] uppercase tracking-[0.14em] text-ink-400 [font-family:var(--font-mono)]">{dict.s5radius}</span>
                      <p className="mt-1 text-[1.5rem] font-medium tabular-nums text-ink-900 [font-family:var(--font-mono)]">+{d.radius} km</p>
                      <Slider value={d.radius} min={10} max={200} step={10} onChange={(v) => set({ radius: v })} ariaLabel={dict.s5radius} />
                    </div>
                    <div className="sm:w-40">
                      <label className="text-[11px] uppercase tracking-[0.14em] text-ink-400 [font-family:var(--font-mono)]" htmlFor="wz-plz">
                        {dict.s5plzLabel} <span className="text-ink-400/70">· {dict.optional}</span>
                      </label>
                      <input
                        id="wz-plz"
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={d.plz}
                        onChange={(e) => set({ plz: e.target.value.replace(/\D/g, "") })}
                        placeholder={dict.s5plzPlaceholder}
                        className="mt-2 w-full border-b border-line-2 bg-transparent pb-2 text-[1.3rem] font-medium tabular-nums text-ink-900 outline-none transition-colors [font-family:var(--font-mono)] placeholder:text-ink-400/70 focus:border-ink-900"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 6 · account — signed-in users just review & send */}
            {step === 5 && sessionEmail && (
              <div>
                <h1 className="wz-in text-[clamp(1.9rem,3.6vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.02em] text-ink-900 [font-family:var(--font-display)]">{dict.s6qReady}</h1>
                <div className="wz-in mt-8 max-w-[26rem]">
                  <div className="flex items-center gap-3 rounded-full border border-line-2 py-2 pl-2 pr-4">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-red text-[0.8rem] font-semibold uppercase text-white">
                      {sessionEmail[0]}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[0.9rem] text-ink-900">{sessionEmail}</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M3 7.5l2.5 2.5L11 4.5" stroke="var(--color-red)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <button
                    type="button"
                    onClick={async () => { await supabaseBrowser().auth.signOut(); setSessionEmail(null); set({ email: "" }); }}
                    className="mt-3 text-[0.85rem] text-ink-400 underline decoration-line-2 underline-offset-4 transition-colors hover:text-ink-900"
                  >
                    {dict.s6notYou}
                  </button>

                  {submitError && (
                    <p role="alert" className="mt-5 rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[0.875rem]" style={{ color: "var(--color-red-deep)", background: "oklch(0.6 0.2 27 / 0.06)", border: "1px solid oklch(0.6 0.2 27 / 0.3)" }}>
                      {submitError}
                    </p>
                  )}

                  <p className="mt-6 text-[0.9rem] leading-[1.6] text-ink-500">{dict.s6readyNote}</p>
                </div>
              </div>
            )}

            {/* STEP 6 · account — new visitor: email + password */}
            {step === 5 && !sessionEmail && (
              <div>
                <h1 className="wz-in text-[clamp(1.9rem,3.6vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.02em] text-ink-900 [font-family:var(--font-display)]">{dict.s6q}</h1>
                <div className="wz-in mt-10 max-w-[26rem]">
                  <label className="text-[11px] uppercase tracking-[0.14em] text-ink-400 [font-family:var(--font-mono)]" htmlFor="wz-email">{dict.s6emailLabel}</label>
                  <input
                    id="wz-email"
                    type="email"
                    autoComplete="email"
                    value={d.email}
                    onChange={(e) => set({ email: e.target.value })}
                    onBlur={() => setEmailTouched(true)}
                    placeholder={dict.s6emailPlaceholder}
                    className="mt-2 w-full border-b bg-transparent pb-2 text-[1.3rem] font-medium text-ink-900 outline-none transition-colors placeholder:font-normal placeholder:text-ink-400/70 focus:border-ink-900"
                    style={{ borderColor: emailTouched && !emailOk ? "var(--color-red)" : "var(--color-line-2)" }}
                    aria-invalid={emailTouched && !emailOk}
                  />
                  {emailTouched && !emailOk && (
                    <p className="mt-2 text-[0.85rem]" style={{ color: "var(--color-red)" }}>{dict.s6emailError}</p>
                  )}

                  {(
                    <>
                      <label className="mt-8 block text-[11px] uppercase tracking-[0.14em] text-ink-400 [font-family:var(--font-mono)]" htmlFor="wz-password">
                        {dict.s6password}
                      </label>
                      <input
                        id="wz-password"
                        type="password"
                        autoComplete={haveAccount ? "current-password" : "new-password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-2 w-full border-b border-line-2 bg-transparent pb-2 text-[1.3rem] font-medium text-ink-900 outline-none transition-colors focus:border-ink-900"
                      />
                      {!haveAccount && <p className="mt-2 text-[0.85rem] text-ink-400">{dict.s6passwordHint}</p>}
                      <button
                        type="button"
                        onClick={() => { setHaveAccount(!haveAccount); setSubmitError(null); }}
                        className="mt-4 text-[0.875rem] text-ink-500 underline decoration-line-2 underline-offset-4 transition-colors hover:text-ink-900"
                      >
                        {haveAccount ? dict.s6newHere : dict.s6haveAccount}
                      </button>
                    </>
                  )}

                  {submitError && (
                    <p role="alert" className="mt-5 rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[0.875rem]" style={{ color: "var(--color-red-deep)", background: "oklch(0.6 0.2 27 / 0.06)", border: "1px solid oklch(0.6 0.2 27 / 0.3)" }}>
                      {submitError}
                    </p>
                  )}

                  <p className="mt-6 text-[0.9rem] leading-[1.6] text-ink-500">{dict.s6note}</p>
                </div>
              </div>
            )}

            {/* ── controls ── */}
            <div className="wz-in mt-12 flex items-center gap-3">
              {step > 0 && (
                <button onClick={back} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-line-2 text-ink-700 transition-colors hover:border-ink-400 hover:text-ink-900" aria-label={dict.back}>
                  <svg width="17" height="17" viewBox="0 0 16 16" fill="none"><path d="M13 8H4M7.5 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              )}
              <button
                onClick={next}
                disabled={!canNext || submitting}
                className="group inline-flex items-center justify-center gap-2.5 rounded-[var(--radius-md)] px-7 py-3.5 text-[0.95rem] font-medium text-white transition-all duration-200 enabled:hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-35"
                style={{ background: "var(--color-red)", boxShadow: canNext ? "var(--shadow-red)" : "none" }}
              >
                {submitting ? "…" : step === 5 ? dict.submit : dict.next}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-enabled:group-hover:translate-x-0.5"><path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>

            {/* reassurance */}
            <div className="wz-in mt-10 flex flex-wrap gap-x-6 gap-y-2">
              {[dict.free, dict.anon].map((r) => (
                <span key={r} className="flex items-center gap-2 text-[0.8rem] text-ink-500">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M3 7.5l2.5 2.5L11 4.5" stroke="var(--color-red)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* ── the live dossier (desktop) ── */}
          <aside className="sticky top-24 hidden lg:block">
            <Dossier dict={dict} rows={rows} id={d.id} onJump={jump} />
          </aside>
        </div>
      </div>

      {/* ── mobile dossier: sticky bottom bar + sheet ── */}
      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        {sheetOpen && (
          <div className="mx-3 mb-2 rounded-[var(--radius-lg)] border border-line bg-white p-4" style={{ boxShadow: "var(--shadow-float)" }}>
            <Dossier dict={dict} rows={rows} id={d.id} onJump={jump} bare />
          </div>
        )}
        <button
          onClick={() => setSheetOpen((o) => !o)}
          className="flex w-full items-center justify-between border-t border-line bg-white/95 px-5 py-3.5 backdrop-blur-md"
          aria-expanded={sheetOpen}
        >
          <span className="text-[11px] uppercase tracking-[0.16em] text-ink-500 [font-family:var(--font-mono)]">
            {dict.dTitle} · <span className="text-ink-900">{filledCount}/8</span>
          </span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className={`text-ink-500 transition-transform duration-300 ${sheetOpen ? "rotate-180" : ""}`}>
            <path d="M3 10l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* slider styling */}
      <style>{`
        .wz-range { -webkit-appearance: none; appearance: none; width: 100%; height: 22px; background: transparent; cursor: pointer; }
        .wz-range::-webkit-slider-runnable-track { height: 3px; border-radius: 2px; background: var(--wz-fill); }
        .wz-range::-moz-range-track { height: 3px; border-radius: 2px; background: var(--wz-fill); }
        .wz-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; margin-top: -7.5px; height: 18px; width: 18px; border-radius: 50%; background: #fff; border: 2px solid var(--color-red); box-shadow: 0 1px 4px oklch(0 0 0 / 0.15); transition: transform 0.15s var(--ease-out-quart); }
        .wz-range::-moz-range-thumb { height: 18px; width: 18px; border-radius: 50%; background: #fff; border: 2px solid var(--color-red); box-shadow: 0 1px 4px oklch(0 0 0 / 0.15); }
        .wz-range:active::-webkit-slider-thumb { transform: scale(1.15); }
        .wz-range:focus-visible { outline: 2px solid var(--color-red); outline-offset: 4px; border-radius: 4px; }
      `}</style>
    </section>
  );
}

/* ─────────────────────────── building blocks ─────────────────────────── */

function Chip({ children, active, onClick, accent, small, title }: { children: React.ReactNode; active: boolean; onClick: () => void; accent?: boolean; small?: boolean; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`${small ? "px-2.5 py-1.5 text-[0.8rem]" : "px-3.5 py-2 text-[0.875rem]"} rounded-full border font-medium transition-all duration-150 ${
        active ? "text-white" : "bg-white text-ink-700 hover:border-ink-400"
      }`}
      style={active ? { background: "var(--color-red)", borderColor: "var(--color-red)" } : { borderColor: "var(--color-line-2)" }}
    >
      {accent && !active ? <span className="mr-1" style={{ color: "var(--color-red)" }}>∗</span> : null}
      {children}
    </button>
  );
}

function Slider({ value, min, max, step, onChange, ariaLabel }: { value: number; min: number; max: number; step: number; onChange: (v: number) => void; ariaLabel: string }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      className="wz-range mt-4"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ ["--wz-fill" as string]: `linear-gradient(to right, var(--color-red) ${pct}%, var(--color-line-2) ${pct}%)` }}
    />
  );
}

/** Big numeric display; tap to type the exact value. */
function BigValue({ value, display, prefix, min, max, step, onChange, compact }: { value: number; display: string; prefix?: string; min: number; max: number; step: number; onChange: (v: number) => void; compact?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState(String(value));
  const commit = () => {
    const n = Number(raw.replace(/[^\d]/g, ""));
    if (!Number.isNaN(n) && n > 0) onChange(Math.min(max, Math.max(min, Math.round(n / step) * step)));
    setEditing(false);
  };
  return (
    <div className={`flex items-baseline gap-3 ${compact ? "mt-1" : ""}`}>
      {prefix && <span className="text-[1rem] text-ink-400">{prefix}</span>}
      {editing ? (
        <input
          autoFocus
          type="text"
          inputMode="numeric"
          defaultValue={value}
          onChange={(e) => setRaw(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); commit(); } }}
          className={`${compact ? "text-[1.5rem]" : "text-[clamp(2.2rem,5vw,3.2rem)]"} w-[7ch] border-b-2 bg-transparent font-medium tabular-nums text-ink-900 outline-none [font-family:var(--font-mono)]`}
          style={{ borderColor: "var(--color-red)" }}
        />
      ) : (
        <button
          type="button"
          onClick={() => { setRaw(String(value)); setEditing(true); }}
          className={`${compact ? "text-[1.5rem]" : "text-[clamp(2.2rem,5vw,3.2rem)]"} border-b-2 border-transparent font-medium tabular-nums text-ink-900 transition-colors [font-family:var(--font-mono)] hover:border-line-2`}
        >
          {display}
        </button>
      )}
    </div>
  );
}

function Dossier({ dict, rows, id, onJump, bare }: { dict: WizardDict; rows: { label: string; value: string | null; step: number }[]; id: string; onJump: (s: number) => void; bare?: boolean }) {
  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.18em] text-ink-400 [font-family:var(--font-mono)]">{dict.dTitle}</span>
        <span className="text-[10px] tracking-[0.08em] text-ink-400 [font-family:var(--font-mono)]">#AV-{id}</span>
      </div>
      <dl className="mt-3">
        {rows.map((r) => (
          <button
            key={r.label}
            type="button"
            onClick={() => onJump(r.step)}
            className="group flex w-full items-baseline justify-between gap-4 border-t border-line py-2.5 text-left transition-colors hover:bg-paper-2/60"
            title={dict.edit}
          >
            <dt className="text-[10px] uppercase tracking-[0.08em] text-ink-400 [font-family:var(--font-mono)]">{r.label}</dt>
            <dd className={`truncate text-[12px] [font-family:var(--font-mono)] ${r.value ? "text-ink-900" : "text-ink-400/50"}`}>
              {r.value ?? "—"}
            </dd>
          </button>
        ))}
      </dl>
    </>
  );
  if (bare) return inner;
  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-white p-5" style={{ boxShadow: "var(--shadow-card)" }}>
      {inner}
    </div>
  );
}
