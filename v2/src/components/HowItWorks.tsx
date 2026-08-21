import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface HowDict {
  kicker: string;
  title: string;
  lead: string;
  steps: { t: string; b: string }[];
}

/* Calm-premium "how it works": three spec-sheet steps under a hairline, mono
   step numbers, one restrained red accent, a quiet GSAP scroll reveal. */
export default function HowItWorks({ dict }: { dict: HowDict }) {
  const root = useRef<HTMLElement>(null);

  useIso(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const items = gsap.utils.toArray<HTMLElement>(".hiw-reveal");
      gsap.set(items, { opacity: 0, y: 26 });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 78%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative bg-paper-2 py-28 lg:py-40">
      <div className="mx-auto w-full max-w-[80rem] px-[var(--gutter)]">
        {/* header */}
        <div className="hiw-reveal max-w-[40rem]">
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-500 [font-family:var(--font-mono)]">
            <span style={{ color: "var(--color-red)" }}>//</span> {dict.kicker}
          </span>
          <h2 className="mt-5 text-[clamp(1.9rem,3.4vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.02em] text-ink-900 [font-family:var(--font-display)]">
            {dict.title}
          </h2>
          <p className="mt-5 max-w-[34rem] text-[1.0625rem] leading-[1.6] text-ink-500">{dict.lead}</p>
        </div>

        {/* steps */}
        <ol className="mt-16 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:mt-24 lg:grid-cols-3">
          {dict.steps.map((s, i) => (
            <li key={s.t} className="hiw-reveal">
              <div className="flex items-center justify-between border-t border-line-2 pt-5">
                <span className="text-[13px] tracking-[0.02em] text-ink-700 [font-family:var(--font-mono)]">
                  0{i + 1}
                </span>
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: i === dict.steps.length - 1 ? "var(--color-red)" : "var(--color-line-2)" }}
                  aria-hidden
                />
              </div>
              <h3 className="mt-6 text-[1.35rem] font-semibold tracking-[-0.015em] text-ink-900">{s.t}</h3>
              <p className="mt-3 max-w-[24rem] text-[0.975rem] leading-[1.6] text-ink-500">{s.b}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
