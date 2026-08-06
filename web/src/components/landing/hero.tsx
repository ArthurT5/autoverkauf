"use client";

import { useRef, useLayoutEffect } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "@/lib/gsap";
import { CtaButton } from "@/components/ui/cta-button";
import { HalftoneCanvas } from "@/components/motion/halftone-canvas";
import { PRELOADER_DONE_EVENT } from "@/components/motion/preloader";

export function Hero() {
  const t = useTranslations("hero");
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const rise = gsap.fromTo(
          gsap.utils.selector(el)(".hero-rise"),
          { y: 28, autoAlpha: 0, filter: "blur(10px)" },
          {
            y: 0,
            autoAlpha: 1,
            filter: "blur(0px)",
            duration: 1.1,
            ease: "power3.out",
            stagger: 0.1,
            delay: 0.2,
            paused: true,
          }
        );

        // On a first visit the preloader curtain covers the page for ~2s.
        // This layout effect runs before the preloader's effect sets the
        // session flag, so an unset flag means the curtain is about to run:
        // hold the entrance until the panels part (with a safety timeout).
        let preloaderPending = false;
        try {
          preloaderPending = !sessionStorage.getItem("av-preloaded");
        } catch {}

        if (!preloaderPending) {
          rise.play();
          return;
        }
        const play = () => rise.play();
        window.addEventListener(PRELOADER_DONE_EVENT, play, { once: true });
        const fallback = window.setTimeout(play, 6000);
        return () => {
          window.removeEventListener(PRELOADER_DONE_EVENT, play);
          window.clearTimeout(fallback);
        };
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      data-theme="dark"
      data-nav-theme="dark"
      className="grain-dark relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-[oklch(0.068_0.008_27)] px-6 pt-16 text-center"
    >
      <HalftoneCanvas sun revealOn="preloader" />

      {/* red glow — broad, warm, sits behind the halftone sun */}
      <div
        className="pointer-events-none absolute left-1/2 top-[-8%] -translate-x-1/2 h-[580px] w-[1040px] max-w-[140vw] rounded-full bg-[var(--red)] opacity-[0.08] blur-[150px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="hero-rise mb-7 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-4 py-1.5 text-[11.5px] font-medium text-white/55">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--red)]" aria-hidden />
            {t("badge")}
          </span>
        </div>
        <h1
          className="hero-rise text-[clamp(2.8rem,6vw,5rem)] font-bold leading-[0.97] tracking-[-0.04em] text-white"
          style={{ textWrap: "balance" }}
        >
          {t("headline1")}{" "}
          <em className="not-italic text-[var(--red)]">{t("headline2")}</em>
        </h1>

        <p className="hero-rise mx-auto mt-7 max-w-[480px] text-[1.075rem] leading-[1.75] text-white/50">
          {t("subtitle")}
        </p>

        <div className="hero-rise mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <CtaButton href="/buyer/requests/new" variant="primary" arrow>
            {t("cta")}
          </CtaButton>
          <CtaButton href="#how-it-works" variant="ghost-dark">
            {t("ctaSecondary")}
          </CtaButton>
        </div>

        <ul className="hero-rise mt-9 flex list-none flex-wrap justify-center gap-x-6 gap-y-2">
          {(["pillar1", "pillar2", "pillar3"] as const).map((k) => (
            <li key={k} className="flex items-center gap-2 text-[12px] text-white/55">
              <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-white/30" aria-hidden />
              {t(k)}
            </li>
          ))}
        </ul>
      </div>

      {/* Scroll cue */}
      <div className="hero-rise absolute bottom-9 left-1/2 -translate-x-1/2" aria-hidden="true">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/15 pt-1.5">
          <div className="h-1.5 w-1 motion-safe:animate-bounce rounded-full bg-white/35" />
        </div>
      </div>
    </section>
  );
}
