import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, SplitText } from "@/lib/gsap";
import type { DealerHeroDict } from "./DealerHeroRadar";

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* Direction B — "Contour". A layered alpine ridgeline plot (Joy-Division-style
   stacked contours) drifting slowly — architectural, editorial, calm. Ink on
   paper, one red ridge. Distinctive, not a generic wave. Left-aligned type.
   Canvas @ rAF; reduced-motion draws one static frame. */
export default function DealerHeroContour({ dict }: { dict: DealerHeroDict }) {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, dpr = 1;
    function resize() {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas);

    const LINES = 30;
    const peaks = [
      { x: 0.30, amp: 0.9, w: 0.10, sp: 0.06 },
      { x: 0.58, amp: 1.0, w: 0.13, sp: -0.04 },
      { x: 0.80, amp: 0.7, w: 0.09, sp: 0.05 },
    ];
    const RED_LINE = Math.round(LINES * 0.62);

    function height(xf: number, phase: number) {
      let v = 0;
      for (const p of peaks) {
        const px = p.x + Math.sin(phase * p.sp * 6) * 0.05;
        const d = xf - px;
        v += p.amp * Math.exp(-(d * d) / (2 * p.w * p.w));
      }
      v += 0.06 * Math.sin(xf * 22 + phase); // fine ripple
      return v;
    }

    function frame(phase: number) {
      ctx.clearRect(0, 0, W, H);
      const topPad = H * 0.30, usable = H * 0.66;
      const step = Math.max(4, W / 260);
      for (let i = 0; i < LINES; i++) {
        const f = i / (LINES - 1);
        const baseY = topPad + f * usable;
        const scale = (0.35 + f * 1.15) * H * 0.22; // nearer ridges taller
        const isRed = i === RED_LINE;
        ctx.beginPath();
        ctx.moveTo(-2, H + 2);
        for (let x = -2; x <= W + 2; x += step) {
          const y = baseY - height(x / W, phase + i * 0.12) * scale;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W + 2, H + 2);
        ctx.closePath();
        // occlude ridges behind with the page colour
        ctx.fillStyle = "oklch(0.974 0.003 27)"; // --color-paper-2
        ctx.fill();
        // stroke the ridge top
        ctx.beginPath();
        for (let x = -2; x <= W + 2; x += step) {
          const y = baseY - height(x / W, phase + i * 0.12) * scale;
          x === -2 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = isRed ? "rgba(216,30,36,0.85)" : `rgba(24,18,18,${0.10 + f * 0.14})`;
        ctx.lineWidth = isRed ? 1.6 : 1;
        ctx.stroke();
      }
    }

    if (reduce) { frame(1.2); return () => ro.disconnect(); }
    let raf = 0, t0 = 0;
    const loop = (t: number) => { if (!t0) t0 = t; frame((t - t0) / 1000 * 0.35); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  useIso(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const fades = gsap.utils.toArray<HTMLElement>(".dc-fade");
      gsap.set(fades, { opacity: 0, y: 20 });
      if (heading.current) gsap.set(heading.current, { opacity: 0 });
      const build = () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        if (heading.current) {
          gsap.set(heading.current, { opacity: 1 });
          const s = new SplitText(heading.current, { type: "lines", mask: "lines" });
          tl.from(s.lines, { yPercent: 118, duration: 0.95, stagger: 0.12 });
        }
        tl.to(fades, { opacity: 1, y: 0, duration: 0.75, stagger: 0.09 }, "-=0.5");
      };
      document.fonts?.ready ? document.fonts.ready.then(build) : build();
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} data-nav="light" className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-paper-2 text-ink">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2" style={{ background: "linear-gradient(to bottom, var(--color-paper-2), transparent)" }} />

      <div className="relative z-10 mx-auto flex w-full max-w-[86rem] flex-1 flex-col justify-center px-[var(--gutter)] pt-24">
        <span className="dc-fade text-[11px] font-medium uppercase tracking-[0.2em] text-ink-500 [font-family:var(--font-mono)]">
          <span style={{ color: "var(--color-red)" }}>//</span> {dict.kicker}
        </span>
        <h1 ref={heading} className="mt-6 max-w-[15ch] text-[clamp(2.8rem,6.5vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-ink-900 [font-family:var(--font-display)]">
          {dict.title}
        </h1>
        <p className="dc-fade mt-7 max-w-[40rem] text-[1.0625rem] leading-[1.62] text-ink-500">{dict.sub}</p>
        <div className="dc-fade mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a href="/haendler/apply" className="group inline-flex items-center justify-center gap-2.5 rounded-[var(--radius-md)] px-6 py-3.5 text-[0.95rem] font-medium text-white transition-transform duration-200 hover:-translate-y-px" style={{ background: "var(--color-red)", boxShadow: "var(--shadow-red)" }}>
            {dict.cta}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-hover:translate-x-0.5"><path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
          <span className="text-[0.8rem] uppercase tracking-[0.14em] text-ink-400 [font-family:var(--font-mono)]">{dict.tagline}</span>
        </div>
      </div>

      <div className="dc-fade relative z-10 mx-auto w-full max-w-[86rem] px-[var(--gutter)] pb-8">
        <span className="text-[10px] uppercase tracking-[0.22em] text-ink-400 [font-family:var(--font-mono)]">↓ {dict.scroll}</span>
      </div>
    </section>
  );
}
