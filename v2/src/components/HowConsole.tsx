import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { chf } from "@/lib/format";
import { OFFER_POOL } from "@/components/hero/shared";
import type { HowMaxDict } from "@/components/HowKinetic.tsx";

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const OFFERS = [...OFFER_POOL].sort((a, b) => b.match - a.match);
const BEST_ID = OFFERS[0].id;

/* ─────────────────────────────────────────────────────────────────────────────
   VARIANT 2 — "Command Center". The reverse market as a live ops console
   (~5 screens, pinned & scrubbed):
   · boot: a scanline sweeps the frame awake, chrome flickers on
   · a timestamped LOG FEED streams the story line by line (typewriter)
   · each phase headline SCRAMBLE-resolves in giant display type
   · the request renders as a terminal readout, values typing in
   · dealer entries materialise in the feed — scramble names, counting prices
   · finale: a targeting reticle SCANS the rows, locks the best, red flash
   No-JS / reduced-motion: static, visible, readable.
   ──────────────────────────────────────────────────────────────────────────── */
export default function HowConsole({ dict }: { dict: HowMaxDict }) {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const phase = useRef<HTMLSpanElement>(null);

  useIso(() => {
    const ctx = gsap.context((self) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = self.selector!;

      gsap.set(pin.current, { height: "100svh", paddingTop: 0, paddingBottom: 0, overflow: "hidden" });

      const frame = q<HTMLElement>(".hc-frame")[0];
      const scan = q<HTMLElement>(".hc-scan")[0];
      const chromeEls = q<HTMLElement>(".hc-chrome");
      const logs = q<HTMLElement>(".hc-log");
      const logTimes = q<HTMLElement>(".hc-logtime");
      const titleEl = q<HTMLElement>(".hc-bigtitle")[0];
      const capEls = q<HTMLElement>(".hc-cap");
      const reqRows = q<HTMLElement>(".hc-reqrow");
      const reqVals = q<HTMLElement>(".hc-reqval");
      const reqBlock = q<HTMLElement>(".hc-req")[0];
      const feed = q<HTMLElement>(".hc-feed")[0];
      const entries = q<HTMLElement>(".hc-entry");
      const names = q<HTMLElement>(".hc-name");
      const prices = q<HTMLElement>(".hc-price");
      const reticle = q<HTMLElement>(".hc-reticle")[0];
      const nonBest = q<HTMLElement>(".hc-entry:not([data-best])");
      const bestEl = q<HTMLElement>("[data-best]")[0];
      const stamp = q<HTMLElement>(".hc-stamp")[0];

      const typedReq = reqVals.map((el) => el.textContent ?? "");
      reqVals.forEach((el) => (el.textContent = ""));
      const logTexts = logs.map((el) => el.dataset.line ?? "");
      logs.forEach((el) => (el.textContent = "> "));

      const priceStart = OFFERS.map((o) => o.price - 2600);
      const priceProxy = OFFERS.map((_, i) => ({ v: priceStart[i] }));
      prices.forEach((el, i) => (el.textContent = chf(priceStart[i])));

      // phase titles (scramble between them on one element)
      const titles = dict.acts.map((a) => a.t);
      if (titleEl) titleEl.textContent = "";

      gsap.set(frame, { autoAlpha: 0, scale: 0.985 });
      gsap.set(scan, { yPercent: -110 });
      gsap.set(chromeEls, { opacity: 0 });
      gsap.set([...logs, ...logTimes], { opacity: 0 });
      gsap.set(capEls, { opacity: 0, y: 14 });
      gsap.set(reqBlock, { autoAlpha: 0, y: 20 });
      gsap.set(reqRows, { opacity: 0, x: -14 });
      gsap.set(feed, { autoAlpha: 0, y: 20 });
      gsap.set(entries, { opacity: 0, y: 22, filter: "blur(6px)" });
      gsap.set(reticle, { autoAlpha: 0 });
      gsap.set(stamp, { autoAlpha: 0, scale: 1.6, rotate: -8 });

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
            if (phase.current) phase.current.textContent = p < 0.22 ? "BOOT" : p < 0.45 ? "01" : p < 0.74 ? "02" : "03";
            if (bar.current) bar.current.style.transform = `scaleX(${p})`;
          },
        },
      });

      const log = (i: number, at: number | string) =>
        tl
          .to([logs[i], logTimes[i]], { opacity: 1, duration: 0.12 }, at)
          .to(logs[i], { text: { value: `> ${logTexts[i]}` }, duration: 0.5, ease: "none" }, "<");

      const title = (i: number, at: number | string) =>
        tl
          .to(titleEl, { scrambleText: { text: titles[i], chars: "upperCase", speed: 0.7 }, duration: 0.8 }, at)
          .to(capEls, { opacity: 0, y: -10, duration: 0.2 }, "<")
          .to(capEls[i], { opacity: 1, y: 0, duration: 0.45 }, "<0.3");

      /* ═══ BOOT ═══ */
      tl.to(frame, { autoAlpha: 1, scale: 1, duration: 0.7 }, 0.05)
        .to(scan, { yPercent: 110, duration: 1.1, ease: "power1.inOut" }, 0.15)
        .to(chromeEls, { opacity: 1, stagger: 0.06, duration: 0.3 }, 0.4);

      /* ═══ PHASE 1 — request received ═══ */
      log(0, 1.1);
      title(0, 1.25);
      tl.to(reqBlock, { autoAlpha: 1, y: 0, duration: 0.5 }, "<0.15");
      reqRows.forEach((row, i) => {
        tl.to(row, { opacity: 1, x: 0, duration: 0.25 }, `<${i === 0 ? 0.15 : 0.3}`);
        tl.to(reqVals[i], { text: { value: typedReq[i] }, duration: 0.3, ease: "none" }, "<0.08");
      });
      tl.to({}, { duration: 0.8 });

      /* ═══ PHASE 2 — dealers compete ═══ */
      log(1, ">");
      title(1, "<0.1");
      tl.to(feed, { autoAlpha: 1, y: 0, duration: 0.5 }, "<0.2");
      log(2, ">-0.2");
      entries.forEach((card, i) => {
        tl.to(card, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.4 }, `<${i === 0 ? 0.1 : 0.28}`)
          .to(names[i], { scrambleText: { text: names[i].dataset.name ?? "", chars: "upperCase", speed: 0.6 }, duration: 0.45 }, "<")
          .to(priceProxy[i], {
            v: OFFERS[i].price, duration: 0.55, ease: "power1.out",
            onUpdate: () => { prices[i].textContent = chf(Math.round(priceProxy[i].v)); },
          }, "<0.05");
      });
      tl.to({}, { duration: 0.8 });

      /* ═══ PHASE 3 — the lock ═══ */
      log(3, ">");
      title(2, "<0.1");

      // reticle scan: sweep down the feed, then snap onto the best entry
      const measure = () => {
        const fr = feed.getBoundingClientRect();
        return entries.map((e) => {
          const r = e.getBoundingClientRect();
          return { top: r.top - fr.top - 5, height: r.height + 10 };
        });
      };
      tl.add(() => {
        const m = measure();
        const last = m[m.length - 1];
        const best = m[0];
        gsap.set(reticle, { top: m[0].top, height: m[0].height });
        gsap
          .timeline()
          .to(reticle, { autoAlpha: 1, duration: 0.15 })
          .to(reticle, { top: last.top, height: last.height, duration: 0.5, ease: "power2.inOut" })
          .to(reticle, { top: best.top, height: best.height, duration: 0.4, ease: "power3.out" });
      }, ">0.1");
      tl.to(reticle, { autoAlpha: 1, duration: 0.2 }, ">0.15") // scrub-safe visibility
        .to(nonBest, { opacity: 0.15, filter: "blur(1.5px)", stagger: 0.06, duration: 0.45 }, ">0.4")
        .to(bestEl, { backgroundColor: "rgba(216,30,36,0.10)", duration: 0.4 }, "<")
        .to(reticle, { borderColor: "rgba(216,30,36,0.9)", duration: 0.3 }, "<")
        .to(stamp, { autoAlpha: 1, scale: 1, rotate: -4, duration: 0.4 }, "<0.2");
      tl.to({}, { duration: 1 });

      ScrollTrigger.refresh();
    }, section);
    return () => ctx.revert();
  }, []);

  const times = ["T+0.0s", "T+0.8s", "T+4.2s", "T+18h"];

  return (
    <section ref={section} className="relative bg-void">
      <div ref={pin} className="grain-dark relative flex flex-col items-center justify-center bg-void py-16 text-white lg:py-20">
        {/* backdrop grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, oklch(1 0 0 / 0.03) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.03) 1px, transparent 1px)",
            backgroundSize: "clamp(52px, 6vw, 88px) clamp(52px, 6vw, 88px)",
            maskImage: "radial-gradient(110% 100% at 50% 40%, black 25%, transparent 76%)",
            WebkitMaskImage: "radial-gradient(110% 100% at 50% 40%, black 25%, transparent 76%)",
          }}
        />

        {/* console frame */}
        <div className="hc-frame relative z-10 mx-auto w-full max-w-[76rem] overflow-hidden rounded-[var(--radius-xl)] border border-white/[0.1]" style={{ background: "oklch(0.115 0.01 27)", boxShadow: "var(--shadow-float)" }}>
          {/* scanline */}
          <span aria-hidden className="hc-scan pointer-events-none absolute inset-x-0 top-0 z-30 h-24" style={{ background: "linear-gradient(to bottom, transparent, rgba(216,30,36,0.10), rgba(255,255,255,0.05), transparent)" }} />

          {/* header bar */}
          <div className="hc-chrome flex items-center justify-between border-b border-white/[0.08] px-5 py-3">
            <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/50 [font-family:var(--font-mono)]">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-red)" }} />
              AUTOVERKAUF // {dict.kicker}
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 [font-family:var(--font-mono)]">
              <span ref={phase} className="text-white/80">BOOT</span>
              <span className="hc-cursor ml-2 inline-block h-[10px] w-[6px] translate-y-[1px] bg-white/70" />
            </span>
          </div>

          <div className="grid grid-cols-1 gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            {/* left: log feed + big title */}
            <div className="flex flex-col justify-between border-b border-white/[0.08] p-6 lg:border-b-0 lg:border-r lg:p-8">
              <div>
                <div className="space-y-2.5">
                  {dict.logs.map((line, i) => (
                    <p key={line} className="flex items-baseline gap-3 text-[11px] leading-relaxed [font-family:var(--font-mono)]">
                      <span className="hc-logtime shrink-0 text-white/30">{times[i]}</span>
                      <span className="hc-log text-white/75" data-line={line}>&gt; {line}</span>
                    </p>
                  ))}
                </div>

                <h3 className="hc-bigtitle mt-10 min-h-[2.2em] text-[clamp(2rem,3.8vw,3.2rem)] font-medium uppercase leading-[1.04] tracking-[-0.01em] [font-family:var(--font-display)]">
                  {dict.acts[0].t}
                </h3>
                <div className="relative mt-4 min-h-[5.5em]">
                  {dict.acts.map((a) => (
                    <p key={a.t} className="hc-cap absolute inset-x-0 top-0 max-w-[24rem] text-[0.98rem] leading-[1.6] text-white/55">
                      {a.b}
                    </p>
                  ))}
                </div>
              </div>

              <div className="mt-8 hidden items-center gap-3 lg:flex">
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/35 [font-family:var(--font-mono)]">CH · 26</span>
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/35 [font-family:var(--font-mono)]">#AV-8241</span>
              </div>
            </div>

            {/* right: readout */}
            <div className="p-6 lg:p-8">
              {/* request readout */}
              <div className="hc-req rounded-[var(--radius-md)] border border-white/[0.08] p-4" style={{ background: "oklch(0.145 0.011 27)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-white/40 [font-family:var(--font-mono)]">{dict.reqLabel}</span>
                  <span className="text-[11px] font-semibold text-white/85">{dict.reqModel}</span>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-6">
                  {dict.rows.map(([label, value]) => (
                    <div key={label} className="hc-reqrow flex items-baseline justify-between gap-3 border-t border-white/[0.06] py-1.5">
                      <dt className="text-[10px] uppercase tracking-[0.08em] text-white/40 [font-family:var(--font-mono)]">{label}</dt>
                      <dd className="hc-reqval min-h-[1em] text-[11.5px] text-white/85 [font-family:var(--font-mono)]">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* offer feed */}
              <div className="hc-feed relative mt-4">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-white/40 [font-family:var(--font-mono)]">{dict.offersLabel}</span>
                  <span className="text-[10px] uppercase tracking-[0.1em] text-white/45 [font-family:var(--font-mono)]">4 {dict.responding}</span>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {OFFERS.map((o) => {
                    const isBest = o.id === BEST_ID;
                    return (
                      <li
                        key={o.id}
                        {...(isBest ? { "data-best": "" } : {})}
                        className="hc-entry relative flex items-center gap-3 rounded-[var(--radius-sm)] border border-white/[0.07] px-3 py-2.5 will-change-transform"
                        style={{ background: "oklch(0.135 0.01 27)" }}
                      >
                        <span className="grid h-7 w-8 shrink-0 place-items-center rounded-[4px] border border-white/10 bg-white/[0.04] text-[10px] font-semibold text-white/70 [font-family:var(--font-mono)]">
                          {o.canton}
                        </span>
                        <p className="hc-name min-w-0 flex-1 truncate text-[0.8rem] font-medium text-white/85" data-name={o.dealer}>{o.dealer}</p>
                        <span className="text-[10px] uppercase tracking-[0.05em] text-white/40 [font-family:var(--font-mono)]">{o.match}%</span>
                        <p className="hc-price w-[6.6rem] text-right text-[0.85rem] font-semibold text-white [font-family:var(--font-mono)]">{chf(o.price)}</p>
                      </li>
                    );
                  })}
                </ul>

                {/* targeting reticle */}
                <div aria-hidden className="hc-reticle pointer-events-none absolute inset-x-[-6px] rounded-[var(--radius-md)] border border-white/50" style={{ top: 30, height: 46, maskImage: "linear-gradient(black, black)", clipPath: "polygon(0 0, 14px 0, 14px 2px, 2px 2px, 2px 14px, 0 14px, 0 0, 100% 0, 100% 14px, calc(100% - 2px) 14px, calc(100% - 2px) 2px, calc(100% - 14px) 2px, calc(100% - 14px) 0, 100% 0, 100% 100%, calc(100% - 14px) 100%, calc(100% - 14px) calc(100% - 2px), calc(100% - 2px) calc(100% - 2px), calc(100% - 2px) calc(100% - 14px), 100% calc(100% - 14px), 100% 100%, 0 100%, 0 calc(100% - 14px), 2px calc(100% - 14px), 2px calc(100% - 2px), 14px calc(100% - 2px), 14px 100%, 0 100%)" }} />

                {/* stamp */}
                <span className="hc-stamp pointer-events-none absolute right-4 z-20 rounded-[4px] border px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] [font-family:var(--font-mono)]" style={{ top: 12, color: "white", borderColor: "rgba(216,30,36,0.9)", background: "oklch(0.552 0.221 29)" }}>
                  {dict.best}
                </span>
              </div>
            </div>
          </div>

          {/* progress footer */}
          <div className="hc-chrome border-t border-white/[0.08] px-5 py-2.5">
            <div className="h-px w-full overflow-hidden bg-white/10">
              <span ref={bar} className="block h-full origin-left" style={{ background: "var(--color-red)", transform: "scaleX(0)" }} />
            </div>
          </div>
        </div>

        <style>{`
          .hc-cursor { animation: hcBlink 1.1s steps(1) infinite; }
          @keyframes hcBlink { 50% { opacity: 0; } }
          @media (prefers-reduced-motion: reduce) { .hc-cursor { animation: none; } }
        `}</style>
      </div>
    </section>
  );
}
