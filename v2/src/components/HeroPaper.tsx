import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "motion/react";
import type { HeroDict } from "@/components/Hero.tsx";
import { EASE, useLiveOffers, AnimatedPrice } from "@/components/hero/shared";

/* Direction B — "Paper precision". Light near-white base, near-black ink, one
   Swiss red. White space is the feature; the dossier is a crisp document. */

const stage: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.075, delayChildren: 0.08 } } };
const rise: Variants = {
  hidden: { y: 20, opacity: 0, filter: "blur(6px)" },
  show: { y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
};
const lineReveal: Variants = { hidden: { y: "112%" }, show: { y: "0%", transition: { duration: 1, ease: EASE } } };

export default function HeroPaper({ dict }: { dict: HeroDict }) {
  const reduce = useReducedMotion();
  return (
    <section className="grain relative isolate min-h-[100svh] overflow-hidden bg-paper text-ink">
      {/* faint light grid + a single warm red bloom at the top */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, oklch(0.145 0.02 27 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.145 0.02 27 / 0.04) 1px, transparent 1px)",
            backgroundSize: "clamp(52px, 6.2vw, 88px) clamp(52px, 6.2vw, 88px)",
            maskImage: "radial-gradient(120% 100% at 74% 30%, black 22%, transparent 72%)",
            WebkitMaskImage: "radial-gradient(120% 100% at 74% 30%, black 22%, transparent 72%)",
          }}
        />
        <div className="absolute right-[-6%] top-[-12%] h-[560px] w-[760px] max-w-[70vw] rounded-full opacity-[0.10] blur-[130px]" style={{ background: "var(--color-red)" }} />
      </div>

      {/* top hairline chrome */}
      <div className="absolute inset-x-0 top-[4.75rem] z-10">
        <div className="mx-auto flex max-w-[82rem] items-center justify-between border-t border-line px-[var(--gutter)] pt-3">
          <span className="num text-[10px] uppercase tracking-[0.22em] text-ink-400"><span className="text-ink-500">//</span> {dict.chromeFile} 001</span>
          <LiveClock label={dict.chromeLive} reduce={!!reduce} />
        </div>
      </div>

      <div className="relative z-10 mx-auto grid min-h-[100svh] w-full max-w-[82rem] grid-cols-1 items-center gap-14 px-[var(--gutter)] pb-24 pt-36 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:pt-32">
        <motion.div variants={stage} initial="hidden" animate="show" className="max-w-[36rem]">
          <motion.div variants={rise} className="mb-8 inline-flex items-center gap-2.5">
            <span className="num text-[11px] uppercase tracking-[0.2em] text-ink-500">
              <span style={{ color: "var(--color-red)" }}>[</span>&nbsp;{dict.kicker}&nbsp;<span style={{ color: "var(--color-red)" }}>]</span>
            </span>
          </motion.div>

          <h1 className="text-[clamp(2.5rem,4.9vw,3.75rem)] font-semibold leading-[0.98] tracking-[-0.02em] text-ink-900 [font-family:var(--font-display)]">
            <span className="block overflow-hidden pb-[0.08em]"><motion.span variants={lineReveal} className="block">{dict.line1}</motion.span></span>
            <span className="block overflow-hidden pb-[0.08em]"><motion.span variants={lineReveal} className="block text-ink-700">{dict.line2}</motion.span></span>
          </h1>

          <motion.p variants={rise} className="mt-8 max-w-[31rem] text-[1.0625rem] leading-[1.62] text-ink-500">{dict.sub}</motion.p>

          <motion.div variants={rise} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="/anfrage" className="group inline-flex items-center justify-center gap-2.5 rounded-[var(--radius-md)] px-6 py-3.5 text-[0.95rem] font-medium text-white transition-transform duration-200 hover:-translate-y-px" style={{ background: "var(--color-red)", boxShadow: "var(--shadow-red)" }}>
              {dict.ctaPrimary}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-hover:translate-x-0.5"><path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <a href="/haendler" className="inline-flex items-center justify-center rounded-[var(--radius-md)] px-5 py-3.5 text-[0.95rem] font-medium text-ink-700 ring-1 ring-inset ring-line-2 transition-colors duration-200 hover:text-ink-900 hover:ring-ink-400">{dict.ctaSecondary}</a>
          </motion.div>

          <motion.ul variants={rise} className="mt-11 flex flex-wrap gap-x-7 gap-y-2.5">
            {[dict.trustDealers, dict.trustFree, dict.trustTime].map((t) => (
              <li key={t} className="flex items-center gap-2 text-[0.8rem] text-ink-500">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M3 7.5l2.5 2.5L11 4.5" stroke="var(--color-red)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {t}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <DossierPanel dict={dict} reduce={!!reduce} />
      </div>

      <div className="absolute inset-x-0 bottom-6 z-10 hidden md:block">
        <div className="mx-auto flex max-w-[82rem] items-center justify-between px-[var(--gutter)]">
          <span className="num text-[10px] uppercase tracking-[0.22em] text-ink-400">{dict.scroll}</span>
          <span className="num text-[10px] uppercase tracking-[0.22em] text-ink-400">CH · {dict.cantons}</span>
        </div>
      </div>
      <style>{`@keyframes avPing { 75%, 100% { transform: scale(2.4); opacity: 0; } }`}</style>
    </section>
  );
}

function LiveClock({ label, reduce }: { label: string; reduce: boolean }) {
  const [now, setNow] = useState("");
  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setNow(fmt());
    if (reduce) return;
    const id = setInterval(() => setNow(fmt()), 1000);
    return () => clearInterval(id);
  }, [reduce]);
  return (
    <span className="num flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-ink-400">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full" style={{ background: "oklch(0.62 0.17 145)", animation: reduce ? "none" : "avPing 2.4s cubic-bezier(0,0,0.2,1) infinite" }} />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: "oklch(0.62 0.17 145)" }} />
      </span>
      {label} <span className="tabular-nums text-ink-500">{now}</span>
    </span>
  );
}

function DossierPanel({ dict, reduce }: { dict: HeroDict; reduce: boolean }) {
  const { sorted, bestMatch, count } = useLiveOffers(reduce);
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 34, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.95, ease: EASE, delay: 0.3 }}
      className="relative mx-auto w-full max-w-[27rem] lg:ml-auto lg:mr-0"
    >
      <div className="rounded-t-[var(--radius-xl)] border border-b-0 border-line bg-white p-5">
        <div className="flex items-center justify-between">
          <span className="num text-[10px] uppercase tracking-[0.18em] text-ink-400">{dict.requestLabel}</span>
          <span className="num text-[10px] tracking-[0.08em] text-ink-400">#AV-8241</span>
        </div>
        <h3 className="mt-3 text-[1.2rem] font-semibold tracking-[-0.02em] text-ink-900">{dict.reqModel}</h3>
        <dl className="mt-3.5 grid grid-cols-2 gap-x-6">
          {dict.rows.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-3 border-t border-line py-2">
              <dt className="num text-[10px] uppercase tracking-[0.08em] text-ink-400">{label}</dt>
              <dd className="num text-[12px] text-ink-700">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-b-[var(--radius-xl)] border border-line bg-paper-2 p-3 pt-3.5" style={{ boxShadow: "var(--shadow-float)" }}>
        <div className="mb-2.5 flex items-center justify-between px-1.5">
          <span className="num text-[10px] uppercase tracking-[0.18em] text-ink-400">{dict.offersLabel}</span>
          <span className="num flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-ink-500">
            <span className="tabular-nums text-ink-700">{count}</span> {dict.responding}
          </span>
        </div>
        <ul className="flex flex-col gap-1.5">
          <AnimatePresence initial={false}>
            {sorted.map((o, i) => {
              const isBest = o.match === bestMatch;
              return (
                <motion.li
                  key={o.id}
                  layout
                  initial={reduce ? false : { opacity: 0, x: 24, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  transition={{ layout: { duration: 0.5, ease: EASE }, duration: 0.55, ease: EASE, delay: reduce ? 0 : (i < 2 ? 0.6 + i * 0.1 : 0) }}
                  className="relative flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2.5"
                  style={{
                    borderColor: isBest ? "var(--color-red)" : "var(--color-line)",
                    background: isBest ? "var(--color-red-tint)" : "var(--color-paper)",
                  }}
                >
                  <span className="num grid h-8 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-line bg-white text-[11px] font-semibold text-ink-700">{o.canton}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.8rem] font-medium text-ink-900">{o.dealer}</p>
                    <p className="num text-[10px] uppercase tracking-[0.06em] text-ink-400">{o.match}% {dict.match}</p>
                  </div>
                  <div className="text-right">
                    <AnimatedPrice value={o.price} reduce={reduce} className="text-[0.9rem] font-semibold text-ink-900" />
                    {isBest && <p className="num text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--color-red)" }}>{dict.best}</p>}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>
    </motion.div>
  );
}
