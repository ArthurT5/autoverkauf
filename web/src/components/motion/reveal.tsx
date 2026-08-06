"use client";

import { useRef, useLayoutEffect, type ElementType, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** translate distance in px (default 24) */
  y?: number;
  /** delay before the reveal starts, seconds */
  delay?: number;
  /** stagger immediate children instead of revealing as one block */
  stagger?: boolean;
  /** viewport trigger position (default "top 85%") */
  start?: string;
};

/**
 * Scroll-triggered reveal. Content is visible by default (SSR/no-JS/reduced-
 * motion safe); when motion is allowed, GSAP sets the from-state and plays it
 * in as the element enters the viewport.
 */
export function Reveal({
  children,
  as,
  className,
  y = 24,
  delay = 0,
  stagger = false,
  start = "top 85%",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const Tag = (as ?? "div") as ElementType;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = stagger ? Array.from(el.children) : el;
        gsap.fromTo(
          targets,
          { autoAlpha: 0, y },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            delay,
            ease: "power3.out",
            stagger: stagger ? 0.08 : 0,
            scrollTrigger: { trigger: el, start, once: true },
          }
        );
      });
    }, ref);

    return () => ctx.revert();
  }, [y, delay, stagger, start]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
