import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useTransform,
  animate,
  type Variants,
} from "motion/react";
import { chf } from "@/lib/format";
import type { CantonCode } from "@/lib/cantons";

/* ---------------------------------------------------------------------------
   Buyer-side hero. The buyer's request is a dossier; verified dealers compete
   by sending matching offers that arrive and re-rank live. Strings are resolved
   on the server and passed in so the island stays locale-correct.
--------------------------------------------------------------------------- */
export interface HeroDict {
  kicker: string;
  line1: string;
  line2: string;
  sub: string;
  ctaPrimary: string;
  ctaSecondary: string;
  trustDealers: string;
  trustFree: string;
  trustTime: string;
  chromeFile: string;
  chromeLive: string;
  rail: string;
  scroll: string;
  cantons: string;
  requestLabel: string;
  reqModel: string;
  rows: [string, string][]; // [label, value]
  offersLabel: string;
  responding: string;
  best: string;
  match: string;
}

interface Offer {
  id: string;
  dealer: string;
  canton: CantonCode;
  price: number;
  match: number;
}

// Illustrative product UI for one example request — not platform statistics.
const OFFER_POOL: Offer[] = [
  { id: "a", dealer: "Garage Bellevue", canton: "ZH", price: 39800, match: 96 },
  { id: "b", dealer: "Auto Zugersee", canton: "ZG", price: 38900, match: 93 },
  { id: "c", dealer: "Garage Reuss", canton: "AG", price: 40500, match: 91 },
  { id: "d", dealer: "Carrosserie Aare", canton: "BE", price: 39200, match: 89 },
];

const EASE = [0.16, 1, 0.3, 1] as const;

const stage: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.075, delayChildren: 0.08 } },
};
const rise: Variants = {
  hidden: { y: 20, opacity: 0, filter: "blur(6px)" },
  show: { y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
};
const lineReveal: Variants = {
  hidden: { y: "112%" },
  show: { y: "0%", transition: { duration: 1, ease: EASE } },
};

export default function Hero({ dict }: { dict: HeroDict }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // Subtle scroll parallax — the panel drifts up and the atmosphere recedes.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const panelY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -64]);
  const atmosY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="grain-dark relative isolate min-h-[100svh] overflow-hidden bg-void text-white"
    >
      {/* Atmosphere: instrument grid + a single red horizon */}
      <motion.div style={{ y: atmosY }} className="absolute inset-0 -z-10">
        <BackdropGrid />
        <div
          aria-hidden
          className="absolute right-[-8%] top-[34%] h-[620px] w-[820px] max-w-[80vw] -translate-y-1/2 rounded-full opacity-[0.13] blur-[140px]"
          style={{ background: "var(--color-red)" }}
        />
      </motion.div>

      {/* Left coordinate rail — one deliberate signature, not per-section chrome */}
      <motion.div
        style={{ opacity: fade }}
        aria-hidden
        className="pointer-events-none absolute left-[calc(var(--gutter)-0.35rem)] top-1/2 hidden -translate-y-1/2 xl:block"
      >
        <span
          className="num block whitespace-nowrap text-[10px] uppercase tracking-[0.34em] text-white/28"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {dict.rail}
        </span>
      </motion.div>

      {/* Top instrument chrome */}
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="absolute inset-x-0 top-[4.75rem] z-10"
      >
        <div className="mx-auto flex max-w-[82rem] items-center justify-between px-[var(--gutter)]">
          <span className="num flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/35">
            <span className="text-white/50">//</span> {dict.chromeFile} 001
          </span>
          <LiveClock label={dict.chromeLive} reduce={!!reduce} />
        </div>
      </motion.div>

      <div className="relative z-10 mx-auto grid min-h-[100svh] w-full max-w-[82rem] grid-cols-1 items-center gap-14 px-[var(--gutter)] pb-24 pt-36 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:pt-32">
        {/* ─────────────────────────── Message ─────────────────────────── */}
        <motion.div variants={stage} initial="hidden" animate="show" className="max-w-[36rem]">
          <motion.div variants={rise} className="mb-8 inline-flex items-center gap-2.5">
            <span className="num text-[11px] uppercase tracking-[0.2em] text-white/55">
              <span style={{ color: "var(--color-red)" }}>[</span>
              &nbsp;{dict.kicker}&nbsp;
              <span style={{ color: "var(--color-red)" }}>]</span>
            </span>
          </motion.div>

          <h1 className="text-[clamp(2.5rem,4.9vw,3.75rem)] font-semibold leading-[0.98] tracking-[-0.02em] [font-family:var(--font-display)]">
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={lineReveal} className="block text-white">
                {dict.line1}
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={lineReveal} className="block text-white/85">
                {dict.line2}
              </motion.span>
            </span>
          </h1>

          <motion.p variants={rise} className="mt-8 max-w-[31rem] text-[1.0625rem] leading-[1.62] text-white/60">
            {dict.sub}
          </motion.p>

          <motion.div variants={rise} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <MagneticCta href="/anfrage" reduce={!!reduce}>
              {dict.ctaPrimary}
            </MagneticCta>
            <a
              href="/haendler"
              className="inline-flex items-center justify-center rounded-[var(--radius-md)] px-5 py-3.5 text-[0.95rem] font-medium text-white/70 ring-1 ring-inset ring-white/12 transition-colors duration-200 hover:text-white hover:ring-white/25"
            >
              {dict.ctaSecondary}
            </a>
          </motion.div>

          <motion.ul variants={rise} className="mt-11 flex flex-wrap gap-x-7 gap-y-2.5">
            {[dict.trustDealers, dict.trustFree, dict.trustTime].map((t) => (
              <li key={t} className="flex items-center gap-2 text-[0.8rem] text-white/65">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M3 7.5l2.5 2.5L11 4.5" stroke="var(--color-red)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* ─────────────────────── Dossier + live offers ─────────────────────── */}
        <motion.div style={{ y: panelY }}>
          <DossierPanel dict={dict} reduce={!!reduce} />
        </motion.div>
      </div>

      {/* Bottom instrument bar */}
      <motion.div
        style={{ opacity: fade }}
        className="absolute inset-x-0 bottom-6 z-10 hidden md:block"
      >
        <div className="mx-auto flex max-w-[82rem] items-center justify-between px-[var(--gutter)]">
          <a href="/so-funktionierts" className="group num flex items-center gap-2.5 text-[10px] uppercase tracking-[0.22em] text-white/40 transition-colors hover:text-white/70">
            <span className="grid h-6 w-6 place-items-center rounded-full border border-white/15">
              <motion.svg width="9" height="11" viewBox="0 0 9 11" fill="none"
                animate={reduce ? undefined : { y: [0, 2.5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
                <path d="M4.5 0v9M1 6l3.5 3.5L8 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            </span>
            {dict.scroll}
          </a>
          <span className="num text-[10px] uppercase tracking-[0.22em] text-white/30">CH · {dict.cantons}</span>
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------ Backdrop grid ------------------------------ */
function BackdropGrid() {
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(to right, oklch(1 0 0 / 0.035) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.035) 1px, transparent 1px)",
        backgroundSize: "clamp(52px, 6.2vw, 88px) clamp(52px, 6.2vw, 88px)",
        maskImage: "radial-gradient(125% 105% at 72% 34%, black 26%, transparent 76%)",
        WebkitMaskImage: "radial-gradient(125% 105% at 72% 34%, black 26%, transparent 76%)",
      }}
    />
  );
}

/* ------------------------------- Live clock ------------------------------- */
function LiveClock({ label, reduce }: { label: string; reduce: boolean }) {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setNow(fmt());
    if (reduce) return;
    const id = setInterval(() => setNow(fmt()), 1000);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <span className="num flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/40">
      <span className="relative flex h-1.5 w-1.5">
        <span
          className="absolute inline-flex h-full w-full rounded-full"
          style={{ background: "oklch(0.74 0.17 145)", animation: reduce ? "none" : "avPing 2.4s cubic-bezier(0,0,0.2,1) infinite" }}
        />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: "oklch(0.74 0.17 145)" }} />
      </span>
      {label} <span className="tabular-nums text-white/55">{now}</span>
      <style>{`@keyframes avPing { 75%, 100% { transform: scale(2.4); opacity: 0; } }`}</style>
    </span>
  );
}

/* ------------------------------ Magnetic CTA ------------------------------ */
function MagneticCta({ href, children, reduce }: { href: string; children: React.ReactNode; reduce: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [d, setD] = useState({ x: 0, y: 0 });

  function onMove(e: React.MouseEvent) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * 0.18;
    const y = (e.clientY - (r.top + r.height / 2)) * 0.28;
    setD({ x, y });
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={() => setD({ x: 0, y: 0 })}
      animate={{ x: d.x, y: d.y }}
      transition={{ type: "spring", stiffness: 220, damping: 18, mass: 0.5 }}
      className="group relative inline-flex items-center justify-center gap-2.5 rounded-[var(--radius-md)] px-6 py-3.5 text-[0.95rem] font-medium text-white"
      style={{ background: "var(--color-red)", boxShadow: "var(--shadow-red)" }}
    >
      {children}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-hover:translate-x-0.5">
        <path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.a>
  );
}

/* ------------------------------ Dossier panel ------------------------------ */
function DossierPanel({ dict, reduce }: { dict: HeroDict; reduce: boolean }) {
  const [visible, setVisible] = useState<Offer[]>(reduce ? OFFER_POOL : OFFER_POOL.slice(0, 2));

  // Dealers respond over time — offers arrive and re-rank by match.
  useEffect(() => {
    if (reduce) return;
    const timers = [
      setTimeout(() => setVisible(OFFER_POOL.slice(0, 3)), 2400),
      setTimeout(() => setVisible(OFFER_POOL.slice(0, 4)), 4600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reduce]);

  const sorted = [...visible].sort((a, b) => b.match - a.match);
  const bestMatch = Math.max(...sorted.map((o) => o.match));

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 34, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.95, ease: EASE, delay: 0.3 }}
      className="relative mx-auto w-full max-w-[27rem] lg:ml-auto lg:mr-0"
    >
      {/* Request dossier */}
      <div className="rounded-t-[var(--radius-xl)] border border-b-0 border-white/[0.09] p-5" style={{ background: "var(--color-void-2)" }}>
        <div className="flex items-center justify-between">
          <span className="num text-[10px] uppercase tracking-[0.18em] text-white/40">{dict.requestLabel}</span>
          <span className="num text-[10px] tracking-[0.08em] text-white/30">#AV-8241</span>
        </div>
        <h3 className="mt-3 text-[1.2rem] font-semibold tracking-[-0.02em] text-white">{dict.reqModel}</h3>
        <dl className="mt-3.5 grid grid-cols-2 gap-x-6 gap-y-0">
          {dict.rows.map(([label, value], i) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-3 border-t border-white/[0.07] py-2"
              style={{ gridColumn: i < 2 ? "auto" : "auto" }}
            >
              <dt className="num text-[10px] uppercase tracking-[0.08em] text-white/45">{label}</dt>
              <dd className="num text-[12px] text-white/85">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Offers well */}
      <div className="rounded-b-[var(--radius-xl)] border border-white/[0.09] p-3 pt-3.5" style={{ background: "var(--color-void)", boxShadow: "var(--shadow-float)" }}>
        <div className="mb-2.5 flex items-center justify-between px-1.5">
          <span className="num text-[10px] uppercase tracking-[0.18em] text-white/40">{dict.offersLabel}</span>
          <span className="num flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-white/45">
            <motion.span key={sorted.length} initial={reduce ? false : { scale: 1.4, color: "oklch(0.74 0.17 145)" }} animate={{ scale: 1, color: "rgba(255,255,255,0.55)" }} transition={{ duration: 0.5 }} className="tabular-nums">
              {sorted.length}
            </motion.span>
            {dict.responding}
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
                    borderColor: isBest ? "oklch(0.552 0.221 29 / 0.5)" : "oklch(1 0 0 / 0.07)",
                    background: isBest ? "oklch(0.552 0.221 29 / 0.10)" : "oklch(1 0 0 / 0.02)",
                  }}
                >
                  <span className="num grid h-8 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-white/10 bg-white/[0.04] text-[11px] font-semibold text-white/75">
                    {o.canton}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.8rem] font-medium text-white/85">{o.dealer}</p>
                    <p className="num text-[10px] uppercase tracking-[0.06em] text-white/50">{o.match}% {dict.match}</p>
                  </div>
                  <div className="text-right">
                    <AnimatedPrice value={o.price} reduce={reduce} />
                    {isBest && (
                      <p className="num text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--color-red)" }}>{dict.best}</p>
                    )}
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

/* ------------------------------ Animated price ------------------------------ */
function AnimatedPrice({ value, reduce }: { value: number; reduce: boolean }) {
  const [display, setDisplay] = useState(reduce ? value : Math.max(0, value - 1400));
  useEffect(() => {
    if (reduce) { setDisplay(value); return; }
    const controls = animate(Math.max(0, value - 1400), value, { duration: 0.95, ease: EASE, onUpdate: (v) => setDisplay(v) });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduce]);
  return <p className="num text-[0.9rem] font-semibold text-white">{chf(Math.round(display))}</p>;
}
