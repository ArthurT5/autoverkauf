import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { TextPlugin } from "gsap/TextPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

// Register once, client-side only. GSAP 3.13+ ships all former Club plugins free.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, TextPlugin, ScrambleTextPlugin, DrawSVGPlugin, MotionPathPlugin);
}

export { gsap, ScrollTrigger, SplitText, TextPlugin, ScrambleTextPlugin, DrawSVGPlugin, MotionPathPlugin };
