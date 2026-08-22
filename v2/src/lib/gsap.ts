// GSAP core + plugins, imported CJS/ESM-interop-safe.
// Default imports never throw under Node's CJS interop (named imports of
// some plugin files do on Node 22 — broke SSR on Vercel); we unwrap the
// namespace when needed. Vite's client build resolves the ESM builds where
// default === the plugin itself.
/* eslint-disable @typescript-eslint/no-explicit-any */
import gsapPkg from "gsap";
import ScrollTriggerPkg from "gsap/ScrollTrigger";
import SplitTextPkg from "gsap/SplitText";
import TextPluginPkg from "gsap/TextPlugin";
import ScrambleTextPluginPkg from "gsap/ScrambleTextPlugin";
import DrawSVGPluginPkg from "gsap/DrawSVGPlugin";
import MotionPathPluginPkg from "gsap/MotionPathPlugin";

const unwrap = <T,>(mod: unknown, key: string): T =>
  ((mod as any)?.[key] ?? mod) as T;

export const gsap = unwrap<typeof import("gsap").gsap>(gsapPkg, "gsap");
export const ScrollTrigger = unwrap<any>(ScrollTriggerPkg, "ScrollTrigger");
export const SplitText = unwrap<any>(SplitTextPkg, "SplitText");
export const TextPlugin = unwrap<any>(TextPluginPkg, "TextPlugin");
export const ScrambleTextPlugin = unwrap<any>(ScrambleTextPluginPkg, "ScrambleTextPlugin");
export const DrawSVGPlugin = unwrap<any>(DrawSVGPluginPkg, "DrawSVGPlugin");
export const MotionPathPlugin = unwrap<any>(MotionPathPluginPkg, "MotionPathPlugin");

// Register once, client-side only. GSAP 3.13+ ships all former Club plugins free.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, TextPlugin, ScrambleTextPlugin, DrawSVGPlugin, MotionPathPlugin);
}
