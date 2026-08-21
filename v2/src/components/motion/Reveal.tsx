import { useEffect } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";

/* Sondaven-style page-wide reveal system. Drop <Reveal client:load /> once per
   page; it animates any element carrying a data-reveal attribute:
     data-reveal="h"     heading — SplitText lines rise (masked)
     data-reveal="up"    fade + rise (batched so neighbours stagger)
     data-reveal="line"  divider — scaleX 0→1
   Content is visible by default (no-JS / reduced-motion safe); JS hides then
   reveals on scroll. */
export default function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const run = () => {
      const ctx = gsap.context(() => {
        // headings
        gsap.utils.toArray<HTMLElement>('[data-reveal="h"]').forEach((el) => {
          const split = new SplitText(el, { type: "lines", mask: "lines" });
          gsap.from(split.lines, {
            yPercent: 115,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: { trigger: el, start: "top 86%" },
          });
        });

        // fade + rise, batched for neighbourly stagger
        const ups = gsap.utils.toArray<HTMLElement>('[data-reveal="up"]');
        gsap.set(ups, { opacity: 0, y: 24 });
        ScrollTrigger.batch(ups, {
          start: "top 88%",
          onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.09 }),
        });

        // dividers
        gsap.utils.toArray<HTMLElement>('[data-reveal="line"]').forEach((el) => {
          gsap.from(el, {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 0.9,
            ease: "power2.inOut",
            scrollTrigger: { trigger: el, start: "top 90%" },
          });
        });

        ScrollTrigger.refresh();
      });
      return ctx;
    };

    const ctx = document.fonts?.ready ? undefined : run();
    let ready: gsap.Context | undefined = ctx;
    if (!ctx && document.fonts?.ready) document.fonts.ready.then(() => { ready = run(); });
    return () => ready?.revert();
  }, []);

  return null;
}
