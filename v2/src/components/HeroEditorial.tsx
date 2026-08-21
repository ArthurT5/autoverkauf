import { motion, useReducedMotion, type Variants } from "motion/react";
import type { HeroDict } from "@/components/Hero.tsx";
import { EASE } from "@/components/hero/shared";

/* Direction C — "Oversized editorial". The type IS the hero (Nova energy):
   massive Clash Display with an outlined payoff line. Pure typographic statement;
   the reverse mechanic is demonstrated in the How-it-works section below. */

const stage: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } };
const rise: Variants = {
  hidden: { y: 22, opacity: 0, filter: "blur(6px)" },
  show: { y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.85, ease: EASE } },
};
const lineReveal: Variants = { hidden: { y: "115%" }, show: { y: "0%", transition: { duration: 1.05, ease: EASE } } };

export default function HeroEditorial({ dict }: { dict: HeroDict }) {
  const reduce = useReducedMotion();

  return (
    <section className="grain-dark relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-void text-white">
      {/* atmosphere */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, oklch(1 0 0 / 0.03) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.03) 1px, transparent 1px)",
            backgroundSize: "clamp(56px, 6.4vw, 92px) clamp(56px, 6.4vw, 92px)",
            maskImage: "radial-gradient(120% 120% at 30% 40%, black 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(120% 120% at 30% 40%, black 30%, transparent 80%)",
          }}
        />
        <div className="absolute left-[-10%] top-[30%] h-[620px] w-[820px] max-w-[80vw] rounded-full opacity-[0.12] blur-[150px]" style={{ background: "var(--color-red)" }} />
      </div>

      {/* oversized type */}
      <motion.div variants={stage} initial="hidden" animate="show" className="relative z-10 mx-auto flex w-full max-w-[86rem] flex-1 flex-col justify-center px-[var(--gutter)] py-16">
        <motion.div variants={rise} className="mb-6">
          <span className="num text-[11px] uppercase tracking-[0.2em] text-white/55">
            <span style={{ color: "var(--color-red)" }}>[</span>&nbsp;{dict.kicker}&nbsp;<span style={{ color: "var(--color-red)" }}>]</span>
          </span>
        </motion.div>

        <h1 className="text-[clamp(3.25rem,9vw,8rem)] font-bold leading-[0.9] tracking-[-0.035em] [font-family:var(--font-display)]">
          <span className="block overflow-hidden pb-[0.06em]"><motion.span variants={lineReveal} className="block text-white">{dict.line1}</motion.span></span>
          <span className="block overflow-hidden pb-[0.06em]">
            <motion.span variants={lineReveal} className="block" style={{ WebkitTextStroke: "1.6px oklch(1 0 0 / 0.72)", color: "transparent" }}>
              {dict.line2}
            </motion.span>
          </span>
        </h1>

        <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <motion.p variants={rise} className="max-w-[34rem] text-[1.0625rem] leading-[1.6] text-white/60">{dict.sub}</motion.p>
          <motion.div variants={rise} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="/anfrage" className="group inline-flex items-center justify-center gap-2.5 rounded-[var(--radius-md)] px-6 py-3.5 text-[0.95rem] font-medium text-white transition-transform duration-200 hover:-translate-y-px" style={{ background: "var(--color-red)", boxShadow: "var(--shadow-red)" }}>
              {dict.ctaPrimary}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-hover:translate-x-0.5"><path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <a href="/haendler" className="inline-flex items-center justify-center rounded-[var(--radius-md)] px-5 py-3.5 text-[0.95rem] font-medium text-white/70 ring-1 ring-inset ring-white/12 transition-colors duration-200 hover:text-white hover:ring-white/25">{dict.ctaSecondary}</a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
