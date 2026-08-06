"use client";

import { useEffect, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Reduced-motion users keep native scrolling; ScrollTrigger works fine without Lenis.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        anchors: true,
      });

      // Keep GSAP ScrollTrigger in sync with Lenis
      lenis.on("scroll", () => ScrollTrigger.update());

      const ticker = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        lenis.destroy();
        gsap.ticker.remove(ticker);
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return <>{children}</>;
}
