"use client";

import { useEffect, useRef } from "react";

// ── Car silhouette geometry ─────────────────────────────────────────────────
// All shapes in a local coordinate system:
//   x=0 center, y=0 = road / axle level, negative y goes UP (canvas is flipped via scale)
// Drawn facing right (→). Cars going left use ctx.scale(-1, 1).

function strokeSedan(ctx: CanvasRenderingContext2D) {
  // Compact sports sedan — VW Golf / BMW 3-series proportions
  ctx.beginPath();
  ctx.moveTo(60, 0);
  ctx.bezierCurveTo(64, 0, 65, -5, 64, -14);   // front face
  ctx.bezierCurveTo(63, -21, 56, -25, 42, -27); // hood top
  ctx.lineTo(26, -28);                            // windshield base
  ctx.lineTo(11, -51);                            // A-pillar
  ctx.bezierCurveTo(5, -55, -3, -57, -13, -57); // roof front
  ctx.bezierCurveTo(-23, -57, -34, -53, -42, -45); // roof rear
  ctx.lineTo(-53, -28);                           // C-pillar
  ctx.bezierCurveTo(-57, -19, -61, -9, -61, 0);  // rear face
  ctx.closePath();
  ctx.stroke();

  // Wheels + rims
  for (const [wx, wr] of [[37, 14], [-37, 14]] as [number, number][]) {
    ctx.beginPath();
    ctx.arc(wx, 0, wr, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(wx, 0, wr * 0.42, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Door separator
  ctx.beginPath();
  ctx.moveTo(-3, -27);
  ctx.lineTo(-3, -1);
  ctx.stroke();
}

function strokeSUV(ctx: CanvasRenderingContext2D) {
  // Tall, upright SUV — Range Rover-ish
  ctx.beginPath();
  ctx.moveTo(58, 0);
  ctx.bezierCurveTo(62, 0, 64, -4, 64, -16);   // front face
  ctx.lineTo(62, -30);                            // front face upper
  ctx.bezierCurveTo(60, -34, 54, -36, 44, -36); // hood
  ctx.lineTo(30, -37);                            // windshield base
  ctx.lineTo(20, -63);                            // A-pillar / windshield
  ctx.lineTo(-20, -65);                           // roof
  ctx.lineTo(-32, -63);                           // C-pillar top
  ctx.lineTo(-46, -37);                           // tailgate
  ctx.bezierCurveTo(-56, -30, -62, -18, -62, 0); // rear face
  ctx.closePath();
  ctx.stroke();

  // Wheels + rims (bigger)
  for (const [wx, wr] of [[33, 16], [-33, 16]] as [number, number][]) {
    ctx.beginPath();
    ctx.arc(wx, 0, wr, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(wx, 0, wr * 0.4, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Door separator
  ctx.beginPath();
  ctx.moveTo(-4, -36);
  ctx.lineTo(-4, -1);
  ctx.stroke();
}

function strokeCoupe(ctx: CanvasRenderingContext2D) {
  // Low, long fastback coupé — Porsche 911 / Audi TT proportions
  ctx.beginPath();
  ctx.moveTo(66, 0);
  ctx.bezierCurveTo(70, 0, 71, -4, 70, -13);    // front face
  ctx.bezierCurveTo(69, -21, 62, -26, 48, -28);  // long hood
  ctx.lineTo(30, -30);                             // windshield base
  ctx.lineTo(12, -50);                             // windshield / A-pillar
  ctx.bezierCurveTo(5, -54, -4, -55, -14, -55);  // front roof
  ctx.bezierCurveTo(-28, -55, -46, -46, -56, -32); // sweeping fastback
  ctx.bezierCurveTo(-62, -22, -66, -10, -66, 0); // rear
  ctx.closePath();
  ctx.stroke();

  // Wheels + rims
  for (const [wx, wr] of [[40, 14], [-40, 14]] as [number, number][]) {
    ctx.beginPath();
    ctx.arc(wx, 0, wr, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(wx, 0, wr * 0.43, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// ── Lane configuration ──────────────────────────────────────────────────────
// yFrac: 0–1 of canvas height. scale/alpha simulate depth (smaller = farther).
type Lane = {
  yFrac: number;
  scale: number;
  alpha: number;
  speed: number;   // px/frame at scale=1
  dir: 1 | -1;
  type: 0 | 1 | 2; // 0=sedan, 1=suv, 2=coupe
};

// Top cluster (above headline) + bottom cluster (below CTAs) — center left clear for text
const LANES: Lane[] = [
  { yFrac: 0.06, scale: 0.36, alpha: 0.09, speed: 0.42, dir:  1, type: 2 },
  { yFrac: 0.14, scale: 0.44, alpha: 0.11, speed: 0.48, dir: -1, type: 0 },
  { yFrac: 0.23, scale: 0.54, alpha: 0.13, speed: 0.54, dir:  1, type: 1 },
  { yFrac: 0.80, scale: 0.62, alpha: 0.16, speed: 0.60, dir: -1, type: 0 },
  { yFrac: 0.88, scale: 0.76, alpha: 0.18, speed: 0.70, dir:  1, type: 2 },
  { yFrac: 0.95, scale: 0.88, alpha: 0.20, speed: 0.78, dir: -1, type: 1 },
];

const DRAWERS = [strokeSedan, strokeSUV, strokeCoupe];

// ── Component ───────────────────────────────────────────────────────────────
export function CarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    size();

    // Seed cars at random positions so they appear immediately
    const carX = LANES.map(() => Math.random() * w);

    const draw = (advance: boolean) => {
      ctx.clearRect(0, 0, w, h);

      LANES.forEach((lane, i) => {
        const s = lane.scale;
        const carHalfW = 70 * s; // approximate half-width of any car shape

        // Advance position
        if (advance) carX[i] += lane.dir * lane.speed * s;

        // Wrap around
        if (lane.dir === 1 && carX[i] - carHalfW > w) {
          carX[i] = -carHalfW * 2;
        } else if (lane.dir === -1 && carX[i] + carHalfW < 0) {
          carX[i] = w + carHalfW * 2;
        }

        const cy = h * lane.yFrac;

        ctx.save();
        ctx.translate(carX[i], cy);
        ctx.scale(s * lane.dir, s); // no y-flip — car coords use negative y for body above road
        ctx.globalAlpha = lane.alpha;
        ctx.strokeStyle = "rgb(255,255,255)";
        ctx.lineWidth = 1.8 / s;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        DRAWERS[lane.type](ctx);

        // Headlight glow (front of car) — very subtle warm white dot
        const headX = lane.dir === 1 ? 66 : -66;
        ctx.globalAlpha = lane.alpha * 1.6;
        const grd = ctx.createRadialGradient(headX, -8, 0, headX, -8, 22 / s);
        grd.addColorStop(0, "rgba(255,248,220,0.9)");
        grd.addColorStop(1, "rgba(255,248,220,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(headX, -8, 22 / s, 0, Math.PI * 2);
        ctx.fill();

        // Taillight glow (rear) — faint red
        const tailX = lane.dir === 1 ? -64 : 64;
        ctx.globalAlpha = lane.alpha * 1.2;
        const tgrd = ctx.createRadialGradient(tailX, -8, 0, tailX, -8, 18 / s);
        tgrd.addColorStop(0, "rgba(196,38,12,0.8)");
        tgrd.addColorStop(1, "rgba(196,38,12,0)");
        ctx.fillStyle = tgrd;
        ctx.beginPath();
        ctx.arc(tailX, -8, 18 / s, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });
    };

    const ro = new ResizeObserver(() => {
      size();
      if (reduced) draw(false);
    });
    ro.observe(canvas);

    // Reduced motion: one static frame — parked silhouettes instead of an empty hero.
    if (reduced) {
      draw(false);
      return () => ro.disconnect();
    }

    const loop = () => {
      draw(true);
      animId = requestAnimationFrame(loop);
    };

    // Only animate while the hero is on screen in a visible tab.
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
