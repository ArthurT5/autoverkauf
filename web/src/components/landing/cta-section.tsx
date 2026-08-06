"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/reveal";
import { RevealHeading } from "@/components/motion/reveal-heading";
import { HalftoneCanvas } from "@/components/motion/halftone-canvas";
import { CtaButton } from "@/components/ui/cta-button";

export function CTASection() {
  const t = useTranslations("cta");

  return (
    <section data-nav-theme="dark" className="grain relative overflow-hidden bg-[var(--surface-ink)] py-28 lg:py-40">
      {/* the closing echo of the hero: same ridgeline language, same red sun */}
      <HalftoneCanvas sun inkAlpha={0.7} farBase={0.7} nearBase={0.86} phase={3.3} />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        {/* Swiss cross mark */}
        <Reveal className="mb-8 flex justify-center">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <rect x="7" y="0" width="4" height="18" rx="1.5" fill="oklch(0.55 0.20 27.3)" />
              <rect x="0" y="7" width="18" height="4" rx="1.5" fill="oklch(0.55 0.20 27.3)" />
            </svg>
          </span>
        </Reveal>

        <RevealHeading
          className="text-[clamp(2.2rem,5vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.03em] text-white"
          style={{ textWrap: "balance" }}
          delay={0.05}
        >
          {t("heading")}
        </RevealHeading>

        <Reveal as="p" delay={0.1} className="mx-auto mt-6 max-w-xl text-[1.075rem] leading-relaxed text-[oklch(0.74_0.006_27)]">
          {t("body")}
        </Reveal>

        <Reveal delay={0.16} stagger className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <CtaButton href="/buyer/requests/new" variant="primary" arrow>
            {t("primary")}
          </CtaButton>
          <CtaButton href="/for-dealers" variant="ghost-dark">
            {t("secondary")}
          </CtaButton>
        </Reveal>

        <Reveal as="p" delay={0.28} className="mt-7 text-[12.5px] text-[oklch(0.58_0.006_27)]">
          {t("trust")}
        </Reveal>
      </div>
    </section>
  );
}
