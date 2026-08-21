import { useEffect, useRef } from "react";

/* Slim ridgeline canvas used as a section background (the "blend" — Direction
   B's contour texture reused on a light section). Subtle, drifting, one red
   ridge. rAF; reduced-motion draws one static frame; pauses off-screen. */
export default function ContourBg() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
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

    const LINES = 26;
    const peaks = [
      { x: 0.34, amp: 0.85, w: 0.12, sp: 0.05 },
      { x: 0.66, amp: 1.0, w: 0.14, sp: -0.04 },
    ];
    const RED = Math.round(LINES * 0.58);
    const h = (xf: number, ph: number) => {
      let v = 0;
      for (const p of peaks) { const d = xf - (p.x + Math.sin(ph * p.sp * 6) * 0.04); v += p.amp * Math.exp(-(d * d) / (2 * p.w * p.w)); }
      return v + 0.05 * Math.sin(xf * 18 + ph);
    };
    function frame(ph: number) {
      ctx.clearRect(0, 0, W, H);
      const top = H * 0.28, usable = H * 0.68, step = Math.max(5, W / 220);
      for (let i = 0; i < LINES; i++) {
        const f = i / (LINES - 1), baseY = top + f * usable, scale = (0.4 + f * 1.1) * H * 0.2, red = i === RED;
        ctx.beginPath(); ctx.moveTo(-2, H + 2);
        for (let x = -2; x <= W + 2; x += step) ctx.lineTo(x, baseY - h(x / W, ph + i * 0.12) * scale);
        ctx.lineTo(W + 2, H + 2); ctx.closePath();
        ctx.fillStyle = "oklch(0.974 0.003 27)"; ctx.fill();
        ctx.beginPath();
        for (let x = -2; x <= W + 2; x += step) { const y = baseY - h(x / W, ph + i * 0.12) * scale; x === -2 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.strokeStyle = red ? "rgba(216,30,36,0.7)" : `rgba(24,18,18,${0.07 + f * 0.1})`;
        ctx.lineWidth = red ? 1.5 : 1; ctx.stroke();
      }
    }
    if (reduce) { frame(1.2); return () => ro.disconnect(); }
    let raf = 0, t0 = 0, visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting)); io.observe(canvas);
    const loop = (t: number) => { if (!t0) t0 = t; if (visible) frame((t - t0) / 1000 * 0.3); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, []);
  return <canvas ref={ref} className="h-full w-full" aria-hidden />;
}
