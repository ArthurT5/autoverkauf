import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { chf, chfValue } from "@/lib/format";
import { OFFER_POOL } from "@/components/hero/shared";

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface HowMaxDict {
  kicker: string;
  acts: { t: string; b: string }[]; // 3
  reqLabel: string;
  reqModel: string;
  rows: [string, string][];
  offersLabel: string;
  responding: string;
  best: string;
  match: string;
  logs: string[]; // 4
}

const OFFERS = [...OFFER_POOL].sort((a, b) => b.match - a.match);
const BEST_ID = OFFERS[0].id;

/* ─────────────────────────────────────────────────────────────────────────────
   VARIANT 1 — "Kinetic Dossier". Maximal pinned scroll-film (~5 screens):
   · multi-layer parallax (grid / red glow / giant ghost act numbers)
   · char-level SplitText choreography in AND out for every act heading
   · the dossier panel tilts in 3D and assembles — field values TYPE themselves
   · offers fly in with blur + rotation, dealer names SCRAMBLE-resolve,
     prices count up live, match bars fill, the responding counter ticks
   · finale: losers collapse away, the winner ignites red with a light sweep
   No-JS / reduced-motion: everything renders static, visible, readable.
   ──────────────────────────────────────────────────────────────────────────── */
export default function HowKinetic({ dict }: { dict: HowMaxDict }) {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useIso(() => {
    const ctx = gsap.context((self) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = self.selector!;

      // JS-only stage lock (static fallback flows at natural height)
      gsap.set(pin.current, { height: "100svh", paddingTop: 0, paddingBottom: 0, overflow: "hidden" });

      const acts = q<HTMLDivElement>(".hk-act");
      const ghosts = q<HTMLElement>(".hk-ghost");
      const grid = q<HTMLElement>(".hk-grid");
      const glow = q<HTMLElement>(".hk-glow");
      const panelWrap = q<HTMLElement>(".hk-panelwrap")[0];
      const drift = q<HTMLElement>(".hk-drift")[0];
      const panel = q<HTMLElement>(".hk-panel")[0];
      const fieldVals = q<HTMLElement>(".hk-fieldval");
      const fieldRows = q<HTMLElement>(".hk-fieldrow");
      const offers = q<HTMLElement>(".hk-offer");
      const names = q<HTMLElement>(".hk-name");
      const prices = q<HTMLElement>(".hk-price");
      const bars = q<HTMLElement>(".hk-bar");
      const respond = q<HTMLElement>(".hk-respond")[0];
      const nonBest = q<HTMLElement>(".hk-offer:not([data-best])");
      const bestEl = q<HTMLElement>("[data-best]")[0];
      const sel = q<HTMLElement>(".hk-sel");
      const sweep = q<HTMLElement>(".hk-sweep")[0];
      const offersBlock = q<HTMLElement>(".hk-offers")[0];

      // char-level splits for titles, word-level for captions
      const charSets = acts.map((a) => {
        const t = a.querySelector<HTMLElement>(".hk-title");
        return t ? new SplitText(t, { type: "chars,words", charsClass: "hk-char" }).chars : [];
      });
      const caps = acts.map((a) => a.querySelector<HTMLElement>(".hk-cap")).filter(Boolean) as HTMLElement[];
      const nums = acts.map((a) => a.querySelector<HTMLElement>(".hk-num")).filter(Boolean) as HTMLElement[];

      // remember typed targets, then blank them (typing is scroll-driven)
      const typed = fieldVals.map((el) => el.textContent ?? "");
      fieldVals.forEach((el) => (el.textContent = ""));

      // number proxies
      const priceStart = OFFERS.map((o) => o.price - 2600);
      const priceProxy = OFFERS.map((o, i) => ({ v: priceStart[i] }));
      prices.forEach((el, i) => (el.textContent = chf(priceStart[i])));
      const respondProxy = { v: 0 };
      if (respond) respond.textContent = "0";

      // ── initial states ──
      gsap.set(acts, { position: "absolute", top: 0, left: 0, width: "100%" });
      gsap.set(acts.slice(1), { autoAlpha: 0 });
      charSets.forEach((set) => gsap.set(set, { yPercent: 120, rotateX: -55, opacity: 0, transformOrigin: "50% 100%" }));
      gsap.set(caps, { opacity: 0, y: 20 });
      gsap.set(nums, { opacity: 0, x: -14 });
      gsap.set(ghosts, { opacity: 0, yPercent: 12 });
      gsap.set(panelWrap, { perspective: 1200 });
      gsap.set(drift, { transformStyle: "preserve-3d" });
      gsap.set(panel, { rotateY: -16, rotateX: 6, y: 90, autoAlpha: 0, transformOrigin: "50% 40%" });
      gsap.set(fieldRows, { opacity: 0, y: 14 });
      gsap.set(offersBlock, { autoAlpha: 0, y: 26 });
      gsap.set(offers, { opacity: 0, x: 130, rotateY: 24, filter: "blur(10px)" });
      gsap.set(bars, { scaleX: 0, transformOrigin: "0% 50%" });
      gsap.set(sel, { opacity: 0, scale: 0 });
      gsap.set(sweep, { xPercent: -120 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "+=520%",
          scrub: 1,
          pin: pin.current,
          anticipatePin: 1,
          onUpdate: (st) => {
            const p = st.progress;
            if (counter.current) counter.current.textContent = p < 0.36 ? "01" : p < 0.7 ? "02" : "03";
            if (bar.current) bar.current.style.transform = `scaleX(${p})`;
          },
        },
      });

      // ── continuous parallax layers — their own scrub triggers so the main
      //    timeline stays purely sequential ──
      const parallax = (target: gsap.TweenTarget, vars: gsap.TweenVars) =>
        gsap.to(target, {
          ...vars,
          ease: "none",
          scrollTrigger: { trigger: section.current, start: "top top", end: "+=520%", scrub: 1 },
        });
      parallax(grid, { yPercent: -8 });
      parallax(glow, { yPercent: 26, xPercent: -12 });
      parallax(drift, { rotateY: 7, rotateX: -2.5 });

      const inTitle = (i: number, at: number | string) =>
        tl
          .to(ghosts[i], { opacity: 1, yPercent: 0, duration: 0.9 }, at)
          .to(nums[i], { opacity: 1, x: 0, duration: 0.4 }, "<0.05")
          .to(charSets[i], { yPercent: 0, rotateX: 0, opacity: 1, stagger: { each: 0.025, from: "start" }, duration: 0.55 }, "<")
          .to(caps[i], { opacity: 1, y: 0, duration: 0.45 }, "<0.25");

      const outAct = (i: number) =>
        tl
          .to(charSets[i], { yPercent: -110, rotateX: 40, opacity: 0, stagger: { each: 0.014, from: "end" }, duration: 0.4 }, ">")
          .to([caps[i], nums[i]], { opacity: 0, y: -16, duration: 0.3 }, "<")
          .to(ghosts[i], { opacity: 0, yPercent: -10, duration: 0.5 }, "<")
          .set(acts[i], { autoAlpha: 0 });

      /* ═══ ACT 1 — the dossier assembles ═══ */
      inTitle(0, 0.15);
      tl.to(panel, { autoAlpha: 1, y: 0, rotateY: -7, duration: 0.9 }, 0.5);
      fieldRows.forEach((row, i) => {
        tl.to(row, { opacity: 1, y: 0, duration: 0.3 }, 0.95 + i * 0.42);
        tl.to(fieldVals[i], { text: { value: typed[i] }, duration: 0.38, ease: "none" }, 1.05 + i * 0.42);
      });
      tl.to({}, { duration: 0.9 }); // hold
      outAct(0);

      /* ═══ ACT 2 — dealers compete ═══ */
      tl.set(acts[1], { autoAlpha: 1 });
      inTitle(1, ">");
      tl.to(offersBlock, { autoAlpha: 1, y: 0, duration: 0.5 }, "<0.2");
      tl.to(respondProxy, {
        v: 4, duration: 1.6, ease: "none",
        onUpdate: () => { if (respond) respond.textContent = String(Math.round(respondProxy.v)); },
      }, "<");
      tl.addLabel("offers", "<0.1");
      offers.forEach((card, i) => {
        const at = `offers+=${(i * 0.38).toFixed(2)}`;
        tl.to(card, { opacity: 1, x: 0, rotateY: 0, filter: "blur(0px)", duration: 0.5 }, at)
          .to(names[i], { scrambleText: { text: names[i].dataset.name ?? "", chars: "upperCase", speed: 0.6 }, duration: 0.5 }, `offers+=${(i * 0.38 + 0.06).toFixed(2)}`)
          .to(priceProxy[i], {
            v: OFFERS[i].price, duration: 0.7, ease: "power1.out",
            onUpdate: () => { prices[i].textContent = chf(Math.round(priceProxy[i].v)); },
          }, `offers+=${(i * 0.38 + 0.06).toFixed(2)}`)
          .to(bars[i], { scaleX: OFFERS[i].match / 100, duration: 0.6 }, `offers+=${(i * 0.38 + 0.16).toFixed(2)}`);
      });
      tl.to({}, { duration: 0.9 });
      outAct(1);

      /* ═══ ACT 3 — the lock ═══ */
      tl.set(acts[2], { autoAlpha: 1 });
      inTitle(2, ">");
      tl.to(nonBest, { opacity: 0.16, scale: 0.965, x: -10, filter: "blur(1.5px)", stagger: 0.08, duration: 0.5 }, "<0.15")
        .to(bestEl, { scale: 1.045, borderColor: "rgba(216,30,36,0.65)", backgroundColor: "rgba(216,30,36,0.10)", boxShadow: "0 18px 60px -18px rgba(216,30,36,0.45)", duration: 0.55 }, "<0.1")
        .to(sweep, { xPercent: 120, duration: 0.7, ease: "power2.inOut" }, "<0.1")
        .to(sel, { opacity: 1, scale: 1, duration: 0.45 }, "<0.25")
        .to(panel, { rotateY: 0, rotateX: 0, duration: 1 }, "<");
      tl.to({}, { duration: 1 });

      ScrollTrigger.refresh();
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} className="relative bg-void">
      <div ref={pin} className="grain-dark relative flex flex-col bg-void py-20 text-white lg:py-24">
        {/* ── parallax atmosphere ── */}
        <div
          aria-hidden
          className="hk-grid pointer-events-none absolute inset-[-12%]"
          style={{
            backgroundImage:
              "linear-gradient(to right, oklch(1 0 0 / 0.032) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.032) 1px, transparent 1px)",
            backgroundSize: "clamp(52px, 6vw, 88px) clamp(52px, 6vw, 88px)",
            maskImage: "radial-gradient(115% 105% at 68% 36%, black 28%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(115% 105% at 68% 36%, black 28%, transparent 78%)",
          }}
        />
        <div aria-hidden className="hk-glow pointer-events-none absolute right-[-8%] top-[30%] h-[600px] w-[780px] max-w-[78vw] rounded-full opacity-[0.12] blur-[150px]" style={{ background: "var(--color-red)" }} />

        {/* ── chrome: kicker · counter · progress ── */}
        <div className="relative z-20 mx-auto w-full max-w-[86rem] px-[var(--gutter)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45 [font-family:var(--font-mono)]">
              <span style={{ color: "var(--color-red)" }}>//</span> {dict.kicker}
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/45 [font-family:var(--font-mono)]">
              <span ref={counter} className="text-white/85">01</span> / 03
            </span>
          </div>
          <div className="mt-4 h-px w-full overflow-hidden bg-white/10">
            <span ref={bar} className="block h-full origin-left" style={{ background: "var(--color-red)", transform: "scaleX(0)" }} />
          </div>
        </div>

        {/* ── stage ── */}
        <div className="relative z-10 mx-auto grid w-full max-w-[86rem] flex-1 grid-cols-1 items-center gap-12 px-[var(--gutter)] py-8 lg:grid-cols-[1fr_0.92fr] lg:gap-20">
          {/* acts + ghost numbers */}
          <div className="relative min-h-[16rem]">
            {dict.acts.map((a, i) => (
              <div key={a.t} className="hk-act">
                <span aria-hidden className="hk-ghost pointer-events-none absolute -left-6 -top-24 select-none text-[clamp(11rem,22vw,19rem)] font-semibold leading-none text-white/[0.045] [font-family:var(--font-display)] lg:-top-32">
                  0{i + 1}
                </span>
                <span className="hk-num relative text-[13px] tracking-[0.05em] [font-family:var(--font-mono)]" style={{ color: "var(--color-red)" }}>
                  0{i + 1}
                </span>
                <h3 className="hk-title relative mt-4 text-[clamp(2.3rem,4.6vw,3.9rem)] font-medium leading-[1.02] tracking-[-0.025em] [font-family:var(--font-display)]" style={{ perspective: 600 }}>
                  {a.t}
                </h3>
                <p className="hk-cap relative mt-5 max-w-[26rem] text-[1.05rem] leading-[1.6] text-white/60">{a.b}</p>
              </div>
            ))}
          </div>

          {/* the living dossier */}
          <div className="hk-panelwrap mx-auto w-full max-w-[26.5rem] lg:ml-auto lg:mr-0">
            <div className="hk-drift will-change-transform">
            <div className="hk-panel will-change-transform">
              <div className="rounded-t-[var(--radius-xl)] border border-b-0 border-white/[0.09] p-5" style={{ background: "var(--color-void-2)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-white/40 [font-family:var(--font-mono)]">{dict.reqLabel}</span>
                  <span className="text-[10px] tracking-[0.08em] text-white/30 [font-family:var(--font-mono)]">#AV-8241</span>
                </div>
                <h4 className="mt-3 text-[1.15rem] font-semibold tracking-[-0.02em] text-white">{dict.reqModel}</h4>
                <dl className="mt-3.5 grid grid-cols-2 gap-x-6">
                  {dict.rows.map(([label, value]) => (
                    <div key={label} className="hk-fieldrow flex items-baseline justify-between gap-3 border-t border-white/[0.07] py-2">
                      <dt className="text-[10px] uppercase tracking-[0.08em] text-white/45 [font-family:var(--font-mono)]">{label}</dt>
                      <dd className="hk-fieldval min-h-[1em] text-[12px] text-white/85 [font-family:var(--font-mono)]">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="hk-offers relative overflow-hidden rounded-b-[var(--radius-xl)] border border-white/[0.09] p-3 pt-3.5" style={{ background: "var(--color-void)", boxShadow: "var(--shadow-float)" }}>
                {/* red light sweep for the lock moment */}
                <span aria-hidden className="hk-sweep pointer-events-none absolute inset-y-0 left-0 z-10 w-1/2" style={{ background: "linear-gradient(100deg, transparent, rgba(216,30,36,0.14), transparent)" }} />
                <div className="mb-2.5 flex items-center justify-between px-1.5">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-white/40 [font-family:var(--font-mono)]">{dict.offersLabel}</span>
                  <span className="text-[10px] uppercase tracking-[0.1em] text-white/45 [font-family:var(--font-mono)]">
                    <span className="hk-respond text-white/80">4</span> {dict.responding}
                  </span>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {OFFERS.map((o) => {
                    const isBest = o.id === BEST_ID;
                    return (
                      <li
                        key={o.id}
                        {...(isBest ? { "data-best": "" } : {})}
                        className="hk-offer relative flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2.5 will-change-transform"
                        style={{ borderColor: "oklch(1 0 0 / 0.07)", background: "oklch(1 0 0 / 0.02)" }}
                      >
                        <span className="grid h-8 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-white/10 bg-white/[0.04] text-[11px] font-semibold text-white/75 [font-family:var(--font-mono)]">
                          {o.canton}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="hk-name truncate text-[0.8rem] font-medium text-white/85" data-name={o.dealer}>{o.dealer}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="h-[3px] w-16 overflow-hidden rounded-full bg-white/10">
                              <span className="hk-bar block h-full w-full rounded-full" style={{ background: "var(--color-red)" }} />
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.06em] text-white/45 [font-family:var(--font-mono)]">{o.match}% {dict.match}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="hk-price text-[0.9rem] font-semibold text-white [font-family:var(--font-mono)]">{chf(o.price)}</p>
                          {isBest && (
                            <p className="hk-sel text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--color-red)" }}>{dict.best}</p>
                          )}
                        </div>
                        {isBest && (
                          <span className="hk-sel absolute -right-2 -top-2 z-20 grid h-6 w-6 place-items-center rounded-full text-white" style={{ background: "var(--color-red)", boxShadow: "var(--shadow-red)" }}>
                            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 7.5l2.5 2.5L11 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
