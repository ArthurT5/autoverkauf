"use client";

import { useRef, useLayoutEffect } from "react";
import { useTranslations } from "next-intl";
import { Wallet, BadgeCheck, Lock } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { Reveal } from "@/components/motion/reveal";
import { RevealHeading } from "@/components/motion/reveal-heading";
import { Eyebrow } from "@/components/motion/eyebrow";
import { Counter } from "@/components/motion/counter";
import { HalftoneCanvas } from "@/components/motion/halftone-canvas";

const PILLARS = [
  { key: "free", Icon: Wallet },
  { key: "verified", Icon: BadgeCheck },
  { key: "control", Icon: Lock },
] as const;

export function Stats() {
  const t = useTranslations("stats");
  const section = useRef<HTMLElement>(null);
  const mark = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = section.current;
    const m = mark.current;
    if (!el || !m) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          m,
          { yPercent: -14 },
          {
            yPercent: 14,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={section}
      data-theme="dark"
      data-nav-theme="dark"
      className="grain-dark relative overflow-hidden bg-[oklch(0.068_0.008_27)] py-28 lg:py-36"
    >
      <HalftoneCanvas inkAlpha={0.5} farBase={0.72} nearBase={0.88} phase={2.1} />

      {/* parallax Swiss cross — depth */}
      <div
        ref={mark}
        className="pointer-events-none absolute -right-24 top-1/2 z-0 -translate-y-1/2"
        aria-hidden="true"
      >
        <svg width="520" height="520" viewBox="0 0 18 18" fill="none" className="opacity-[0.05]">
          <rect x="7" y="0" width="4" height="18" rx="1.5" fill="oklch(0.448 0.228 27.3)" />
          <rect x="0" y="7" width="18" height="4" rx="1.5" fill="oklch(0.448 0.228 27.3)" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-start gap-16 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:px-8">
        {/* Heading + lead */}
        <div>
          <Eyebrow className="text-white/40">{t("eyebrow")}</Eyebrow>
          <RevealHeading
            className="text-[clamp(2rem,3.6vw,3rem)] font-bold leading-[1.08] tracking-[-0.03em] text-[var(--ink-900)]"
            style={{ textWrap: "balance" }}
          >
            {t("heading1")}
          </RevealHeading>
          <Reveal delay={0.15}>
            <p className="mt-7 max-w-md text-[1.075rem] leading-relaxed text-[var(--ink-500)]">
              {t.rich("lead", {
                c: () => <Counter to={26} className="font-semibold tabular-nums text-[var(--ink-900)]" />,
                l: () => <Counter to={4} className="font-semibold tabular-nums text-[var(--ink-900)]" />,
              })}
            </p>
          </Reveal>
        </div>

        {/* Pillars */}
        <Reveal stagger className="border-t border-[var(--hairline)]">
          {PILLARS.map(({ key, Icon }) => (
            <div key={key} className="flex gap-5 border-b border-[var(--hairline)] py-7">
              <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.06]">
                <Icon className="h-[18px] w-[18px] text-[var(--red)]" strokeWidth={1.75} />
              </span>
              <div>
                <h3 className="text-[1.2rem] font-semibold tracking-[-0.01em] text-[var(--ink-900)]">
                  {t(`${key}.title`)}
                </h3>
                <p className="mt-2 max-w-md text-[14.5px] leading-relaxed text-[var(--ink-500)]">
                  {t(`${key}.body`)}
                </p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
