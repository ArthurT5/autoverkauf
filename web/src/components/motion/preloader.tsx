"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { Logo } from "@/components/logo";

const STATUSES = [
  "SCANNING_DEALERSHIP_NETWORK...",
  "CALIBRATING_MARKET_INTELLIGENCE...",
  "PROCESSING_BUYER_REQUESTS...",
  "VERIFYING_SWISS_COVERAGE...",
  "SYSTEM_READY.",
] as const;

const GRID: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(180,35,35,0.08) 1px, transparent 1px)," +
    "linear-gradient(90deg, rgba(180,35,35,0.08) 1px, transparent 1px)",
  backgroundSize: "44px 44px",
};

const LOAD_MS = 1700;

/** Fired on `window` the moment the curtain panels part enough to see the page. */
export const PRELOADER_DONE_EVENT = "av:preloader-done";

function hasPreloaded(): boolean {
  try {
    return Boolean(sessionStorage.getItem("av-preloaded"));
  } catch {
    return false;
  }
}

export function Preloader() {
  const [active, setActive] = useState<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (hasPreloaded()) {
      setActive(false);
      return;
    }
    try {
      sessionStorage.setItem("av-preloaded", "1");
    } catch {}
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(false);
      window.dispatchEvent(new Event(PRELOADER_DONE_EVENT));
      return;
    }
    setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return;

    let rafId: number;
    let start: number | null = null;

    const doExit = () => {
      const tl = gsap.timeline({ onComplete: () => setActive(false) });
      tlRef.current = tl;
      tl.to(contentRef.current, {
        scale: 2,
        opacity: 0,
        filter: "blur(10px)",
        duration: 0.5,
        ease: "power2.in",
      });
      tl.to(topRef.current, { yPercent: 5, duration: 0.3, ease: "power2.out" }, "-=0.3");
      tl.to(bottomRef.current, { yPercent: -5, duration: 0.3, ease: "power2.out" }, "<");
      tl.to(topRef.current, { yPercent: -100, duration: 1.4, ease: "expo.inOut" });
      tl.to(bottomRef.current, { yPercent: 100, duration: 1.4, ease: "expo.inOut" }, "<");
      // expo.inOut moves slowly at first — the page becomes visible ~0.5s in
      tl.call(() => window.dispatchEvent(new Event(PRELOADER_DONE_EVENT)), [], "<0.5");
      tl.set(containerRef.current, { display: "none" });
    };

    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / LOAD_MS, 1);
      const pct = Math.round(p * 100);

      if (pctRef.current) pctRef.current.textContent = pct.toString().padStart(3, "0") + "%";
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;

      const idx = Math.min(Math.floor(p * STATUSES.length), STATUSES.length - 1);
      if (statusRef.current) statusRef.current.textContent = STATUSES[idx];

      if (p < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        doExit();
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      tlRef.current?.kill();
      tlRef.current = null;
    };
  }, [active]);

  if (active !== true) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[200]">
      {/* Top curtain panel */}
      <div
        ref={topRef}
        className="absolute inset-x-0 top-0 h-1/2 bg-[oklch(0.068_0.008_27)]"
        style={GRID}
      />
      {/* Bottom curtain panel */}
      <div
        ref={bottomRef}
        className="absolute inset-x-0 bottom-0 h-1/2 bg-[oklch(0.068_0.008_27)]"
        style={GRID}
      />
      {/* Center content — sits above both panels */}
      <div
        ref={contentRef}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-7"
      >
        <Logo dark />
        <div className="flex flex-col items-center gap-2.5">
          <span
            ref={pctRef}
            className="font-mono text-5xl font-light tracking-[-0.04em] text-[oklch(0.97_0_0)] tabular-nums"
          >
            000%
          </span>
          {/* Progress bar */}
          <div className="relative h-px w-44 overflow-hidden rounded-full bg-[oklch(1_0_0/0.10)]">
            <div
              ref={barRef}
              className="absolute inset-0 bg-[var(--red)]"
              style={{ transformOrigin: "left", transform: "scaleX(0)" }}
            />
          </div>
          {/* Status text */}
          <span
            ref={statusRef}
            className="font-mono text-[9px] tracking-[0.18em] text-[oklch(0.45_0.008_27)] uppercase"
          >
            {STATUSES[0]}
          </span>
        </div>
      </div>
    </div>
  );
}
