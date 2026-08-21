import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { chf } from "@/lib/format";
import { OFFER_POOL } from "@/components/hero/shared";

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface StoryDict {
  kicker: string;
  scenes: { t: string; b: string }[]; // 5
  best: string;
  model: string;
  specs: string[]; // 4 short spec values for the blueprint tags
}

const OFFERS = [...OFFER_POOL].sort((a, b) => b.match - a.match); // a,b,c,d best-first
const BEST_ID = OFFERS[0].id;

// 8 dealer nodes on a ring around the stage (% of world, centred via translate)
const NODES: { code: string; x: number; y: number }[] = [
  { code: "BS", x: 50, y: 4 },
  { code: "ZH", x: 82, y: 14 },
  { code: "SG", x: 95, y: 50 },
  { code: "GR", x: 82, y: 86 },
  { code: "TI", x: 50, y: 96 },
  { code: "VD", x: 18, y: 86 },
  { code: "BE", x: 5, y: 50 },
  { code: "AG", x: 18, y: 14 },
];
// which ring node each offer card launches from (index into NODES)
const LAUNCH: Record<string, number> = { a: 1, b: 6, c: 3, d: 5 };
// fan pose (a hand of cards) + column rows, per offer id
const FAN: Record<string, { x: number; y: number; r: number }> = {
  c: { x: -132, y: 16, r: -9 },
  a: { x: -44, y: 2, r: -3 },
  d: { x: 44, y: 2, r: 3 },
  b: { x: 132, y: 16, r: 9 },
};
const ARRIVE_Y: Record<string, number> = { c: -93, a: -31, d: 31, b: 93 }; // column, arrival order
const SORTED_Y: Record<string, number> = { a: -93, b: -31, c: 31, d: 93 }; // column, ranked

/* ─────────────────────────────────────────────────────────────────────────────
   "The journey of your request" — Maglr-style scrollytelling. One protagonist
   (your request) travels through five scenes on a pinned stage:

   1 · Describe   — the car draws itself as a Swiss technical blueprint,
                    spec tags stamp on
   2 · It travels — the blueprint packs into a request chip; a ring of dealers
                    appears; the request pulses OUT along drawn routes
   3 · Offers     — offer cards fly BACK along the routes, landing as a hand
                    of cards (3D fan)
   4 · Compete    — the fan straightens into a ranking; prices count, match
                    bars race, the list live-SORTS itself
   5 · You choose — a red frame draws around the winner; the rest step back

   All GSAP: DrawSVG (blueprint + routes), MotionPath (flights), SplitText.
   No-JS / reduced-motion: a static, readable composition (title, blueprint,
   ranked offers with the winner framed). Scenes 2–3 chrome stays hidden.
   ──────────────────────────────────────────────────────────────────────────── */
export default function HowStory({ dict }: { dict: StoryDict }) {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const dot = useRef<HTMLSpanElement>(null);

  useIso(() => {
    const ctx = gsap.context((self) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = self.selector!;

      gsap.set(pin.current, { height: "100svh", paddingTop: 0, paddingBottom: 0, overflow: "hidden" });

      const world = q<HTMLElement>(".hs-world")[0];
      const slides = q<HTMLElement>(".hs-slide");
      const carwrap = q<HTMLElement>(".hs-carwrap")[0];
      const draws = q<SVGGeometryElement>(".hs-draw");
      const tags = q<HTMLElement>(".hs-tag4");
      const chip = q<HTMLElement>(".hs-chip")[0];
      const net = q<SVGSVGElement>(".hs-net")[0];
      const nodes = q<HTMLElement>(".hs-node");
      const pulses = q<HTMLElement>(".hs-pulse");
      const cardsWrap = q<HTMLElement>(".hs-cards")[0];
      const cards = q<HTMLElement>(".hs-card");
      const cprices = q<HTMLElement>(".hs-cprice");
      const cbars = q<HTMLElement>(".hs-cbar");
      const cpcts = q<HTMLElement>(".hs-cpct");
      const ccompare = q<HTMLElement>(".hs-ccompare");
      const frame = q<SVGGeometryElement>(".hs-frame rect")[0];
      const disc = q<HTMLElement>(".hs-disc")[0];
      const btag = q<HTMLElement>(".hs-btag")[0];

      /* ── convert the static flow into the staged world ── */
      gsap.set(world, { height: "clamp(330px, 48vh, 460px)" });
      gsap.set(carwrap, { position: "absolute", left: "50%", top: "50%", xPercent: -50, yPercent: -50, width: "min(560px, 82%)" });
      gsap.set(cardsWrap, { position: "absolute", left: 0, top: 0, width: "100%", height: "100%", maxWidth: "none", margin: 0 });
      gsap.set(cards, { position: "absolute", left: "50%", top: "50%", xPercent: -50, yPercent: -50 });
      gsap.set([net, ...nodes, ...pulses, chip], { display: "block" });

      /* ── measure ring-node offsets from world centre (for flights) ── */
      const wr = world.getBoundingClientRect();
      const cx = wr.left + wr.width / 2;
      const cy = wr.top + wr.height / 2;
      const off = nodes.map((n) => {
        const r = n.getBoundingClientRect();
        return { x: r.left + r.width / 2 - cx, y: r.top + r.height / 2 - cy };
      });

      // routes: curved svg paths centre → node (drawn with DrawSVG)
      const NS = "http://www.w3.org/2000/svg";
      const routePaths: SVGPathElement[] = off.map((o) => {
        const p = document.createElementNS(NS, "path");
        const midX = o.x * 0.5 - o.y * 0.12;
        const midY = o.y * 0.5 + o.x * 0.12;
        p.setAttribute("d", `M ${wr.width / 2} ${wr.height / 2} q ${midX} ${midY} ${o.x} ${o.y}`);
        p.setAttribute("fill", "none");
        p.setAttribute("stroke", "oklch(0.835 0.006 27)");
        p.setAttribute("stroke-width", "1");
        net.appendChild(p);
        return p;
      });
      const curveTo = (o: { x: number; y: number }, back = false) => ({
        path: back
          ? [{ x: o.x, y: o.y }, { x: o.x * 0.5 - o.y * 0.12, y: o.y * 0.5 + o.x * 0.12 }, { x: 0, y: 0 }]
          : [{ x: 0, y: 0 }, { x: o.x * 0.5 - o.y * 0.12, y: o.y * 0.5 + o.x * 0.12 }, { x: o.x, y: o.y }],
        curviness: 1.1,
      });

      /* ── initial states ── */
      gsap.set(slides, { display: "block", position: "absolute", top: 0, left: 0, width: "100%", autoAlpha: 0, y: 14 });
      const splits = slides.map((s) => {
        const t = s.querySelector(".hs-title");
        return t ? new SplitText(t as HTMLElement, { type: "lines", mask: "lines" }).lines : [];
      });
      gsap.set(draws, { drawSVG: "0%" });
      gsap.set(tags, { autoAlpha: 0, scale: 0.8 });
      gsap.set(chip, { autoAlpha: 0, scale: 0.55 });
      gsap.set(nodes, { autoAlpha: 0, scale: 0 });
      gsap.set(routePaths, { drawSVG: "0%" });
      gsap.set(pulses, { autoAlpha: 0, xPercent: -50, yPercent: -50 });
      gsap.set(cards, { autoAlpha: 0, scale: 0.5, rotation: (i) => [-14, 10, -8, 12][i] });
      gsap.set(ccompare, { autoAlpha: 0 });
      gsap.set(cprices, { autoAlpha: 0 });
      gsap.set(cbars, { scaleX: 0, transformOrigin: "0% 50%" });
      if (frame) gsap.set(frame, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set([disc, btag], { autoAlpha: 0, scale: 0.6 });

      const priceProxy = OFFERS.map((o) => ({ v: o.price - 1500 }));
      const pctProxy = OFFERS.map(() => ({ v: 0 }));

      // scene start fractions, filled from labels once the timeline is built
      let sceneFracs: number[] = [0, 0.2, 0.4, 0.6, 0.8];

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "+=560%",
          scrub: 1,
          pin: pin.current,
          anticipatePin: 1,
          onUpdate: (st) => {
            const p = st.progress;
            if (dot.current) dot.current.style.left = `${p * 100}%`;
            if (counter.current) {
              let i = 0;
              for (let k = sceneFracs.length - 1; k >= 0; k--) if (p >= sceneFracs[k]) { i = k; break; }
              counter.current.textContent = `0${i + 1}`;
            }
          },
        },
      });

      const slideIn = (i: number, at: string | number) => {
        tl.addLabel(`sc${i}`, at);
        if (i > 0) tl.to(slides[i - 1], { autoAlpha: 0, y: -12, duration: 0.22 }, `sc${i}`);
        tl.fromTo(slides[i], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.28 }, i > 0 ? "<0.1" : `sc${i}`);
        tl.fromTo(splits[i], { yPercent: 115 }, { yPercent: 0, duration: 0.5, stagger: 0.08 }, "<");
      };

      /* ═══ SCENE 1 · the blueprint draws itself ═══ */
      slideIn(0, 0.05);
      tl.to(draws, { drawSVG: "100%", duration: 1.0, stagger: 0.07, ease: "power1.inOut" }, "<0.2");
      tl.to(tags, { autoAlpha: 1, scale: 1, duration: 0.3, stagger: 0.1 }, ">-0.3");
      tl.to({}, { duration: 0.45 });

      /* ═══ SCENE 2 · it packs up and travels out ═══ */
      slideIn(1, ">");
      tl.to([carwrap], { scale: 0.24, autoAlpha: 0, duration: 0.6, ease: "power2.inOut" }, "<0.1")
        .to(chip, { autoAlpha: 1, scale: 1, duration: 0.45 }, ">-0.25")
        .to(nodes, { autoAlpha: 1, scale: 1, duration: 0.35, stagger: 0.05 }, ">-0.1")
        .to(routePaths, { drawSVG: "100%", duration: 0.7, stagger: 0.06, ease: "power1.inOut" }, "<0.1");
      pulses.forEach((p, i) => {
        tl.fromTo(p, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08 }, `<${i === 0 ? 0.25 : 0.07}`)
          .to(p, { motionPath: curveTo(off[i]), duration: 0.55, ease: "power1.in" }, "<")
          .to(p, { autoAlpha: 0, duration: 0.08 }, ">-0.05")
          .to(nodes[i], { scale: 1.25, duration: 0.12, yoyo: true, repeat: 1 }, "<");
      });
      tl.to({}, { duration: 0.6 });

      /* ═══ SCENE 3 · offers fly back — a hand of cards ═══ */
      slideIn(2, ">");
      tl.to([...routePaths], { opacity: 0.3, duration: 0.4 }, "<")
        .to(chip, { autoAlpha: 0, scale: 0.7, duration: 0.4 }, "<");
      OFFERS.forEach((o, i) => {
        const from = off[LAUNCH[o.id]];
        const fan = FAN[o.id];
        tl.fromTo(
          cards[i],
          { x: from.x, y: from.y },
          { motionPath: curveTo(from, true), autoAlpha: 1, scale: 1, duration: 0.6, ease: "power2.inOut" },
          `<${i === 0 ? 0.2 : 0.16}`
        ).to(cards[i], { x: fan.x, y: fan.y, rotation: fan.r, duration: 0.45, ease: "power2.out" }, ">-0.1");
      });
      tl.to({}, { duration: 0.6 });

      /* ═══ SCENE 4 · the ranking — count, race, live-sort ═══ */
      slideIn(3, ">");
      tl.to([...nodes, net], { autoAlpha: 0, duration: 0.4 }, "<");
      OFFERS.forEach((o, i) => {
        tl.to(cards[i], { x: 0, y: ARRIVE_Y[o.id], rotation: 0, duration: 0.5, ease: "power2.inOut" }, `<${i === 0 ? 0.15 : 0.06}`);
      });
      tl.to(ccompare, { autoAlpha: 1, duration: 0.3, stagger: 0.06 }, ">-0.1")
        .to(cprices, { autoAlpha: 1, duration: 0.3, stagger: 0.06 }, "<");
      OFFERS.forEach((o, i) => {
        tl.to(priceProxy[i], {
          v: o.price, duration: 0.55, ease: "power1.out",
          onUpdate: () => { cprices[i].textContent = chf(Math.round(priceProxy[i].v)); },
        }, `<${i === 0 ? 0.1 : 0.05}`)
          .to(cbars[i], { scaleX: o.match / 100, duration: 0.5, ease: "power2.inOut" }, "<")
          .to(pctProxy[i], {
            v: o.match, duration: 0.5, ease: "power2.inOut",
            onUpdate: () => { cpcts[i].textContent = `${Math.round(pctProxy[i].v)}%`; },
          }, "<");
      });
      // the live sort — competition resolves into a ranking
      OFFERS.forEach((o, i) => {
        tl.to(cards[i], { y: SORTED_Y[o.id], duration: 0.55, ease: "power2.inOut" }, i === 0 ? ">0.25" : "<");
      });
      tl.to({}, { duration: 0.5 });

      /* ═══ SCENE 5 · you choose ═══ */
      slideIn(4, ">");
      tl.to(cards.filter((_, i) => OFFERS[i].id !== BEST_ID), { autoAlpha: 0.35, scale: 0.985, duration: 0.45 }, "<0.15")
        .to(cards[0], { scale: 1.05, duration: 0.5, ease: "power2.inOut" }, "<");
      if (frame) tl.to(frame, { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" }, "<0.15");
      tl.to(disc, { autoAlpha: 1, scale: 1, duration: 0.35 }, ">-0.1")
        .to(btag, { autoAlpha: 1, scale: 1, duration: 0.35 }, "<0.1")
        .to(cprices[0], { color: "oklch(0.552 0.221 29)", duration: 0.35 }, "<");
      tl.to({}, { duration: 0.8 });

      // real scene boundaries for the counter, from the labels
      const dur = tl.duration();
      sceneFracs = [0, 1, 2, 3, 4].map((i) => (tl.labels[`sc${i}`] ?? 0) / dur);

      ScrollTrigger.refresh();
    }, section);
    return () => ctx.revert();
  }, []);

  const TAG_POS = ["left-[2%] top-[6%]", "right-[2%] top-[8%]", "left-[4%] bottom-[8%]", "right-[3%] bottom-[10%]"];
  const specTags = dict.specs.map((label, i) => ({ label, pos: TAG_POS[i] ?? TAG_POS[0] }));

  return (
    <section ref={section} id="how-it-works" data-nav="light" className="relative scroll-mt-20 bg-paper-2">
      <div ref={pin} className="grain relative flex flex-col bg-paper-2 py-16 text-ink lg:py-20">
        {/* chrome: kicker · counter · tick ruler */}
        <div className="relative z-20 mx-auto w-full max-w-[82rem] px-[var(--gutter)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-500 [font-family:var(--font-mono)]">
              <span style={{ color: "var(--color-red)" }}>//</span> {dict.kicker}
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-ink-400 [font-family:var(--font-mono)]">
              <span ref={counter} className="text-ink-900">01</span> / 05
            </span>
          </div>
          <div className="relative mt-4">
            <div
              className="h-2.5 w-full"
              style={{
                backgroundImage: "repeating-linear-gradient(to right, var(--color-line-2) 0 1px, transparent 1px 10px)",
                maskImage: "linear-gradient(to bottom, black 55%, transparent)",
                WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent)",
              }}
              aria-hidden
            />
            <span ref={dot} className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: "0%", background: "var(--color-red)" }} aria-hidden />
          </div>
        </div>

        {/* the story */}
        <div className="relative z-10 mx-auto flex w-full max-w-[82rem] flex-1 flex-col justify-center px-[var(--gutter)] pt-6">
          {/* scene words */}
          <div className="hs-slides relative mx-auto min-h-[7.5rem] w-full max-w-[46rem] text-center">
            {dict.scenes.map((s) => (
              <div key={s.t} className="hs-slide">
                <h3 className="hs-title text-[clamp(1.9rem,3.6vw,3rem)] font-medium leading-[1.04] tracking-[-0.02em] text-ink-900 [font-family:var(--font-display)]">
                  {s.t}
                </h3>
                <p className="mx-auto mt-3 max-w-[30rem] text-[0.975rem] leading-[1.55] text-ink-500">{s.b}</p>
              </div>
            ))}
          </div>

          {/* the world */}
          <div className="hs-world relative mx-auto mt-4 w-full max-w-[64rem]">
            {/* routes (populated by JS) */}
            <svg className="hs-net absolute inset-0 hidden h-full w-full" aria-hidden />

            {/* dealer ring */}
            {NODES.map((n) => (
              <span
                key={n.code}
                className="hs-node absolute hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-line bg-white px-2.5 py-1 text-[10px] font-semibold text-ink-700 [font-family:var(--font-mono)]"
                style={{ left: `${n.x}%`, top: `${n.y}%`, boxShadow: "var(--shadow-card)" }}
              >
                {n.code}
              </span>
            ))}

            {/* request pulses */}
            {NODES.map((n) => (
              <span key={`p-${n.code}`} className="hs-pulse absolute left-1/2 top-1/2 hidden h-2 w-2 rounded-full" style={{ background: "var(--color-red)" }} aria-hidden />
            ))}

            {/* the blueprint */}
            <div className="hs-carwrap relative mx-auto w-full max-w-[560px]">
              <svg viewBox="0 0 600 260" fill="none" className="w-full" aria-hidden>
                <g stroke="oklch(0.255 0.012 27)" strokeWidth="2" strokeLinecap="round">
                  <path className="hs-draw" d="M 62 192 C 60 172 64 152 84 146 L 102 141 C 158 130 216 125 266 122 C 280 112 292 99 306 88 C 318 78 336 74 358 74 L 448 74 C 468 74 484 84 490 102 L 498 148 C 503 174 500 186 488 192 L 452 194" />
                  <path className="hs-draw" d="M 62 192 L 116 195 M 204 196 L 396 196" />
                  <path className="hs-draw" opacity="0.55" d="M 308 90 C 318 84 330 81 346 81 L 440 81" />
                  <path className="hs-draw" opacity="0.45" d="M 334 122 L 334 192" />
                  <circle className="hs-draw" cx="160" cy="196" r="30" />
                  <circle className="hs-draw" cx="440" cy="196" r="30" />
                  <circle className="hs-draw" opacity="0.5" cx="160" cy="196" r="11" />
                  <circle className="hs-draw" opacity="0.5" cx="440" cy="196" r="11" />
                </g>
                <path className="hs-draw" d="M 30 236 L 570 236" stroke="oklch(0.835 0.006 27)" strokeWidth="1.5" />
              </svg>
              {specTags.map((t2) => (
                <span
                  key={t2.label}
                  className={`hs-tag4 absolute ${t2.pos} rounded-full border border-line bg-white px-2.5 py-1 text-[10px] text-ink-700 [font-family:var(--font-mono)]`}
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <span className="mr-1 inline-block h-1 w-1 rounded-full align-middle" style={{ background: "var(--color-red)" }} />
                  {t2.label}
                </span>
              ))}
            </div>

            {/* the request chip (scene 2) */}
            <div
              className="hs-chip absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-md)] border border-line bg-white px-4 py-2.5 text-center"
              style={{ boxShadow: "var(--shadow-float)" }}
            >
              <p className="text-[10px] uppercase tracking-[0.14em] text-ink-400 [font-family:var(--font-mono)]">#AV-8241</p>
              <p className="mt-0.5 whitespace-nowrap text-[0.9rem] font-semibold text-ink-900">{dict.model}</p>
            </div>

            {/* the offers (scenes 3–5) */}
            <div className="hs-cards relative mx-auto mt-6 flex w-full max-w-[380px] flex-col gap-2">
              {OFFERS.map((o) => {
                const isBest = o.id === BEST_ID;
                return (
                  <div
                    key={o.id}
                    className="hs-card relative flex w-[340px] max-w-full items-center gap-2.5 rounded-[var(--radius-md)] border border-line bg-white px-3 py-2.5 will-change-transform sm:w-[360px]"
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    <span className="grid h-7 w-8 shrink-0 place-items-center rounded-[4px] border border-line bg-paper text-[10px] font-semibold text-ink-700 [font-family:var(--font-mono)]">
                      {o.canton}
                    </span>
                    <p className="min-w-0 flex-1 truncate text-[0.8rem] font-medium text-ink-900">{o.dealer}</p>
                    <span className="hs-ccompare flex shrink-0 items-center gap-1.5">
                      <span className="h-[3px] w-12 overflow-hidden rounded-full bg-line">
                        <span className="hs-cbar block h-full rounded-full" style={{ width: `${o.match}%`, background: "var(--color-red)" }} />
                      </span>
                      <span className="hs-cpct w-7 text-right text-[10px] text-ink-500 [font-family:var(--font-mono)]">{o.match}%</span>
                    </span>
                    <p className="hs-cprice w-[5.6rem] shrink-0 text-right text-[0.82rem] font-semibold text-ink-900 [font-family:var(--font-mono)]">
                      {chf(o.price)}
                    </p>

                    {isBest && (
                      <>
                        <svg className="hs-frame pointer-events-none absolute inset-[-5px]" width="100%" height="100%" aria-hidden>
                          <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="10" fill="none" stroke="var(--color-red)" strokeWidth="1.5" pathLength={1} />
                        </svg>
                        <span className="hs-disc absolute -right-2 -top-2 z-10 grid h-6 w-6 place-items-center rounded-full text-white" style={{ background: "var(--color-red)", boxShadow: "var(--shadow-red)" }}>
                          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 7.5l2.5 2.5L11 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </span>
                        <span className="hs-btag absolute -top-2.5 left-3 z-10 rounded-[3px] px-1.5 py-[2px] text-[9px] font-semibold uppercase tracking-[0.12em] text-white [font-family:var(--font-mono)]" style={{ background: "var(--color-red)" }}>
                          {dict.best}
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* no-JS: only the first scene's words show */}
        <style>{`.hs-slide:not(:first-child){display:none}`}</style>
      </div>
    </section>
  );
}
