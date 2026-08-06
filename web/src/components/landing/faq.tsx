"use client";

import { motion, MotionConfig } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/reveal";
import { RevealHeading } from "@/components/motion/reveal-heading";
import { HalftoneCanvas } from "@/components/motion/halftone-canvas";
import { Eyebrow } from "@/components/motion/eyebrow";

type FAQItem = { q: string; a: string };

function FAQRow({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--hairline)] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="group flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-[15px] font-medium text-[var(--ink-900)] transition-colors group-hover:text-[var(--red)]">
          {item.q}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--ink-400)] transition-transform duration-300 ${open ? "rotate-180 text-[var(--red)]" : ""}`}
        />
      </button>
      <MotionConfig reducedMotion="user">
        <motion.div
          initial={false}
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <p className="max-w-prose pb-5 text-[14px] leading-relaxed text-[var(--ink-500)]">{item.a}</p>
        </motion.div>
      </MotionConfig>
    </div>
  );
}

export function FAQ() {
  const t = useTranslations("faq");
  const items = t.raw("items") as FAQItem[];

  return (
    <section
      data-theme="dark"
      data-nav-theme="dark"
      id="faq"
      className="grain-dark relative overflow-hidden bg-[oklch(0.068_0.008_27)] py-28 lg:py-40"
    >
      <HalftoneCanvas inkAlpha={0.4} farBase={0.78} nearBase={0.92} phase={5.3} />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-14 px-6 lg:grid-cols-[1fr_1.5fr] lg:gap-24 lg:px-8">
        <div>
          <Eyebrow className="text-white/40">{t("eyebrow")}</Eyebrow>
          <RevealHeading
            className="text-[clamp(2.1rem,3.8vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--ink-900)]"
            style={{ textWrap: "balance" }}
          >
            {t("heading")}
          </RevealHeading>
          <Reveal delay={0.12}>
            <p className="mt-6 text-[1.05rem] leading-relaxed text-[var(--ink-500)]">
              {t("contactPre")}
              <a href="/contact" className="font-medium text-[var(--red)] hover:underline">
                {t("contactLink")}
              </a>
            </p>
          </Reveal>
        </div>

        <Reveal
          y={28}
          className="rounded-3xl border border-white/[0.07] bg-[var(--card-bg)] p-4 sm:p-8"
        >
          {items.map((item, i) => (
            <FAQRow key={i} item={item} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
