import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { chf } from "@/lib/format";
import type { CantonCode } from "@/lib/cantons";

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface DealersDict {
  kicker: string;
  title: string;
  lead: string;
  values: { t: string; b: string }[]; // 3
  cta: string;
  feed: string;
  near: string;
  respond: string;
  neu: string;
}

interface Req { model: string; budget: number; canton: CantonCode }
// Illustrative dealer-side UI (example requests), not platform statistics.
const REQUESTS: Req[] = [
  { model: "BMW 3er Touring", budget: 42000, canton: "ZH" },
  { model: "Audi A4 Avant", budget: 38000, canton: "BE" },
  { model: "VW Tiguan", budget: 35000, canton: "VD" },
  { model: "Škoda Octavia", budget: 29000, canton: "SG" },
];

/* "For dealers" — the flip side of the story. The page's one dark inversion
   moment; mirrors the hero (buyer: "Dealers come to you" → dealer: "Buyers
   come to you"). The dealer's inbox of pre-qualified requests is the visual.
   One clean GSAP scroll reveal (not pinned). Reduced-motion / no-JS: static. */
export default function ForDealers({ dict }: { dict: DealersDict }) {
  const root = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useIso(() => {
    const ctx = gsap.context((self) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = self.selector!;
      const fades = q<HTMLElement>(".fd-fade");
      const rows = q<HTMLElement>(".fd-row");

      gsap.set(fades, { opacity: 0, y: 22 });
      gsap.set(rows, { opacity: 0, x: 36 });
      if (heading.current) gsap.set(heading.current, { opacity: 0 });

      const build = () => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: root.current, start: "top 72%" },
        });
        if (heading.current) {
          gsap.set(heading.current, { opacity: 1 });
          const split = new SplitText(heading.current, { type: "lines", mask: "lines" });
          tl.from(split.lines, { yPercent: 115, duration: 0.9, stagger: 0.1 });
        }
        tl.to(fades, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, "-=0.5");
        tl.to(rows, { opacity: 1, x: 0, duration: 0.55, stagger: 0.1 }, "<0.1");
      };
      if (document.fonts?.ready) document.fonts.ready.then(build);
      else build();
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} data-theme="dark" className="grain-dark relative isolate overflow-hidden bg-void py-28 text-white lg:py-40">
      {/* one faint red horizon */}
      <div aria-hidden className="pointer-events-none absolute left-[-8%] top-[30%] h-[520px] w-[720px] max-w-[70vw] rounded-full opacity-[0.10] blur-[150px]" style={{ background: "var(--color-red)" }} />

      <div className="relative z-10 mx-auto w-full max-w-[82rem] px-[var(--gutter)]">
        {/* intro row */}
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1fr_0.95fr] lg:gap-20">
          <div className="max-w-[34rem]">
            <span className="fd-fade text-[11px] font-medium uppercase tracking-[0.18em] text-white/50 [font-family:var(--font-mono)]">
              <span style={{ color: "var(--color-red)" }}>//</span> {dict.kicker}
            </span>
            <h2 ref={heading} className="mt-5 text-[clamp(2.1rem,4vw,3.4rem)] font-medium leading-[1.02] tracking-[-0.025em] text-white [font-family:var(--font-display)]">
              {dict.title}
            </h2>
            <p className="fd-fade mt-6 max-w-[32rem] text-[1.0625rem] leading-[1.62] text-white/60">{dict.lead}</p>
            <div className="fd-fade mt-9">
              <a
                href="/haendler"
                className="group inline-flex items-center justify-center gap-2.5 rounded-[var(--radius-md)] px-6 py-3.5 text-[0.95rem] font-medium text-white transition-transform duration-200 hover:-translate-y-px"
                style={{ background: "var(--color-red)", boxShadow: "var(--shadow-red)" }}
              >
                {dict.cta}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-hover:translate-x-0.5">
                  <path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>

          {/* dealer inbox */}
          <div className="fd-fade w-full">
            <div className="rounded-[var(--radius-xl)] border border-white/[0.09] p-3.5 pt-4" style={{ background: "var(--color-void-2)", boxShadow: "var(--shadow-float)" }}>
              <div className="mb-3 flex items-center justify-between px-1.5">
                <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/45 [font-family:var(--font-mono)]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full" style={{ background: "var(--color-red)", animation: "avPing 2.4s cubic-bezier(0,0,0.2,1) infinite" }} />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-red)" }} />
                  </span>
                  {dict.feed}
                </span>
                <span className="text-[10px] uppercase tracking-[0.1em] text-white/35 [font-family:var(--font-mono)]">· {dict.near}</span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {REQUESTS.map((r, i) => (
                  <li key={r.model} className="fd-row flex items-center gap-3 rounded-[var(--radius-md)] border border-white/[0.07] bg-white/[0.02] px-3 py-2.5">
                    <span className="grid h-8 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-white/10 bg-white/[0.04] text-[11px] font-semibold text-white/75 [font-family:var(--font-mono)]">
                      {r.canton}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.85rem] font-medium text-white/90">{r.model}</p>
                      <p className="text-[11px] text-white/45 [font-family:var(--font-mono)]">≤ {chf(r.budget)}</p>
                    </div>
                    {i === 0 && (
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-white [font-family:var(--font-mono)]" style={{ background: "var(--color-red)" }}>{dict.neu}</span>
                    )}
                    <button className="rounded-[var(--radius-sm)] border border-white/15 px-2.5 py-1 text-[11px] font-medium text-white/70 transition-colors hover:border-white/35 hover:text-white">
                      {dict.respond}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* value row */}
        <div className="mt-20 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:mt-28 lg:grid-cols-3">
          {dict.values.map((v, i) => (
            <div key={v.t} className="fd-fade">
              <div className="flex items-center gap-3 border-t border-white/[0.12] pt-5">
                <span className="text-[13px] tracking-[0.02em] text-white/45 [font-family:var(--font-mono)]" style={{ color: "var(--color-red)" }}>0{i + 1}</span>
              </div>
              <h3 className="mt-5 text-[1.2rem] font-semibold tracking-[-0.015em] text-white">{v.t}</h3>
              <p className="mt-2.5 max-w-[24rem] text-[0.95rem] leading-[1.6] text-white/55">{v.b}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes avPing { 75%, 100% { transform: scale(2.4); opacity: 0; } }`}</style>
    </section>
  );
}
