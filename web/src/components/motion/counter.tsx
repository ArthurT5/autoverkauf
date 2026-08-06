"use client";

import { useRef, useLayoutEffect } from "react";
import { gsap } from "@/lib/gsap";

type CounterProps = {
  to: number;
  from?: number;
  /** characters appended after the number, e.g. "%", "k", "+" */
  suffix?: string;
  prefix?: string;
  /** locale for thousands separators (Swiss apostrophe grouping by default) */
  locale?: string;
  decimals?: number;
  className?: string;
};

/**
 * Counts from `from` to `to` when scrolled into view. Reduced-motion users see
 * the final value immediately.
 */
export function Counter({
  to,
  from = 0,
  suffix = "",
  prefix = "",
  locale = "de-CH",
  decimals = 0,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fmt = (n: number) =>
      prefix +
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(n) +
      suffix;

    el.textContent = fmt(to);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const obj = { v: from };
        el.textContent = fmt(from);
        gsap.to(obj, {
          v: to,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onUpdate: () => {
            el.textContent = fmt(obj.v);
          },
        });
      });
    }, ref);

    return () => ctx.revert();
  }, [to, from, suffix, prefix, locale, decimals]);

  return <span ref={ref} className={className}>{prefix}{to}{suffix}</span>;
}
