"use client";

import { useRef, useLayoutEffect, type ElementType, type ReactNode } from "react";
import { gsap, SplitText } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  start?: string;
};

/**
 * Splits a heading into lines and reveals each one from below with a stagger.
 * Falls back to visible with no animation on reduced-motion or SSR.
 */
export function RevealHeading({
  children,
  as,
  className,
  style,
  delay = 0,
  start = "top 88%",
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const Tag = (as ?? "h2") as ElementType;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = new SplitText(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
        });

        gsap.fromTo(
          split.lines,
          { y: "105%", autoAlpha: 0 },
          {
            y: "0%",
            autoAlpha: 1,
            duration: 0.9,
            delay,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: el,
              start,
              once: true,
            },
          }
        );
      });
    }, ref);

    return () => ctx.revert();
  }, [delay, start]);

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
