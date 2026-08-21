import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { chf } from "@/lib/format";
import { OFFER_POOL } from "@/components/hero/shared";

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface EpicDict {
  kicker: string;
  acts: { t: string; b: string }[]; // 3
  reqLabel: string;
  reqModel: string;
  rows: [string, string][];
  offersLabel: string;
  responding: string;
  best: string;
  match: string;
}

const OFFERS = [...OFFER_POOL].sort((a, b) => b.match - a.match);
const BEST_ID = OFFERS[0].id;

/* The page's dark cinematic centrepiece. A pinned section (~3 screens of
   scroll) whose scroll scrubs a GSAP timeline through three acts — the request
   dossier assembles, dealer offers stream in and compete, the best is chosen.
   SplitText chapter headings, a progress rail, calm-premium execution.
   No-JS / reduced-motion: everything renders visible and readable in flow. */
export default function HowItWorksEpic({ dict }: { dict: EpicDict }) {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useIso(() => {
    const ctx = gsap.context((self) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // Lock the stage to the viewport only for the animated path; the static
      // fallback (no-JS / reduced-motion) flows at natural height, uncut.
      gsap.set(pin.current, { height: "100svh", paddingTop: 0, paddingBottom: 0, overflow: "hidden" });
      const q = self.selector!;
      const acts = q<HTMLDivElement>(".hiw-act");
      const fields = q<HTMLElement>(".hiw-field");
      const offers = q<HTMLElement>(".hiw-offer");
      const nonBest = q<HTMLElement>(".hiw-offer:not([data-best])");
      const bestEl = q<HTMLElement>("[data-best]");
      const sel = q<HTMLElement>(".hiw-sel");

      // Split each act title into words for the reveal
      const wordSets = acts.map((a) => {
        const title = a.querySelector<HTMLElement>(".hiw-title");
        return title ? new SplitText(title, { type: "words", wordsClass: "hiw-word" }).words : [];
      });
      const caps = acts.map((a) => a.querySelector<HTMLElement>(".hiw-cap")).filter(Boolean) as HTMLElement[];

      // Cinematic layout: stack the three acts on top of each other
      gsap.set(acts, { position: "absolute", top: 0, left: 0, width: "100%" });
      gsap.set(acts.slice(1), { autoAlpha: 0, y: 34 });
      wordSets.forEach((w) => gsap.set(w, { yPercent: 115, opacity: 0 }));
      gsap.set(caps, { opacity: 0, y: 14 });
      gsap.set(fields, { opacity: 0, y: 16 });
      gsap.set(offers, { opacity: 0, x: 42 });
      gsap.set(sel, { opacity: 0, scale: 0.8 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "+=300%",
          scrub: 1,
          pin: pin.current,
          anticipatePin: 1,
          onUpdate: (st) => {
            const p = st.progress;
            if (counter.current) counter.current.textContent = p < 0.34 ? "01" : p < 0.68 ? "02" : "03";
            if (bar.current) bar.current.style.transform = `scaleX(${p})`;
          },
        },
      });

      // ── ACT 1 — describe ──
      tl.to(wordSets[0], { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.5 }, 0.1)
        .to(caps[0], { opacity: 1, y: 0, duration: 0.4 }, 0.4)
        .to(fields, { opacity: 1, y: 0, stagger: 0.12, duration: 0.4 }, 0.5)
        .to({}, { duration: 0.7 });

      // ── ACT 1 → 2 ──
      tl.to(acts[0], { autoAlpha: 0, y: -34, duration: 0.4 })
        .set(acts[1], { autoAlpha: 1, y: 0 })
        .to(wordSets[1], { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.5 }, "<")
        .to(caps[1], { opacity: 1, y: 0, duration: 0.4 }, "<0.2")
        .to(offers, { opacity: 1, x: 0, stagger: 0.16, duration: 0.45 }, "<0.05")
        .to({}, { duration: 0.7 });

      // ── ACT 2 → 3 ──
      tl.to(acts[1], { autoAlpha: 0, y: -34, duration: 0.4 })
        .set(acts[2], { autoAlpha: 1, y: 0 })
        .to(wordSets[2], { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.5 }, "<")
        .to(caps[2], { opacity: 1, y: 0, duration: 0.4 }, "<0.2")
        .to(nonBest, { opacity: 0.22, duration: 0.4 }, "<0.05")
        .to(bestEl, { borderColor: "rgba(216,30,36,0.6)", backgroundColor: "rgba(216,30,36,0.10)", duration: 0.4 }, "<")
        .to(sel, { opacity: 1, scale: 1, duration: 0.4 }, "<0.2")
        .to({}, { duration: 0.6 });

      ScrollTrigger.refresh();
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} className="relative bg-void">
      <div ref={pin} className="grain-dark relative flex flex-col bg-void text-white py-20 lg:py-24">
        {/* subtle red horizon */}
        <div aria-hidden className="pointer-events-none absolute right-[-6%] top-[42%] h-[520px] w-[720px] max-w-[70vw] -translate-y-1/2 rounded-full opacity-[0.10] blur-[150px]" style={{ background: "var(--color-red)" }} />

        {/* top chrome + progress */}
        <div className="relative z-10 mx-auto w-full max-w-[86rem] px-[var(--gutter)] pt-10 lg:pt-14">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45 [font-family:var(--font-mono)]">
              <span style={{ color: "var(--color-red)" }}>//</span> {dict.kicker}
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/45 [font-family:var(--font-mono)]">
              <span ref={counter} className="text-white/80">01</span> / 03
            </span>
          </div>
          <div className="mt-4 h-px w-full overflow-hidden bg-white/10">
            <span ref={bar} className="block h-full origin-left" style={{ background: "var(--color-red)", transform: "scaleX(0)" }} />
          </div>
        </div>

        {/* stage */}
        <div className="relative z-10 mx-auto grid w-full max-w-[86rem] flex-1 grid-cols-1 items-center gap-12 px-[var(--gutter)] py-10 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
          {/* acts (stacked) */}
          <div className="relative min-h-[15rem]">
            {dict.acts.map((a, i) => (
              <div key={a.t} className="hiw-act">
                <span className="text-[13px] tracking-[0.05em] text-white/40 [font-family:var(--font-mono)]">0{i + 1}</span>
                <h3 className="hiw-title mt-4 text-[clamp(2.1rem,4vw,3.4rem)] font-medium leading-[1.02] tracking-[-0.025em] [font-family:var(--font-display)]">
                  {a.t}
                </h3>
                <p className="hiw-cap mt-5 max-w-[26rem] text-[1.05rem] leading-[1.6] text-white/60">{a.b}</p>
              </div>
            ))}
          </div>

          {/* the product dossier */}
          <div className="mx-auto w-full max-w-[26rem] lg:ml-auto lg:mr-0">
            <div className="rounded-t-[var(--radius-xl)] border border-b-0 border-white/[0.09] p-5" style={{ background: "var(--color-void-2)" }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/40 [font-family:var(--font-mono)]">{dict.reqLabel}</span>
                <span className="text-[10px] tracking-[0.08em] text-white/30 [font-family:var(--font-mono)]">#AV-8241</span>
              </div>
              <h4 className="mt-3 text-[1.15rem] font-semibold tracking-[-0.02em] text-white">{dict.reqModel}</h4>
              <dl className="mt-3.5 grid grid-cols-2 gap-x-6">
                {dict.rows.map(([label, value]) => (
                  <div key={label} className="hiw-field flex items-baseline justify-between gap-3 border-t border-white/[0.07] py-2">
                    <dt className="text-[10px] uppercase tracking-[0.08em] text-white/45 [font-family:var(--font-mono)]">{label}</dt>
                    <dd className="text-[12px] text-white/85 [font-family:var(--font-mono)]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-b-[var(--radius-xl)] border border-white/[0.09] p-3 pt-3.5" style={{ background: "var(--color-void)", boxShadow: "var(--shadow-float)" }}>
              <div className="mb-2.5 flex items-center justify-between px-1.5">
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/40 [font-family:var(--font-mono)]">{dict.offersLabel}</span>
                <span className="text-[10px] uppercase tracking-[0.1em] text-white/45 [font-family:var(--font-mono)]">4 {dict.responding}</span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {OFFERS.map((o) => {
                  const isBest = o.id === BEST_ID;
                  return (
                    <li
                      key={o.id}
                      {...(isBest ? { "data-best": "" } : {})}
                      className="hiw-offer relative flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2.5"
                      style={{ borderColor: "oklch(1 0 0 / 0.07)", background: "oklch(1 0 0 / 0.02)" }}
                    >
                      <span className="grid h-8 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-white/10 bg-white/[0.04] text-[11px] font-semibold text-white/75 [font-family:var(--font-mono)]">
                        {o.canton}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.8rem] font-medium text-white/85">{o.dealer}</p>
                        <p className="text-[10px] uppercase tracking-[0.06em] text-white/45 [font-family:var(--font-mono)]">{o.match}% {dict.match}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[0.9rem] font-semibold text-white [font-family:var(--font-mono)]">{chf(o.price)}</p>
                        {isBest && (
                          <p className="hiw-sel text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--color-red)" }}>{dict.best}</p>
                        )}
                      </div>
                      {isBest && (
                        <span className="hiw-sel absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full text-white" style={{ background: "var(--color-red)", boxShadow: "var(--shadow-red)" }}>
                          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 7.5l2.5 2.5L11 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
