import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { chf } from "@/lib/format";
import { OFFER_POOL } from "@/components/hero/shared";

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface PrecisionDict {
  kicker: string;
  steps: { t: string; b: string }[]; // 5
  reqLabel: string;
  reqModel: string;
  rows: [string, string][];
  offersLabel: string;
  best: string;
  match: string;
}

const OFFERS = [...OFFER_POOL].sort((a, b) => b.match - a.match);
const BEST_ID = OFFERS[0].id;
const CHIPS = ["ZH", "BE", "VD", "AG", "SG", "LU", "TI", "ZG", "BS", "GR"];

/* ─────────────────────────────────────────────────────────────────────────────
   "The Swiss instrument" — How-it-works, refined. SBB-board clarity with
   watch-grade finishing, on the light page. A pinned, scroll-scrubbed journey
   through FIVE steps on a route rail; the ivory board on the right answers
   each step: values type in → canton chips light up → offer rows flip in like
   a departure board, prices counting → match bars fill for comparison → a red
   frame draws itself around the best offer. One focal motion at a time,
   mechanical easing, zero glitch. No-JS / reduced-motion: static & readable.
   ──────────────────────────────────────────────────────────────────────────── */
export default function HowPrecision({ dict }: { dict: PrecisionDict }) {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useIso(() => {
    const ctx = gsap.context((self) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = self.selector!;

      gsap.set(pin.current, { height: "100svh", paddingTop: 0, paddingBottom: 0, overflow: "hidden" });

      const stepIdx = q<HTMLElement>(".hp-idx");
      const stepTitle = q<HTMLElement>(".hp-steptitle");
      const captions = q<HTMLElement>(".hp-cap");
      const capWrap = q<HTMLElement>(".hp-capwrap")[0];
      const railFill = q<HTMLElement>(".hp-railfill")[0];
      const dot = q<HTMLElement>(".hp-dot")[0];
      const board = q<HTMLElement>(".hp-board")[0];
      const reqVals = q<HTMLElement>(".hp-reqval");
      const chipsWrap = q<HTMLElement>(".hp-chips")[0];
      const chips = q<HTMLElement>(".hp-chip");
      const chipDots = q<HTMLElement>(".hp-chipdot");
      const offersWrap = q<HTMLElement>(".hp-offers")[0];
      const offerRows = q<HTMLElement>(".hp-row");
      const prices = q<HTMLElement>(".hp-price");
      const compareEls = q<HTMLElement>(".hp-compare");
      const barFills = q<HTMLElement>(".hp-barfill");
      const pcts = q<HTMLElement>(".hp-pct");
      const nonBest = q<HTMLElement>(".hp-row:not([data-best])");
      const frame = q<SVGRectElement>(".hp-frame rect")[0];
      const disc = q<HTMLElement>(".hp-disc")[0];
      const tag = q<HTMLElement>(".hp-tag")[0];

      // typed request values — blank first, type on scroll
      const typed = reqVals.map((el) => el.textContent ?? "");
      reqVals.forEach((el) => (el.textContent = ""));

      // counting numbers
      const priceProxy = OFFERS.map((o) => ({ v: o.price - 1800 }));
      prices.forEach((el, i) => (el.textContent = chf(OFFERS[i].price - 1800)));
      const pctProxy = OFFERS.map(() => ({ v: 0 }));
      pcts.forEach((el) => (el.textContent = "0%"));

      // ── initial states (JS-only; static fallback keeps everything visible) ──
      gsap.set(capWrap, { position: "relative" });
      gsap.set(captions, { position: "absolute", top: 0, left: 0, autoAlpha: 0, y: 10 });
      gsap.set([...stepIdx, ...stepTitle], { opacity: 0.32 });
      gsap.set(railFill, { scaleY: 0, transformOrigin: "top" });
      gsap.set(board, { y: 26, autoAlpha: 0 });
      // chips + slots stay visible as ghosts from the start — the instrument
      // shows its empty positions (departure board), then fills them in.
      gsap.set(chips, { opacity: 0.3 });
      gsap.set(chipDots, { backgroundColor: "oklch(0.835 0.006 27)" });
      gsap.set(offerRows, { rotationX: -95, autoAlpha: 0, transformOrigin: "50% 0%" });
      gsap.set(compareEls, { autoAlpha: 0 });
      gsap.set(barFills, { scaleX: 0, transformOrigin: "0% 50%" });
      if (frame) {
        gsap.set(frame, { strokeDasharray: 1, strokeDashoffset: 1 });
      }
      gsap.set([disc, tag], { autoAlpha: 0, scale: 0.6, transformOrigin: "50% 50%" });

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "+=480%",
          scrub: 1,
          pin: pin.current,
          anticipatePin: 1,
          onUpdate: (st) => {
            const i = Math.min(4, Math.floor(st.progress * 5));
            if (counter.current) counter.current.textContent = `0${i + 1}`;
          },
        },
      });

      // step activation: rail grows, dot travels, index reddens, caption swaps
      const activate = (i: number, at: string | number) => {
        tl.to([...stepIdx, ...stepTitle], { opacity: 0.32, color: "", duration: 0.25 }, at)
          .to(stepIdx[i], { opacity: 1, color: "oklch(0.552 0.221 29)", duration: 0.3 }, "<")
          .to(stepTitle[i], { opacity: 1, duration: 0.3 }, "<")
          .to(railFill, { scaleY: (i + 1) / 5, duration: 0.45, ease: "power2.inOut" }, "<")
          .to(dot, { left: `${(i / 4) * 100}%`, duration: 0.45, ease: "power2.inOut" }, "<")
          .to(captions, { autoAlpha: 0, y: -8, duration: 0.2 }, "<")
          .to(captions[i], { autoAlpha: 1, y: 0, duration: 0.35 }, "<0.15");
      };

      /* ── 01 · Describe ── */
      activate(0, 0.1);
      tl.to(board, { y: 0, autoAlpha: 1, duration: 0.6 }, "<0.1");
      reqVals.forEach((el, i) => {
        tl.to(el, { text: { value: typed[i] }, duration: 0.3, ease: "none" }, `<${i === 0 ? 0.35 : 0.3}`);
      });
      tl.to({}, { duration: 0.5 });

      /* ── 02 · Sent to dealers — the ghost chips light up ── */
      activate(1, ">");
      tl.to(chips, { opacity: 1, duration: 0.2, stagger: 0.05 }, "<0.2")
        .to(chipDots, { backgroundColor: "oklch(0.552 0.221 29)", duration: 0.18, stagger: 0.06 }, "<0.15");
      tl.to({}, { duration: 0.5 });

      /* ── 03 · Offers arrive (departure-board flips into the waiting slots) ── */
      activate(2, ">");
      offerRows.forEach((row, i) => {
        tl.to(row, { rotationX: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" }, `<${i === 0 ? 0.15 : 0.3}`)
          .to(priceProxy[i], {
            v: OFFERS[i].price, duration: 0.5, ease: "power1.out",
            onUpdate: () => { prices[i].textContent = chf(Math.round(priceProxy[i].v)); },
          }, "<0.1");
      });
      tl.to({}, { duration: 0.5 });

      /* ── 04 · Compare (bars fill, percentages count) ── */
      activate(3, ">");
      tl.to(compareEls, { autoAlpha: 1, duration: 0.35, stagger: 0.08 }, "<0.15");
      barFills.forEach((barEl, i) => {
        tl.to(barEl, { scaleX: OFFERS[i].match / 100, duration: 0.55, ease: "power2.inOut" }, `<${i === 0 ? 0.15 : 0.12}`)
          .to(pctProxy[i], {
            v: OFFERS[i].match, duration: 0.55, ease: "power2.inOut",
            onUpdate: () => { pcts[i].textContent = `${Math.round(pctProxy[i].v)}%`; },
          }, "<");
      });
      tl.to({}, { duration: 0.5 });

      /* ── 05 · You choose (the frame draws itself) ── */
      activate(4, ">");
      tl.to(nonBest, { autoAlpha: 0.35, duration: 0.45, stagger: 0.06 }, "<0.2");
      if (frame) tl.to(frame, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, "<0.2");
      tl.to(disc, { autoAlpha: 1, scale: 1, duration: 0.35 }, ">-0.15")
        .to(tag, { autoAlpha: 1, scale: 1, duration: 0.35 }, "<0.1");
      tl.to({}, { duration: 0.7 });

      ScrollTrigger.refresh();
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} className="relative bg-paper-2">
      <div ref={pin} className="grain relative flex flex-col bg-paper-2 py-20 text-ink lg:py-24">
        {/* ── chrome: kicker · tick ruler · counter ── */}
        <div className="relative z-10 mx-auto w-full max-w-[82rem] px-[var(--gutter)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-500 [font-family:var(--font-mono)]">
              <span style={{ color: "var(--color-red)" }}>//</span> {dict.kicker}
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-ink-400 [font-family:var(--font-mono)]">
              <span ref={counter} className="text-ink-900">01</span> / 05
            </span>
          </div>
          {/* watch-dial tick ruler with travelling red marker */}
          <div className="relative mt-4">
            <div
              className="h-2.5 w-full"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to right, var(--color-line-2) 0 1px, transparent 1px 10px)",
                maskImage: "linear-gradient(to bottom, black 55%, transparent)",
                WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent)",
              }}
              aria-hidden
            />
            <span
              className="hp-dot absolute -top-[3px] h-2 w-2 -translate-x-1/2 rounded-full"
              style={{ left: "0%", background: "var(--color-red)" }}
              aria-hidden
            />
          </div>
        </div>

        {/* ── stage ── */}
        <div className="relative z-10 mx-auto grid w-full max-w-[82rem] flex-1 grid-cols-1 items-center gap-12 px-[var(--gutter)] py-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* the journey rail */}
          <div className="relative">
            <div className="absolute bottom-1 left-[7px] top-1 w-px bg-line-2" aria-hidden />
            <div className="hp-railfill absolute bottom-1 left-[7px] top-1 w-px" style={{ background: "var(--color-red)" }} aria-hidden />
            <ol className="flex flex-col gap-5">
              {dict.steps.map((s, i) => (
                <li key={s.t} className="flex items-center gap-5 pl-0">
                  <span
                    className="hp-idx z-10 grid h-[15px] w-[15px] shrink-0 place-items-center rounded-full border bg-paper-2 text-[8.5px] font-semibold [font-family:var(--font-mono)]"
                    style={{ borderColor: "var(--color-line-2)" }}
                  >
                    {i + 1}
                  </span>
                  <span className="hp-steptitle text-[1.05rem] font-medium tracking-[-0.01em] text-ink-900">
                    {s.t}
                  </span>
                </li>
              ))}
            </ol>

            {/* active-step caption */}
            <div className="hp-capwrap mt-8 min-h-[4.5rem] max-w-[24rem]">
              {dict.steps.map((s) => (
                <p key={s.t} className="hp-cap text-[0.975rem] leading-[1.6] text-ink-500">{s.b}</p>
              ))}
            </div>
          </div>

          {/* the ivory board */}
          <div className="hp-board mx-auto w-full max-w-[30rem] lg:ml-auto lg:mr-0">
            <div className="rounded-[var(--radius-lg)] border border-line bg-white p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              {/* board header: fine ruler + request */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.18em] text-ink-400 [font-family:var(--font-mono)]">{dict.reqLabel}</span>
                <span className="text-[10px] tracking-[0.08em] text-ink-400 [font-family:var(--font-mono)]">#AV-8241</span>
              </div>
              <h4 className="mt-2.5 text-[1.15rem] font-semibold tracking-[-0.02em] text-ink-900">{dict.reqModel}</h4>
              <dl className="mt-3 grid grid-cols-2 gap-x-6">
                {dict.rows.map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between gap-3 border-t border-line py-2">
                    <dt className="text-[10px] uppercase tracking-[0.08em] text-ink-400 [font-family:var(--font-mono)]">{label}</dt>
                    <dd className="hp-reqval min-h-[1em] text-[12px] text-ink-700 [font-family:var(--font-mono)]">{value}</dd>
                  </div>
                ))}
              </dl>

              {/* canton chips — the request travels */}
              <div className="hp-chips mt-4 flex flex-wrap items-center gap-1.5 border-t border-line pt-4">
                {CHIPS.map((c) => (
                  <span key={c} className="hp-chip inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-[3px] text-[10px] font-medium text-ink-500 [font-family:var(--font-mono)]">
                    <span className="hp-chipdot h-1 w-1 rounded-full" style={{ background: "var(--color-line-2)" }} />
                    {c}
                  </span>
                ))}
                <span className="hp-chip inline-flex items-center rounded-full border border-line px-2 py-[3px] text-[10px] font-medium text-ink-400 [font-family:var(--font-mono)]">+16</span>
              </div>

              {/* offers — the departure board */}
              <div className="hp-offers mt-4 border-t border-line pt-4" style={{ perspective: 900 }}>
                <div className="mb-2 flex items-center justify-between px-0.5">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-ink-400 [font-family:var(--font-mono)]">{dict.offersLabel}</span>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {OFFERS.map((o, i) => {
                    const isBest = o.id === BEST_ID;
                    return (
                      <li key={o.id} className="relative">
                        {/* empty departure-board slot, awaiting its entry */}
                        <span
                          aria-hidden
                          className="hp-slot pointer-events-none absolute inset-0 rounded-[var(--radius-sm)] border border-dashed border-line"
                        />
                        <div
                          {...(isBest ? { "data-best": "" } : {})}
                          className="hp-row relative flex items-center gap-3 rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2.5 will-change-transform"
                        >
                          <span className="grid h-7 w-8 shrink-0 place-items-center rounded-[4px] border border-line bg-white text-[10px] font-semibold text-ink-700 [font-family:var(--font-mono)]">
                            {o.canton}
                          </span>
                          <p className="min-w-0 flex-1 truncate text-[0.8rem] font-medium text-ink-900">{o.dealer}</p>
                          <span className="hp-compare flex items-center gap-1.5">
                            <span className="h-[3px] w-14 overflow-hidden rounded-full bg-line">
                              <span className="hp-barfill block h-full w-full rounded-full" style={{ background: "var(--color-red)" }} />
                            </span>
                            <span className="hp-pct w-8 text-right text-[10px] text-ink-500 [font-family:var(--font-mono)]">{o.match}%</span>
                          </span>
                          <p className="hp-price w-[6.4rem] text-right text-[0.85rem] font-semibold text-ink-900 [font-family:var(--font-mono)]">{chf(o.price)}</p>
                        </div>

                        {isBest && (
                          <>
                            {/* self-drawing red frame */}
                            <svg className="hp-frame pointer-events-none absolute inset-[-5px]" width="100%" height="100%" aria-hidden>
                              <rect
                                x="1" y="1"
                                width="calc(100% - 2px)" height="calc(100% - 2px)"
                                rx="8" fill="none"
                                stroke="var(--color-red)" strokeWidth="1.5"
                                pathLength={1}
                              />
                            </svg>
                            {/* red disc — the chosen marker */}
                            <span className="hp-disc absolute -right-2 -top-2 z-10 grid h-6 w-6 place-items-center rounded-full text-white" style={{ background: "var(--color-red)", boxShadow: "var(--shadow-red)" }}>
                              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 7.5l2.5 2.5L11 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </span>
                            <span className="hp-tag absolute -top-2.5 left-3 z-10 rounded-[3px] px-1.5 py-[2px] text-[9px] font-semibold uppercase tracking-[0.12em] text-white [font-family:var(--font-mono)]" style={{ background: "var(--color-red)" }}>
                              {dict.best}
                            </span>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
