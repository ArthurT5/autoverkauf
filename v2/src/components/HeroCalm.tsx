import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, SplitText } from "@/lib/gsap";
import type { HeroDict } from "@/components/Hero.tsx";

// Run before paint on the client (no flash); fall back to useEffect on the server.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* Calm-premium, minimal. Whitespace is the feature; one restrained accent.
   No hero visual — the typography and space carry it. GSAP drives a quiet
   line-reveal on load. Themeable light/dark. */

export default function HeroCalm({ dict, theme = "light" }: { dict: HeroDict; theme?: "light" | "dark" }) {
  const root = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const dark = theme === "dark";

  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const fades = gsap.utils.toArray<HTMLElement>(".cf");
      if (reduce) return; // content is visible by default — nothing to reveal

      // Hide before paint, then reveal. Content stays visible if JS never runs.
      gsap.set(fades, { opacity: 0, y: 18 });
      if (heading.current) gsap.set(heading.current, { opacity: 0 });
      const build = () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        if (heading.current) {
          gsap.set(heading.current, { opacity: 1 });
          const split = new SplitText(heading.current, { type: "lines", mask: "lines", linesClass: "cf-line" });
          tl.from(split.lines, { yPercent: 118, duration: 0.95, stagger: 0.12 });
        }
        tl.to(fades, { opacity: 1, y: 0, duration: 0.75, stagger: 0.08 }, "-=0.55");
      };
      // Wait for the display font so SplitText measures line breaks correctly.
      if (document.fonts?.ready) document.fonts.ready.then(build);
      else build();
    }, root);
    return () => ctx.revert();
  }, []);

  const c = dark
    ? { kicker: "text-white/55", h1: "text-white", sub: "text-white/60", trust: "text-white/65", ghost: "text-white/70 hover:text-white" }
    : { kicker: "text-ink-500", h1: "text-ink-900", sub: "text-ink-500", trust: "text-ink-500", ghost: "text-ink-700 hover:text-ink-900" };

  return (
    <section
      ref={root}
      data-nav={dark ? "dark" : "light"}
      className={`${dark ? "grain-dark bg-void text-white" : "grain bg-paper text-ink"} relative isolate min-h-[100svh] overflow-hidden`}
    >
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[80rem] flex-col justify-center px-[var(--gutter)] pb-20 pt-32">
        {/* message */}
        <div className="max-w-[42rem]">
          <div className="cf mb-9 flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-red)" }} />
            <span className={`text-[11px] font-medium uppercase tracking-[0.16em] ${c.kicker}`}>{dict.kicker}</span>
          </div>

          <h1
            ref={heading}
            className={`text-[clamp(2.5rem,4.6vw,3.9rem)] font-medium leading-[1.02] tracking-[-0.025em] ${c.h1} [font-family:var(--font-display)]`}
           
          >
            {dict.line1} {dict.line2}
          </h1>

          <p className={`cf mt-7 max-w-[30rem] text-[1.0625rem] leading-[1.65] ${c.sub}`}>
            {dict.sub}
          </p>

          <div className="cf mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="/anfrage"
              className="group inline-flex items-center justify-center gap-2.5 rounded-[var(--radius-md)] px-6 py-3.5 text-[0.95rem] font-medium text-white transition-transform duration-200 hover:-translate-y-px"
              style={{ background: "var(--color-red)", boxShadow: "var(--shadow-red)" }}
            >
              {dict.ctaPrimary}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-hover:translate-x-0.5">
                <path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="/haendler" className={`inline-flex items-center gap-1.5 px-2 py-3.5 text-[0.95rem] font-medium transition-colors duration-200 ${c.ghost}`}>
              {dict.ctaSecondary}
              <span aria-hidden>→</span>
            </a>
          </div>

          <ul className="cf mt-11 flex flex-wrap gap-x-7 gap-y-2.5">
            {[dict.trustDealers, dict.trustFree, dict.trustTime].map((t) => (
              <li key={t} className={`flex items-center gap-2 text-[0.8rem] ${c.trust}`}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M3 7.5l2.5 2.5L11 4.5" stroke="var(--color-red)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
