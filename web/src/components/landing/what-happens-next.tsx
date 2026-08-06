"use client";

import { useRef, useLayoutEffect } from "react";
import { useTranslations } from "next-intl";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { RevealHeading } from "@/components/motion/reveal-heading";
import { HalftoneCanvas } from "@/components/motion/halftone-canvas";
import { Eyebrow } from "@/components/motion/eyebrow";

// ── Mockup prop type ─────────────────────────────────────────────────────────

type UI = {
  newRequest: string;
  lBudget: string; vBudget: string;
  lBody: string;   vBody: string;
  lFuel: string;   vFuel: string;
  submit: string;
  matching: string;
  yourOffers: string;
  newCount: string;
  match: string;
};

// ── UI mockups (illustrative — text drawn from i18n) ────────────────────────

function RequestMockup({ ui }: { ui: UI }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
      <p className="mb-3 text-[11px] font-semibold text-white/45">{ui.newRequest}</p>
      <div className="space-y-2.5">
        {([
          [ui.lBudget, ui.vBudget],
          [ui.lBody,   ui.vBody],
          [ui.lFuel,   ui.vFuel],
        ] as [string, string][]).map(([label, value]) => (
          <div key={label} className="flex items-center justify-between text-[11px]">
            <span className="text-white/25">{label}</span>
            <span className="text-white/55">{value}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-right text-[10px] font-medium text-[var(--red)]">
        {ui.submit} →
      </div>
    </div>
  );
}

function NotifyMockup({ ui }: { ui: UI }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400/70" />
        <span className="truncate text-[11px] font-semibold text-white/45">{ui.matching}</span>
      </div>
      <div className="space-y-2">
        {["Zürich", "Bern", "Basel", "St. Gallen"].map((city) => (
          <div key={city} className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-white/15 bg-white/[0.05]" />
            <span className="text-[11px] text-white/35">{city}</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function OfferMockup({ ui }: { ui: UI }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-white/45">{ui.yourOffers}</span>
        <span className="rounded-full bg-[var(--red)]/15 px-2 py-0.5 text-[9.5px] font-medium text-[var(--red)]">
          {ui.newCount}
        </span>
      </div>
      <div className="space-y-2">
        {[94, 87, 81].map((pct) => (
          <div
            key={pct}
            className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-[10.5px]"
          >
            <span className="text-white/30">★ {pct}% {ui.match}</span>
            <span className="text-white/40">→</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Steps config (outside component — stable reference) ──────────────────────

const STEPS = [
  { titleKey: "s1title" as const, bodyKey: "s1body" as const, Mockup: RequestMockup },
  { titleKey: "s2title" as const, bodyKey: "s2body" as const, Mockup: NotifyMockup },
  { titleKey: "s3title" as const, bodyKey: "s3body" as const, Mockup: OfferMockup },
];

// ── Section ──────────────────────────────────────────────────────────────────

export function WhatHappensNext() {
  const t    = useTranslations("next");
  const tHow = useTranslations("how");
  const root = useRef<HTMLElement>(null);

  const ui: UI = {
    newRequest: tHow("ui.newRequest"),
    lBudget:    tHow("ui.lBudget"),
    vBudget:    tHow("ui.vBudget"),
    lBody:      tHow("ui.lBody"),
    vBody:      tHow("ui.vBody"),
    lFuel:      tHow("ui.lFuel"),
    vFuel:      tHow("ui.vFuel"),
    submit:     tHow("ui.submit"),
    matching:   tHow("ui.matching"),
    yourOffers: tHow("ui.yourOffers"),
    newCount:   tHow("ui.newCount"),
    match:      tHow("ui.match"),
  };

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 65%",
          onEnter: () => {
            gsap.fromTo(
              gsap.utils.selector(el)(".step-card"),
              { y: 36, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.75, ease: "power3.out", stagger: 0.14 }
            );
          },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      data-theme="dark"
      data-nav-theme="dark"
      className="grain-dark relative overflow-hidden bg-[oklch(0.068_0.008_27)] py-28 lg:py-40"
    >
      <HalftoneCanvas inkAlpha={0.45} farBase={0.78} nearBase={0.92} phase={1.2} />
      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <Eyebrow className="text-white/40 mx-auto w-fit" delay={0}>{t("eyebrow")}</Eyebrow>
          <RevealHeading
            className="text-[clamp(2.1rem,3.8vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.03em] text-white"
            style={{ textWrap: "balance" }}
            delay={0.05}
          >
            {t("heading")}
          </RevealHeading>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map(({ titleKey, bodyKey, Mockup }, i) => (
            <div
              key={titleKey}
              className="step-card rounded-2xl border border-white/[0.07] bg-white/[0.025] p-7"
            >
              <p className="mb-5 text-[11px] font-semibold tracking-[0.15em] text-white/20">
                0{i + 1}
              </p>
              <Mockup ui={ui} />
              <h3 className="mt-6 text-[16px] font-semibold leading-snug tracking-[-0.01em] text-white">
                {t(titleKey)}
              </h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-white/45">
                {t(bodyKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
