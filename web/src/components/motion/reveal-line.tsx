"use client";

import { useRef, useLayoutEffect } from "react";
import { gsap } from "@/lib/gsap";

type Props = {
  className?: string;
  delay?: number;
  start?: string;
};

export function RevealLine({ className, delay = 0, start = "top 90%" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          el,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            duration: 0.8,
            delay,
            ease: "power3.inOut",
            scrollTrigger: { trigger: el, start, once: true },
          }
        );
      });
    }, ref);
    return () => ctx.revert();
  }, [delay, start]);

  return <div ref={ref} className={className ?? "h-px w-10 origin-left bg-current"} />;
}
