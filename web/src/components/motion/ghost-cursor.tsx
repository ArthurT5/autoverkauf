"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

export function GhostCursor() {
  const [show, setShow] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return;
    setShow(true);
    document.documentElement.classList.add("custom-cursor");
    return () => document.documentElement.classList.remove("custom-cursor");
  }, []);

  useEffect(() => {
    if (!show) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const ctx = gsap.context(() => {
      gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });

      const xTo = gsap.quickTo(ring, "x", { duration: 0.18, ease: "power2.out" });
      const yTo = gsap.quickTo(ring, "y", { duration: 0.18, ease: "power2.out" });

      const onMove = (e: MouseEvent) => {
        gsap.set(dot, { x: e.clientX, y: e.clientY });
        xTo(e.clientX);
        yTo(e.clientY);
      };

      const onDown = () =>
        gsap.to(dot, { scale: 0.45, duration: 0.08, ease: "power2.out" });
      const onUp = () =>
        gsap.to(dot, { scale: 1, duration: 0.18, ease: "back.out(2.5)" });

      window.addEventListener("mousemove", onMove, { passive: true });
      document.addEventListener("mousedown", onDown);
      document.addEventListener("mouseup", onUp);

      return () => {
        window.removeEventListener("mousemove", onMove);
        document.removeEventListener("mousedown", onDown);
        document.removeEventListener("mouseup", onUp);
      };
    });

    return () => ctx.revert();
  }, [show]);

  if (!show) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
