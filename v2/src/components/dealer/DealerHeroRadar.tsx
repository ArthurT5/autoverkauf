import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, SplitText } from "@/lib/gsap";

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface DealerHeroDict {
  kicker: string;
  tagline: string;
  title: string;
  sub: string;
  cta: string;
  scroll: string;
}

/* Direction A — "Radar". A Swiss demand-scope: range rings + graticule, a slow
   red sweep, and buyer-request blips that light up as the sweep passes and get
   pulled toward the dealer at centre. Technical-instrument, on-message, not a
   generic constellation. Canvas @ rAF; reduced-motion draws one static frame. */
export default function DealerHeroRadar({ dict }: { dict: DealerHeroDict }) {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  // ── the scope ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, dpr = 1, cx = 0, cy = 0, R = 0;
    function resize() {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W * (W > 900 ? 0.72 : 0.5); cy = H * 0.52; R = Math.min(W, H) * (W > 900 ? 0.46 : 0.6);
    }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas);

    // blips = buyer requests around the scope (fixed polar positions)
    const RNG = (s: number) => { let x = Math.sin(s) * 43758.5453; return x - Math.floor(x); };
    const blips = Array.from({ length: 11 }, (_, i) => ({
      a: RNG(i + 1) * Math.PI * 2,
      r: 0.32 + RNG(i + 9) * 0.62,
      lit: 0,
      pull: 0,
    }));
    let sweep = -Math.PI / 2;

    function frame(dt: number) {
      ctx.clearRect(0, 0, W, H);

      // range rings
      for (let k = 1; k <= 4; k++) {
        ctx.beginPath(); ctx.arc(cx, cy, (R * k) / 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${0.05 + (4 - k) * 0.006})`; ctx.lineWidth = 1; ctx.stroke();
      }
      // graticule
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
        ctx.strokeStyle = "rgba(255,255,255,0.035)"; ctx.lineWidth = 1; ctx.stroke();
      }

      // sweep wedge (red, trailing gradient)
      sweep += dt * 0.55;
      const grad = ctx.createConicGradient ? ctx.createConicGradient(sweep, cx, cy) : null;
      if (grad) {
        grad.addColorStop(0, "rgba(216,30,36,0.30)");
        grad.addColorStop(0.08, "rgba(216,30,36,0.0)");
        grad.addColorStop(1, "rgba(216,30,36,0.0)");
        ctx.save();
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, sweep - 0.9, sweep); ctx.closePath();
        ctx.fillStyle = grad; ctx.fill();
        ctx.restore();
      }
      // sweep leading line
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweep) * R, cy + Math.sin(sweep) * R);
      ctx.strokeStyle = "rgba(216,30,36,0.55)"; ctx.lineWidth = 1.4; ctx.stroke();

      // blips
      const norm = (x: number) => { x %= Math.PI * 2; return x < 0 ? x + Math.PI * 2 : x; };
      blips.forEach((b) => {
        const d = Math.abs(norm(sweep) - norm(b.a));
        const near = Math.min(d, Math.PI * 2 - d);
        if (near < 0.06) b.lit = 1;
        b.lit = Math.max(0, b.lit - dt * 0.7);
        const rr = (b.r - b.pull * b.r * 0.65) * R;
        const x = cx + Math.cos(b.a) * rr, y = cy + Math.sin(b.a) * rr;
        if (b.lit > 0.85 && b.pull === 0 && Math.random() < 0.04) b.pull = 0.0001;
        if (b.pull > 0) { b.pull = Math.min(1, b.pull + dt * 0.5); if (b.pull >= 1) { b.pull = 0; } }
        ctx.beginPath(); ctx.arc(x, y, 2 + b.lit * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = b.lit > 0.05 ? `rgba(216,30,36,${0.5 + b.lit * 0.5})` : "rgba(255,255,255,0.22)";
        ctx.fill();
        if (b.lit > 0.3) {
          ctx.beginPath(); ctx.arc(x, y, 4 + (1 - b.lit) * 14, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(216,30,36,${b.lit * 0.35})`; ctx.lineWidth = 1; ctx.stroke();
        }
      });

      // centre — the dealer
      ctx.beginPath(); ctx.arc(cx, cy, 4.5, 0, Math.PI * 2); ctx.fillStyle = "rgb(216,30,36)"; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.strokeStyle = "rgba(216,30,36,0.4)"; ctx.lineWidth = 1; ctx.stroke();
    }

    if (reduce) { sweep = -0.9; blips[2].lit = 1; blips[6].lit = 0.7; frame(0); return () => ro.disconnect(); }
    let last = 0, raf = 0;
    const loop = (t: number) => { const dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t; frame(dt); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  // ── entrance ──
  useIso(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const fades = gsap.utils.toArray<HTMLElement>(".dr-fade");
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
    <section ref={root} data-nav="dark" className="grain-dark relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-void text-white">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 90% at 72% 52%, transparent 40%, oklch(0.135 0.01 27 / 0.65) 78%)" }} />

      <div className="relative z-10 mx-auto flex w-full max-w-[86rem] flex-1 flex-col justify-center px-[var(--gutter)] pt-24">
        <span className="dr-fade text-[11px] font-medium uppercase tracking-[0.2em] text-white/50 [font-family:var(--font-mono)]">
          <span style={{ color: "var(--color-red)" }}>//</span> {dict.kicker}
        </span>
        <h1 ref={heading} className="mt-6 max-w-[15ch] text-[clamp(2.8rem,6.5vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.035em] [font-family:var(--font-display)]">
          {dict.title}
        </h1>
        <p className="dr-fade mt-7 max-w-[40rem] text-[1.0625rem] leading-[1.62] text-white/60">{dict.sub}</p>
        <div className="dr-fade mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a href="/haendler/apply" className="group inline-flex items-center justify-center gap-2.5 rounded-[var(--radius-md)] px-6 py-3.5 text-[0.95rem] font-medium text-white transition-transform duration-200 hover:-translate-y-px" style={{ background: "var(--color-red)", boxShadow: "var(--shadow-red)" }}>
            {dict.cta}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-hover:translate-x-0.5"><path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
          <span className="text-[0.8rem] uppercase tracking-[0.14em] text-white/40 [font-family:var(--font-mono)]">{dict.tagline}</span>
        </div>
      </div>

      <div className="dr-fade relative z-10 mx-auto w-full max-w-[86rem] px-[var(--gutter)] pb-8">
        <span className="text-[10px] uppercase tracking-[0.22em] text-white/40 [font-family:var(--font-mono)]">↓ {dict.scroll}</span>
      </div>
    </section>
  );
}
