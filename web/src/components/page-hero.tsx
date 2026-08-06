import { HalftoneCanvas } from "@/components/motion/halftone-canvas";
import { RevealHeading } from "@/components/motion/reveal-heading";
import { Eyebrow } from "@/components/motion/eyebrow";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  sub?: string;
  /** shifts the halftone ridge so each page gets its own skyline */
  phase?: number;
};

/** Dark halftone title band for inner pages — carries the site language and
 *  gives the fixed nav a dark section to read at the top of the page. */
export function PageHero({ eyebrow, title, sub, phase = 0 }: PageHeroProps) {
  return (
    <section
      data-nav-theme="dark"
      className="grain-dark relative overflow-hidden bg-[oklch(0.068_0.008_27)] pb-20 pt-36 lg:pb-24 lg:pt-44"
    >
      <HalftoneCanvas inkAlpha={0.5} farBase={0.74} nearBase={0.9} phase={phase} />
      <div className="relative z-10 mx-auto max-w-4xl px-6 lg:px-8">
        {eyebrow && <Eyebrow className="text-white/40">{eyebrow}</Eyebrow>}
        <RevealHeading
          as="h1"
          className="text-[clamp(2.2rem,4.5vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-white"
          style={{ textWrap: "balance" }}
        >
          {title}
        </RevealHeading>
        {sub && (
          <p className="mt-5 max-w-xl text-[1.075rem] leading-relaxed text-white/50">
            {sub}
          </p>
        )}
      </div>
    </section>
  );
}
