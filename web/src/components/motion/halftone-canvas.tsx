"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { PRELOADER_DONE_EVENT } from "@/components/motion/preloader";

/**
 * The site-wide halftone language (inspired by the line-raster reference
 * artwork): scenes rendered as vertical bars of varying width, pre-drawn once
 * to an offscreen canvas and composited per column every frame.
 *
 * Variants:
 *  - scene (default): alpine ridgeline, optional Swiss-red halftone sun
 *  - texture: sky-only hairline bars, no image — quiet section texture
 *
 * Motion:
 *  - reveal: bars resolve from scattered noise — on preloader exit (hero)
 *    or on scroll-enter (sections)
 *  - idle: a slow breathing wave drifts through the columns
 *  - hero only: dissolves back toward noise as it scrolls out
 */

const COL_W = 7; // css px per bar column
const ROW_STEP = 6; // vertical sampling step for bar-width polygons

type HalftoneProps = {
  className?: string;
  /** bar color [r,g,b]; default warm off-white for dark sections */
  ink?: [number, number, number];
  /** multiplies bar opacity; 1 = hero strength */
  inkAlpha?: number;
  /** draw the Swiss-red halftone sun disc */
  sun?: boolean;
  /** ridge base heights as fraction of canvas height */
  farBase?: number;
  nearBase?: number;
  /** shifts the ridge sines so sections don't repeat the same skyline */
  phase?: number;
  /** texture-only: uniform hairline bars, no ridge/sun */
  texture?: boolean;
  /** what triggers the resolve-from-noise reveal */
  revealOn?: "preloader" | "scroll";
};

// deterministic per-column pseudo-random
function seeded(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

type Scene = {
  farY: (x: number) => number;
  nearY: (x: number) => number;
  sun: { x: number; y: number; r: number } | null;
  texture: boolean;
};

function makeScene(
  w: number,
  h: number,
  { farBase = 0.64, nearBase = 0.82, phase = 0, sun = false, texture = false }: HalftoneProps
): Scene {
  return {
    texture,
    farY: (x) =>
      h *
      (farBase +
        0.05 * Math.sin(x * 0.0016 + 1.7 + phase) +
        0.03 * Math.sin(x * 0.0042 + 0.4 + phase * 1.7) +
        0.015 * Math.sin(x * 0.011 + 2.2 + phase * 0.6)),
    nearY: (x) =>
      h *
      (nearBase +
        0.045 * Math.sin(x * 0.0011 + 4.1 + phase * 1.3) +
        0.03 * Math.sin(x * 0.0033 + 1.1 + phase) +
        0.015 * Math.sin(x * 0.009 + 5.0 + phase * 2.1)),
    sun: sun
      ? {
          x: Math.min(w * 0.78, w - h * 0.075 - 32),
          y: h * 0.3,
          r: Math.max(48, h * 0.075),
        }
      : null,
  };
}

/** brightness 0..1 of the scene at a point; drives bar width */
function brightness(scene: Scene, x: number, y: number, h: number): number {
  if (scene.texture) return 0.06 + 0.04 * (y / h);
  const far = scene.farY(x);
  const near = scene.nearY(x);
  if (y < far) {
    // sky — hairline texture only; content usually sits here
    return 0.05 + 0.05 * (y / far);
  }
  if (y < near) {
    // distant range — atmospheric mid tone, bright cap just below the ridge
    const cap = Math.max(0, 1 - (y - far) / 30);
    return 0.34 + 0.24 * cap;
  }
  // near range — densest, highlight along the ridge top, easing downward
  const cap = Math.max(0, 1 - (y - near) / 26);
  const depth = (y - near) / Math.max(1, h - near);
  return 0.72 + 0.24 * cap - 0.16 * depth;
}

function traceColumn(
  c: CanvasRenderingContext2D,
  scene: Scene,
  cx: number,
  h: number,
  widthJitter: number,
  bFloor = 0
) {
  // continuous bar: left/right edges mirror around the column centre,
  // width modulated by scene brightness — the reference-image look
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  for (let y = 0; y <= h; y += ROW_STEP) {
    const b = Math.max(brightness(scene, cx, y, h), bFloor);
    const bw = Math.max(0.4, b * (COL_W - 1.2) * widthJitter);
    left.push([cx - bw / 2, y]);
    right.push([cx + bw / 2, y]);
  }
  c.beginPath();
  c.moveTo(left[0][0], left[0][1]);
  for (const [px, py] of left) c.lineTo(px, py);
  for (let k = right.length - 1; k >= 0; k--) c.lineTo(right[k][0], right[k][1]);
  c.closePath();
  c.fill();
}

function renderScene(
  off: HTMLCanvasElement,
  w: number,
  h: number,
  dpr: number,
  props: HalftoneProps
) {
  off.width = Math.round(w * dpr);
  off.height = Math.round(h * dpr);
  const c = off.getContext("2d");
  if (!c) return;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, w, h);

  const scene = makeScene(w, h, props);
  const cols = Math.ceil(w / COL_W);
  const [r, g, b] = props.ink ?? [255, 243, 234];
  const alphaScale = props.inkAlpha ?? 1;

  // pass 1 — the full scene; bar width carries the image
  for (let i = 0; i < cols; i++) {
    const cx = i * COL_W + COL_W / 2;
    const jitter = 0.85 + seeded(i, 3) * 0.3;
    c.fillStyle = `rgba(${r},${g},${b},${(0.2 + seeded(i, 5) * 0.1) * alphaScale})`;
    traceColumn(c, scene, cx, h, jitter);
  }

  // pass 2 — the Swiss-red sun: same bars, clipped to the disc, so only the
  // segments inside the circle turn red (never the whole column)
  if (scene.sun) {
    const { sun } = scene;
    c.save();
    c.beginPath();
    c.arc(sun.x, sun.y, sun.r, 0, Math.PI * 2);
    c.clip();
    c.clearRect(sun.x - sun.r, sun.y - sun.r, sun.r * 2, sun.r * 2);
    const i0 = Math.max(0, Math.floor((sun.x - sun.r) / COL_W));
    const i1 = Math.min(cols - 1, Math.ceil((sun.x + sun.r) / COL_W));
    for (let i = i0; i <= i1; i++) {
      const cx = i * COL_W + COL_W / 2;
      const jitter = 0.85 + seeded(i, 3) * 0.3;
      c.fillStyle = "rgba(226,54,32,0.85)";
      // width floor so the disc reads as a solid halftone shape (bars + gaps)
      traceColumn(c, scene, cx, h, jitter, 0.55);
    }
    c.restore();
  }
}

export function HalftoneCanvas(props: HalftoneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cfg = propsRef.current;
    const revealOn = cfg.revealOn ?? "scroll";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const off = document.createElement("canvas");

    let w = canvas.offsetWidth;
    let h = canvas.offsetHeight;

    const size = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderScene(off, w, h, dpr, cfg);
    };
    size();

    // reveal: 0 = scattered noise, 1 = coherent image
    const state = { reveal: reduced ? 1 : 0, scrollFade: 1 };

    const composite = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const cols = Math.ceil(w / COL_W);
      // (hero only) scrolling away degrades coherence back toward noise
      const p = state.reveal * (0.25 + 0.75 * state.scrollFade);
      const disorder = 1 - p;

      for (let i = 0; i < cols; i++) {
        const dir = seeded(i, 7) > 0.5 ? 1 : -1;
        const scatter = dir * seeded(i, 11) * h * 0.45 * disorder * disorder;
        const idle = Math.sin(t * 0.00045 + i * 0.35) * 3 * p;
        const yShift = scatter + idle;
        const alpha = 0.12 + 0.88 * p;

        const sxDev = Math.round(i * COL_W * dpr);
        const swDev = Math.round(COL_W * dpr);
        ctx.globalAlpha = alpha;
        ctx.drawImage(
          off,
          sxDev, 0, swDev, off.height,
          i * COL_W, yShift, COL_W, h
        );
      }
      ctx.globalAlpha = 1;
    };

    const ro = new ResizeObserver(() => {
      size();
      if (reduced) composite(0);
    });
    ro.observe(canvas);

    if (reduced) {
      composite(0);
      return () => ro.disconnect();
    }

    // ── animation loop, paused offscreen / hidden tab ──
    let animId = 0;
    let running = false;
    let tabVisible = !document.hidden;
    let onScreen = false;

    const loop = (t: number) => {
      composite(t);
      animId = requestAnimationFrame(loop);
    };
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

    // ── reveal choreography ──
    const gsapCtx = gsap.context(() => {
      const resolve = gsap.to(state, {
        reveal: 1,
        duration: 2.4,
        ease: "power2.inOut",
        paused: true,
      });
      const play = () => resolve.play();
      const parent = canvas.parentElement ?? canvas;

      if (revealOn === "preloader") {
        // hero: resolve after the preloader curtain parts
        let preloaderPending = false;
        try {
          preloaderPending = !sessionStorage.getItem("av-preloaded");
        } catch {}

        let fallback: number | undefined;
        if (preloaderPending) {
          window.addEventListener(PRELOADER_DONE_EVENT, play, { once: true });
          fallback = window.setTimeout(play, 6000);
        } else {
          resolve.play();
        }

        // dissolve back toward noise as the hero scrolls out
        ScrollTrigger.create({
          trigger: parent,
          start: "top top",
          end: "bottom 20%",
          scrub: true,
          onUpdate: (self) => {
            state.scrollFade = 1 - self.progress;
          },
        });

        return () => {
          window.removeEventListener(PRELOADER_DONE_EVENT, play);
          if (fallback) window.clearTimeout(fallback);
        };
      }

      // sections: resolve once as they scroll into view
      ScrollTrigger.create({
        trigger: parent,
        start: "top 75%",
        once: true,
        onEnter: play,
      });
    });

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      gsapCtx.revert();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={props.className ?? "absolute inset-0 h-full w-full"}
      aria-hidden="true"
    />
  );
}
