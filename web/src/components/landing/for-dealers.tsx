"use client";

import { useRef, useLayoutEffect } from "react";
import { Users, TrendingUp, BarChart3, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { gsap } from "@/lib/gsap";
import { Reveal } from "@/components/motion/reveal";
import { RevealHeading } from "@/components/motion/reveal-heading";
import { Eyebrow } from "@/components/motion/eyebrow";
import { HalftoneCanvas } from "@/components/motion/halftone-canvas";
import { CtaButton } from "@/components/ui/cta-button";

const ICONS = [Users, TrendingUp, BarChart3, Shield];
const BENEFIT_KEYS = ["b1", "b2", "b3", "b4"] as const;

export function ForDealers() {
  const t = useTranslations("forDealers");
  const tNav = useTranslations("nav");
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  // Sondaven-style opposite column parallax: left drifts up, right drifts down
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    if (!section || !left || !right) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 1024px)", () => {
        const shared = { ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true } };
        gsap.fromTo(left,  { yPercent:  5 }, { yPercent: -5, ...shared });
        gsap.fromTo(right, { yPercent: -5 }, { yPercent:  5, ...shared });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="dealers"
      data-theme="dark"
      data-nav-theme="dark"
      className="grain-dark relative overflow-hidden bg-[oklch(0.068_0.008_27)] py-28 lg:py-40"
    >
      <HalftoneCanvas inkAlpha={0.45} farBase={0.74} nearBase={0.9} phase={4.4} />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2 lg:gap-24 lg:px-8">
        {/* Left — pitch (drifts up on scroll) */}
        <div ref={leftRef}>
          <Eyebrow className="text-white/40">{t("eyebrow")}</Eyebrow>
          <RevealHeading
            className="mt-3 text-[clamp(2.1rem,3.8vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--ink-900)]"
            style={{ textWrap: "balance" }}
          >
            {t("heading")}
          </RevealHeading>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-md text-[1.075rem] leading-relaxed text-[var(--ink-500)]">
              {t("body")}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <CtaButton href="/dealer/signup" variant="primary" arrow>
                {t("apply")}
              </CtaButton>
              <CtaButton href="/#how-it-works" variant="ghost-dark">
                {tNav("howItWorks")}
              </CtaButton>
            </div>
          </Reveal>
        </div>

        {/* Right — benefit cards (drifts down on scroll) */}
        <div ref={rightRef}>
          <Reveal stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {BENEFIT_KEYS.map((key, i) => {
              const Icon = ICONS[i];
              return (
                <div
                  key={key}
                  className="group lift rounded-2xl border border-[var(--hairline)] bg-[var(--card-bg)] p-6 shadow-[var(--shadow-card)]"
                >
                  <span className="mb-5 grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-[var(--red)]/12">
                    <Icon className="h-[19px] w-[19px] text-[var(--red)] transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-125" strokeWidth={1.75} />
                  </span>
                  <h3 className="text-[15.5px] font-semibold tracking-[-0.01em] text-[var(--ink-900)]">
                    {t(`${key}t`)}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--ink-500)]">
                    {t(`${key}b`)}
                  </p>
                </div>
              );
            })}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
