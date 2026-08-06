"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  accent: boolean;
  alpha: number;
};

type Props = {
  /** Base dot color as [r, g, b] 0-255 */
  color?: [number, number, number];
  /** Accent dot color (e.g. brand red). Defaults to same as color. */
  accentColor?: [number, number, number];
  /** Fraction of dots that use the accent color (0–1) */
  accentRatio?: number;
  /** Dot opacity range [min, max] */
  dotAlpha?: [number, number];
  /** Max line opacity */
  lineAlpha?: number;
  /** Speed multiplier (1 = default drift) */
  speed?: number;
  /** Particles per 20k px² of area */
  density?: number;
  /** Max distance for connecting lines (px) */
  linkDist?: number;
  className?: string;
};

export function AmbientCanvas({
  color = [255, 255, 255],
  accentColor,
  accentRatio = 0.08,
  dotAlpha = [0.04, 0.09],
  lineAlpha = 0.04,
  speed = 1,
  density = 1,
  linkDist = 140,
  className = "absolute inset-0 h-full w-full",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const accent = accentColor ?? color;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let animId = 0;
    let w = canvas.offsetWidth;
    let h = canvas.offsetHeight;

    const size = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const makeParticles = (): Particle[] => {
      const n = Math.max(20, Math.floor((w * h) / (20000 / density)));
      return Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22 * speed,
        vy: (Math.random() - 0.5) * 0.22 * speed,
        r: Math.random() * 1.2 + 0.4,
        accent: Math.random() < accentRatio,
        alpha: dotAlpha[0] + Math.random() * (dotAlpha[1] - dotAlpha[0]),
      }));
    };

    size();
    let particles = makeParticles();

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            const a = (1 - d / linkDist) * lineAlpha;
            const [r, g, b] = color;
            ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Dots
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        else if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        else if (p.y > h) p.y = 0;

        const [r, g, b] = p.accent ? accent : color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha})`;
        ctx.fill();
      }
    };

    const ro = new ResizeObserver(() => {
      size();
      particles = makeParticles();
      if (reduced) draw();
    });
    ro.observe(canvas);

    // Reduced motion: a single static constellation frame instead of a blank box.
    if (reduced) {
      draw();
      return () => ro.disconnect();
    }

    const loop = () => {
      draw();
      animId = requestAnimationFrame(loop);
    };

    // Only animate while the canvas is on screen in a visible tab.
    let running = false;
    let tabVisible = !document.hidden;
    let onScreen = false;

    const sync = () => {
      const should = tabVisible && onScreen;
      if (should && !running) {
        running = true;
        animId = requestAnimationFrame(loop);
      } else if (!should && running) {
        running = false;
        cancelAnimationFrame(animId);
      }
    };

    const onVisibility = () => {
      tabVisible = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    io.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [color, accent, accentRatio, dotAlpha, lineAlpha, speed, density, linkDist]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
