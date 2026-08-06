"use client";

import { useRef, useLayoutEffect, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  className?: string;
  /** Fraction of the section height to drift. 0.08 = ±8% = ~50px on a 600px section. */
  strength?: number;
};

/**
 * Wraps children in a scroll-scrubbed parallax container.
 * The parent element defines the ScrollTrigger bounds.
 */
export function Parallax({ children, className, strength = 0.08 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const pct = strength * 100;
        gsap.fromTo(
          el,
          { yPercent: -pct },
          {
            yPercent: pct,
            ease: "none",
            scrollTrigger: {
              trigger: parent,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    }, ref);

    return () => ctx.revert();
  }, [strength]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
