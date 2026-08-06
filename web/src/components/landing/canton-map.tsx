"use client";

import { useState, useRef, useLayoutEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { RevealHeading } from "@/components/motion/reveal-heading";
import { Eyebrow } from "@/components/motion/eyebrow";

// ── Canton data ───────────────────────────────────────────────────────────────
// dealers = approximate number of car dealerships in this canton (market data)
// d = simplified SVG path (viewBox 0 0 960 660)
// lx/ly = label anchor for the canton abbreviation

type Canton = {
  id: string;
  name: string;
  dealers: number;
  d: string;
  lx: number;
  ly: number;
};

const CANTONS: Canton[] = [
  {
    id: "SH", name: "Schaffhausen", dealers: 35,
    lx: 468, ly: 52,
    d: "M432,32 L502,28 L518,52 L510,75 L472,80 L438,78 L425,55 Z",
  },
  {
    id: "JU", name: "Jura", dealers: 30,
    lx: 162, ly: 140,
    d: "M82,108 L135,80 L178,78 L238,90 L238,172 L178,180 L98,200 L82,148 Z",
  },
  {
    id: "BS", name: "Basel-Stadt", dealers: 62,
    lx: 272, ly: 72,
    d: "M252,56 L282,52 L298,72 L288,92 L260,95 L248,75 Z",
  },
  {
    id: "BL", name: "Basel-Landschaft", dealers: 80,
    lx: 262, ly: 128,
    d: "M185,75 L252,56 L248,75 L260,95 L288,92 L298,72 L310,102 L322,138 L308,168 L268,180 L238,172 L238,90 L195,85 Z",
  },
  {
    id: "AG", name: "Aargau", dealers: 148,
    lx: 370, ly: 128,
    d: "M298,72 L365,70 L405,82 L432,92 L448,120 L448,155 L428,172 L398,180 L375,172 L350,162 L322,138 L310,102 Z",
  },
  {
    id: "SO", name: "Solothurn", dealers: 78,
    lx: 305, ly: 198,
    d: "M238,172 L268,180 L308,168 L350,162 L375,172 L378,208 L355,222 L312,232 L280,232 L260,220 L242,208 Z",
  },
  {
    id: "TG", name: "Thurgau", dealers: 75,
    lx: 562, ly: 108,
    d: "M510,75 L572,55 L610,60 L628,82 L628,125 L598,145 L565,152 L540,145 L528,120 L510,95 Z",
  },
  {
    id: "ZH", name: "Zürich", dealers: 280,
    lx: 472, ly: 148,
    d: "M420,60 L505,56 L540,80 L562,120 L568,158 L548,195 L525,218 L495,232 L465,238 L432,225 L408,212 L390,182 L392,148 L405,112 L420,82 Z",
  },
  {
    id: "NE", name: "Neuchâtel", dealers: 65,
    lx: 165, ly: 238,
    d: "M98,200 L178,180 L238,172 L242,208 L240,260 L218,278 L172,285 L135,275 L108,252 L95,222 Z",
  },
  {
    id: "SG", name: "St. Gallen", dealers: 122,
    lx: 625, ly: 195,
    d: "M598,145 L628,125 L628,82 L662,78 L695,92 L720,118 L720,170 L698,218 L662,262 L625,285 L592,272 L562,242 L548,210 L565,152 Z",
  },
  {
    id: "GL", name: "Glarus", dealers: 22,
    lx: 532, ly: 285,
    d: "M548,210 L562,242 L555,278 L558,325 L535,350 L515,335 L520,285 L525,250 Z",
  },
  {
    id: "ZG", name: "Zug", dealers: 40,
    lx: 435, ly: 225,
    d: "M412,208 L438,202 L455,218 L450,242 L428,248 L408,232 Z",
  },
  {
    id: "SZ", name: "Schwyz", dealers: 50,
    lx: 488, ly: 258,
    d: "M438,225 L465,238 L495,232 L525,218 L548,210 L525,250 L520,285 L505,295 L485,285 L462,252 L445,242 L412,232 L408,212 L432,225 Z",
  },
  {
    id: "FR", name: "Fribourg", dealers: 85,
    lx: 235, ly: 325,
    d: "M172,285 L218,278 L240,260 L278,282 L296,348 L270,370 L248,360 L228,342 L215,318 L178,308 Z",
  },
  {
    id: "LU", name: "Luzern", dealers: 98,
    lx: 315, ly: 268,
    d: "M260,220 L280,232 L312,232 L355,222 L378,208 L388,230 L378,265 L358,298 L328,308 L298,302 L265,248 Z",
  },
  {
    id: "OW", name: "Obwalden", dealers: 15,
    lx: 355, ly: 332,
    d: "M340,298 L368,288 L388,302 L392,338 L372,362 L348,368 L328,352 L322,328 L328,308 Z",
  },
  {
    id: "NW", name: "Nidwalden", dealers: 22,
    lx: 418, ly: 352,
    d: "M392,338 L415,318 L438,332 L445,358 L428,382 L402,385 L382,370 L372,352 L385,338 Z",
  },
  {
    id: "UR", name: "Uri", dealers: 15,
    lx: 455, ly: 348,
    d: "M445,242 L462,252 L485,285 L505,295 L515,338 L508,388 L492,412 L468,428 L448,412 L435,382 L438,332 L415,318 L392,338 L388,302 L368,288 L368,262 L388,250 L412,242 Z",
  },
  {
    id: "BE", name: "Bern", dealers: 218,
    lx: 255, ly: 305,
    d: "M240,260 L242,208 L260,220 L280,232 L355,222 L378,208 L390,232 L378,268 L358,298 L340,298 L322,332 L320,360 L340,378 L348,420 L302,415 L248,412 L195,415 L148,422 L148,390 L168,368 L178,340 L178,308 L172,285 L218,278 Z",
  },
  {
    id: "VD", name: "Vaud", dealers: 175,
    lx: 172, ly: 318,
    d: "M82,230 L95,222 L108,252 L135,275 L172,285 L178,308 L178,340 L168,368 L148,388 L142,415 L148,422 L130,408 L108,418 L90,418 L82,408 L75,292 Z",
  },
  {
    id: "GE", name: "Genève", dealers: 128,
    lx: 88, ly: 494,
    d: "M58,478 L108,468 L122,492 L108,520 L75,525 L52,512 L58,480 Z",
  },
  {
    id: "GR", name: "Graubünden", dealers: 60,
    lx: 688, ly: 358,
    d: "M562,242 L592,272 L625,285 L662,262 L698,218 L742,242 L782,268 L828,305 L840,352 L822,402 L780,425 L735,452 L690,462 L645,448 L602,422 L565,388 L542,352 L535,350 L558,325 L555,278 Z",
  },
  {
    id: "VS", name: "Valais", dealers: 88,
    lx: 332, ly: 458,
    d: "M148,422 L195,415 L248,412 L302,415 L355,415 L405,415 L448,430 L448,455 L435,490 L392,520 L348,512 L302,518 L252,512 L208,508 L168,492 L142,470 L142,442 Z",
  },
  {
    id: "TI", name: "Ticino", dealers: 85,
    lx: 558, ly: 492,
    d: "M448,430 L505,400 L542,352 L565,388 L602,422 L645,448 L660,488 L632,552 L588,575 L542,552 L505,518 L468,485 L448,455 Z",
  },
  // Render AR/AI last so they appear on top of SG
  {
    id: "AR", name: "Appenzell A.Rh.", dealers: 25,
    lx: 638, ly: 192,
    d: "M615,155 L652,150 L668,170 L660,208 L635,220 L608,210 L598,192 Z",
  },
  {
    id: "AI", name: "Appenzell I.Rh.", dealers: 8,
    lx: 638, ly: 188,
    d: "M625,162 L648,160 L656,180 L645,202 L625,205 L618,188 Z",
  },
];

const MAX_DEALERS = 280;

// Map dealer count to a fill alpha (0.08 = sparse, 0.55 = dense)
function fillAlpha(dealers: number): number {
  return 0.08 + (dealers / MAX_DEALERS) * 0.45;
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

type TooltipProps = {
  canton: Canton;
  x: number;
  y: number;
  svgWidth: number;
  dealersLabel: string;
};

function Tooltip({ canton, x, y, svgWidth, dealersLabel }: TooltipProps) {
  const flipX = x > svgWidth * 0.65;
  return (
    <div
      className="pointer-events-none absolute z-20 rounded-xl border border-[var(--hairline)] bg-white px-3.5 py-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.10)]"
      style={{
        left: flipX ? x - 12 : x + 12,
        top: y - 14,
        transform: flipX ? "translateX(-100%)" : undefined,
        whiteSpace: "nowrap",
      }}
    >
      <p className="text-[13px] font-semibold leading-tight text-[var(--ink-900)]">
        {canton.name}
      </p>
      <p className="mt-0.5 text-[11px] tabular-nums text-[var(--ink-500)]">
        {canton.dealers.toLocaleString()} {dealersLabel}
      </p>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export function CantonMap() {
  const t = useTranslations("coverage");
  const root = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<Canton | null>(null);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0, svgW: 0 });

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const paths = Array.from(el.querySelectorAll<SVGPathElement>(".canton-path"));
      gsap.set(paths, { autoAlpha: 0 });

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 65%",
          onEnter: () => {
            // Stagger by x-centroid so map fills in roughly W→E
            const xOf = new Map(paths.map((p) => [p, p.getBBox().x]));
            const sorted = [...paths].sort((a, b) => xOf.get(a)! - xOf.get(b)!);
            gsap.fromTo(
              sorted,
              { autoAlpha: 0, scale: 0.85, transformOrigin: "50% 50%" },
              {
                autoAlpha: 1, scale: 1,
                duration: 0.45, ease: "power2.out",
                stagger: 0.028,
              }
            );
          },
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(paths, { autoAlpha: 1, scale: 1 });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      svgW: rect.width,
    });
  }, []);

  return (
    <section ref={root} data-nav-theme="light" className="bg-white py-28 lg:py-40">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <Eyebrow className="text-[var(--ink-400)] mx-auto w-fit">{t("eyebrow")}</Eyebrow>
          <RevealHeading
            className="text-[clamp(2.1rem,3.8vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--ink-900)]"
            style={{ textWrap: "balance" }}
            delay={0.05}
          >
            {t("heading")}
          </RevealHeading>
          <p className="mx-auto mt-5 max-w-md text-[1.05rem] leading-relaxed text-[var(--ink-500)]">
            {t("sub")}
          </p>
        </div>

        {/* Map */}
        <div className="relative mx-auto max-w-3xl select-none">
          <svg
            ref={svgRef}
            viewBox="0 0 960 660"
            className="w-full"
            aria-label="Interaktive Karte der Schweizer Kantone"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHovered(null)}
          >
            {CANTONS.map((c) => {
              const isHovered = hovered?.id === c.id;
              return (
                <path
                  key={c.id}
                  className="canton-path cursor-pointer"
                  d={c.d}
                  fill={
                    isHovered
                      ? "oklch(0.55 0.20 27 / 0.18)"
                      : `oklch(0.55 0.20 27 / ${fillAlpha(c.dealers)})`
                  }
                  stroke={isHovered ? "oklch(0.55 0.20 27)" : "white"}
                  strokeWidth={isHovered ? 1.5 : 1.5}
                  strokeLinejoin="round"
                  style={{ transition: "fill 0.12s ease, stroke 0.12s ease" }}
                  onMouseEnter={() => setHovered(c)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}

            {/* Abbreviation labels on non-tiny cantons */}
            {CANTONS.filter(
              (c) => !["AI", "BS", "NW", "OW", "UR", "GL", "SH", "ZG"].includes(c.id)
            ).map((c) => (
              <text
                key={`lbl-${c.id}`}
                x={c.lx}
                y={c.ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className="pointer-events-none"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  fill:
                    hovered?.id === c.id
                      ? "oklch(0.42 0.18 27)"
                      : "oklch(0.42 0.12 27 / 0.6)",
                  fontFamily: "inherit",
                  letterSpacing: "0.04em",
                  transition: "fill 0.12s ease",
                }}
              >
                {c.id}
              </text>
            ))}
          </svg>

          {/* Tooltip */}
          {hovered && (
            <Tooltip
              canton={hovered}
              x={tipPos.x}
              y={tipPos.y}
              svgWidth={tipPos.svgW}
              dealersLabel={t("dealers")}
            />
          )}
        </div>

        {/* Stats */}
        <div className="mt-14 flex flex-wrap justify-center gap-x-16 gap-y-8">
          <div className="text-center">
            <p className="text-[2.5rem] font-bold leading-none tracking-[-0.03em] text-[var(--ink-900)]">
              26
            </p>
            <p className="mt-2 text-[13px] text-[var(--ink-500)]">{t("cantons")}</p>
          </div>
          <div className="text-center">
            <p className="text-[2.5rem] font-bold leading-none tracking-[-0.03em] text-[var(--ink-900)]">
              4
            </p>
            <p className="mt-2 text-[13px] text-[var(--ink-500)]">{t("languages")}</p>
          </div>
          <div className="text-center">
            <p className="text-[2.5rem] font-bold leading-none tracking-[-0.03em] text-[var(--red)]">
              100%
            </p>
            <p className="mt-2 text-[13px] text-[var(--ink-500)]">{t("free")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
