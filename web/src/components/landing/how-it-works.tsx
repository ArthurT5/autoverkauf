"use client";

import { useRef, useLayoutEffect } from "react";
import { useTranslations } from "next-intl";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { HalftoneCanvas } from "@/components/motion/halftone-canvas";
import { Eyebrow } from "@/components/motion/eyebrow";

const SCENE_KEYS = ["request", "takeover", "respond", "arrive", "compare", "decide"] as const;

/* ── One continuous world (px). The camera (the .world transform) travels
   through it; elements persist and transform rather than cross-fading. ── */
const C1 = { x: 780, y: 640 }; // request / token / network centre
const C2 = { x: 1880, y: 640 }; // dashboard centre
const DEAL_R = 400;
const DEAL_ANGLES = [-58, -6, 52, 116, 180, 244];
const CANTONS = ["ZH", "BS", "BE", "VD", "SG", "TI"];
const ACTIVE_IDX = [0, 2, 4];
const DEALERS = DEAL_ANGLES.map((deg, i) => {
  const a = (deg * Math.PI) / 180;
  return { x: C1.x + DEAL_R * Math.cos(a), y: C1.y + DEAL_R * Math.sin(a), canton: CANTONS[i], active: ACTIVE_IDX.includes(i) };
});
const ACTIVE = DEALERS.filter((d) => d.active);
const SLOTS = [-235, 0, 235].map((dx) => ({ x: C2.x + dx, y: C2.y }));
const OFFERS = [
  { dealer: "AutoCenter Basel", year: "2022", km: "28’000 km", price: "CHF 37’200", match: 91 },
  { dealer: "Garage Lausanne", year: "2021", km: "22’000 km", price: "CHF 38’500", match: 96 },
  { dealer: "Premium Cars Bern", year: "2020", km: "31’000 km", price: "CHF 39’900", match: 88 },
];

export function HowItWorks() {
  const t = useTranslations("how");
  const root = useRef<HTMLDivElement>(null);

  const formFields = [
    [t("ui.lBudget"), t("ui.vBudget")],
    [t("ui.lBody"), t("ui.vBody")],
    [t("ui.lFuel"), t("ui.vFuel")],
    [t("ui.lTrans"), t("ui.vTrans")],
    [t("ui.lMileage"), t("ui.vMileage")],
    [t("ui.lLocation"), t("ui.vLocation")],
  ];
  const pin = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!root.current || !pin.current || !world.current) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root.current!);
        const W = pin.current!.clientWidth;
        const H = pin.current!.clientHeight;
        // camera: put world point (wx,wy) at screen (W/2, 58% H) at scale s —
        // below centre so the fixed HUD caption band never overlaps the artwork
        const cam = (wx: number, wy: number, s: number) => ({ x: W / 2 - wx * s, y: H * 0.58 - wy * s, scale: s });

        gsap.set(world.current, { transformOrigin: "0 0", ...cam(C1.x, C1.y, 1) });

        gsap.set(q(".scene-text"), { autoAlpha: 0, y: 14 });
        gsap.set(q(".scene-text")[0], { autoAlpha: 1, y: 0 });
        gsap.set(q(".hud-fill"), { scaleX: 0, transformOrigin: "left" });
        gsap.set(q(".ff"), { autoAlpha: 0, y: 12 });
        gsap.set(q(".form-bar"), { scaleX: 0, transformOrigin: "left" });
        gsap.set(q(".token"), { autoAlpha: 0, scale: 0.9 });
        gsap.set(q(".ring"), { autoAlpha: 0, scale: 0.5 });
        gsap.set(q(".matching"), { autoAlpha: 0 });
        gsap.set(q(".net-line"), { strokeDashoffset: 1 });
        gsap.set(q(".dealer"), { autoAlpha: 0, scale: 0 });
        gsap.set(q(".dash-frame"), { autoAlpha: 0 });
        gsap.set(q(".offer"), { autoAlpha: 0, scale: 0.85 });
        gsap.set(q(".offer-detail"), { autoAlpha: 0 });
        gsap.set(q(".offer-bar"), { scaleX: 0, transformOrigin: "left" });
        gsap.set(q(".best-badge"), { autoAlpha: 0 });
        gsap.set(q(".decide-cta"), { autoAlpha: 0, y: 8 });

        const caption = (i: number) => {
          q(".scene-text").forEach((el, idx) =>
            tl.to(el, { autoAlpha: idx === i ? 1 : 0, y: idx === i ? 0 : 14, duration: 0.4 }, "<")
          );
          tl.to(q(".hud-fill"), { scaleX: (i + 1) / SCENE_KEYS.length, duration: 0.5 }, "<");
        };

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: { trigger: pin.current, start: "top top", end: "+=620%", pin: true, scrub: 1, anticipatePin: 1 },
        });

        // ── 1 · request: fields complete, submit ──
        tl.to(q(".ff"), { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.4 });
        tl.to(q(".form-bar"), { scaleX: 1, duration: 0.6 }, "-=0.35");
        tl.to(q(".form-submit"), { scale: 0.96, duration: 0.12 }, "+=0.05").to(q(".form-submit"), { scale: 1, duration: 0.12 });
        tl.to({}, { duration: 0.3 });

        // ── 2 · takeover: form collapses INTO the request token; matching begins ──
        caption(1);
        tl.to(q(".form"), { autoAlpha: 0, scale: 0.82, duration: 0.55 });
        tl.fromTo(q(".token"), { scale: 0.7, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.55 }, "-=0.4");
        tl.to(q(".ring"), { autoAlpha: 1, scale: 1, stagger: 0.1, duration: 0.7, ease: "power2.out" }, "-=0.3");
        tl.to(q(".matching"), { autoAlpha: 1, duration: 0.4 }, "-=0.5");
        tl.to({}, { duration: 0.3 });

        // ── 3 · respond: camera zooms OUT, dealer network grows around the token ──
        caption(2);
        tl.to(world.current, { ...cam(C1.x, C1.y, 0.56), duration: 1 }, "<");
        tl.to(q(".ring"), { autoAlpha: 0, duration: 0.4 }, "<");
        tl.to(q(".matching"), { autoAlpha: 0, duration: 0.3 }, "<");
        tl.to(q(".net-line"), { strokeDashoffset: 0, stagger: 0.06, duration: 0.6 }, "-=0.5");
        tl.to(q(".dealer"), { autoAlpha: 1, scale: 1, stagger: 0.07, duration: 0.5, ease: "back.out(1.7)" }, "-=0.5");
        tl.to({}, { duration: 0.4 });

        // ── 4 · arrive: offers generate at dealers + TRAVEL to the dashboard; camera pans across ──
        caption(3);
        tl.to(q(".dash-frame"), { autoAlpha: 1, duration: 0.5 });
        tl.to(world.current, { ...cam((C1.x + C2.x) / 2 + 120, C1.y, 0.66), duration: 1.2 }, "<");
        ACTIVE.forEach((d, i) => {
          const el = q(`.offer-${i}`);
          tl.to(el, { autoAlpha: 1, scale: 1, duration: 0.3 }, i === 0 ? "<+=0.2" : "<+=0.18");
          tl.to(el, { x: SLOTS[i].x - d.x, y: SLOTS[i].y - d.y, duration: 1, ease: "power2.inOut" }, "<");
        });
        tl.to(world.current, { ...cam(C2.x, C2.y, 0.86), duration: 0.8 });
        tl.to({}, { duration: 0.3 });

        // ── 5 · compare: details + match bars line up ──
        caption(4);
        tl.to(q(".offer-detail"), { autoAlpha: 1, stagger: 0.06, duration: 0.4 });
        tl.to(q(".offer-bar"), { scaleX: 1, stagger: 0.1, duration: 0.6, ease: "power2.out" }, "-=0.3");
        tl.to({}, { duration: 0.4 });

        // ── 6 · decide: camera eases onto the best; others recede ──
        caption(5);
        tl.to(world.current, { ...cam(SLOTS[1].x, SLOTS[1].y + 20, 1), duration: 0.9 }, "<");
        tl.to([q(".offer-0"), q(".offer-2")], { autoAlpha: 0.35, scale: 0.92, duration: 0.6 }, "<");
        tl.to(q(".offer-1"), { scale: 1.06, duration: 0.6 }, "<");
        tl.to(q(".best-badge"), { autoAlpha: 1, duration: 0.35 }, "-=0.3");
        tl.to(q(".decide-cta"), { autoAlpha: 1, y: 0, duration: 0.4 });
        tl.to(q(".decide-cta"), { scale: 0.97, duration: 0.12 }, "+=0.1").to(q(".decide-cta"), { scale: 1, duration: 0.12 });
        tl.to({}, { duration: 0.7 });

        return () => tl.scrollTrigger?.kill();
      });

      mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        const items = gsap.utils.toArray<HTMLElement>(root.current!.querySelectorAll(".hiw-stack-item"));
        const tws = items.map((el) =>
          gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 84%" } })
        );
        return () => tws.forEach((tw) => tw.scrollTrigger?.kill());
      });
    }, root);

    const id = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    return () => { window.clearTimeout(id); ctx.revert(); };
  }, []);

  const lineFor = (d: { x: number; y: number }) => `M${C1.x},${C1.y} L${d.x.toFixed(2)},${d.y.toFixed(2)}`;

  return (
    <section id="how-it-works" ref={root} data-nav-theme="light" className="relative bg-[var(--surface-1)]">
      {/* hairline halftone texture — dark ink on light bg, no ridge */}
      <HalftoneCanvas texture ink={[30, 16, 12]} inkAlpha={0.35} />

      {/* ── Desktop: one continuous world the camera travels through ── */}
      <div ref={pin} className="hidden motion-safe:lg:block relative h-screen overflow-hidden border-y border-[var(--hairline)]">
        {/* moving world */}
        <div ref={world} className="absolute left-0 top-0" style={{ width: 2700, height: 1280 }}>
          {/* network lines */}
          <svg className="absolute left-0 top-0" width={2700} height={1280} viewBox="0 0 2700 1280" fill="none" aria-hidden>
            {ACTIVE.map((d, i) => (
              <path key={i} className="net-line" d={lineFor(d)} stroke="var(--red)" strokeOpacity="0.4" strokeWidth="2" pathLength={1} strokeDasharray={1} />
            ))}
          </svg>

          {/* request form (centre C1) */}
          <div className="form absolute" style={{ left: C1.x - 360, top: C1.y - 270, width: 720 }}>
            <div className="rounded-3xl border border-[var(--hairline)] bg-white p-9 shadow-[var(--shadow-float)]">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[var(--ink-400)]">{t("ui.newRequest")}</p>
                  <h3 className="text-[1.7rem] font-bold tracking-[-0.02em] text-[var(--ink-900)]">{t("ui.formQ")}</h3>
                </div>
                <div className="h-1.5 w-40 overflow-hidden rounded-full bg-[var(--surface-2)]">
                  <div className="form-bar h-full w-full rounded-full bg-[var(--red)]" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {formFields.map(([l, v]) => (
                  <div key={l} className="ff rounded-xl border border-[var(--hairline)] bg-[var(--surface-1)] px-4 py-3">
                    <p className="text-[11px] text-[var(--ink-400)]">{l}</p>
                    <p className="mt-0.5 text-[14px] font-semibold text-[var(--ink-900)]">{v}</p>
                  </div>
                ))}
              </div>
              <div className="form-submit mt-7 inline-flex items-center gap-2 rounded-xl bg-[var(--red)] px-6 py-3 text-[14px] font-semibold text-white shadow-[var(--shadow-red)]">
                {t("ui.submit")} <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* matching rings (centre C1) */}
          {[520, 380, 250].map((s) => (
            <span key={s} className="ring absolute rounded-full border border-[var(--red)]/25" style={{ left: C1.x - s / 2, top: C1.y - s / 2, width: s, height: s }} />
          ))}
          <div className="matching absolute -translate-x-1/2 text-center" style={{ left: C1.x, top: C1.y + 150, width: 320 }}>
            <p className="text-[13px] font-medium text-[var(--ink-500)]">{t("ui.matching")}</p>
          </div>

          {/* request token (centre C1) */}
          <div className="token absolute -translate-x-1/2 -translate-y-1/2 z-10 rounded-2xl border border-[var(--red)]/30 bg-white px-5 py-3.5 text-center shadow-[var(--shadow-card)]" style={{ left: C1.x, top: C1.y, width: 220 }}>
            <p className="text-[11px] text-[var(--ink-400)]">{t("ui.yourRequest")}</p>
            <p className="text-[15px] font-bold text-[var(--ink-900)]">{t("ui.vehicle")}</p>
            <p className="text-[12px] text-[var(--ink-500)]">{t("ui.vBudget")} · {t("ui.vLocation")}</p>
          </div>

          {/* dealer nodes */}
          {DEALERS.map((d, i) => (
            <div key={i} className="dealer absolute -translate-x-1/2 -translate-y-1/2" style={{ left: Math.round(d.x), top: Math.round(d.y) }}>
              <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${d.active ? "border-[var(--red)]/40 bg-white shadow-[var(--shadow-card)]" : "border-[var(--hairline)] bg-[var(--surface-1)] opacity-50"}`}>
                <span className={`text-[12px] font-bold ${d.active ? "text-[var(--red)]" : "text-[var(--ink-400)]"}`}>{d.canton}</span>
                {d.active && <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--red)] opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--red)]" /></span>}
              </div>
            </div>
          ))}

          {/* dashboard frame (centre C2) */}
          <div className="dash-frame absolute -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-[var(--hairline)] bg-white/70 shadow-[var(--shadow-float)] backdrop-blur-sm" style={{ left: C2.x, top: C2.y, width: 800, height: 360 }}>
            <div className="flex items-center justify-between px-6 pt-5">
              <h3 className="text-[1.1rem] font-bold tracking-[-0.02em] text-[var(--ink-900)]">{t("ui.yourOffers")}</h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ink-900)] px-3 py-1 text-[12px] font-semibold text-white">{t("ui.newCount")}</span>
            </div>
          </div>

          {/* offers — generated at dealers, travel to the dashboard slots */}
          {ACTIVE.map((d, i) => (
            <div key={i} className={`offer offer-${i} absolute -translate-x-1/2 -translate-y-1/2 z-20`} style={{ left: Math.round(d.x), top: Math.round(d.y), width: 200 }}>
              <div className={`relative rounded-2xl border bg-white p-4 ${i === 1 ? "border-[var(--red)]/50 shadow-[var(--shadow-card)]" : "border-[var(--hairline)] shadow-[var(--shadow-card)]"}`}>
                {i === 1 && (
                  <span className="best-badge absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full bg-[var(--red)] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                    <BadgeCheck className="h-3 w-3" /> {t("ui.bestMatch")}
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[var(--ink-400)]">{OFFERS[i].dealer}</span>
                  <span className="text-[11px] font-semibold text-[var(--red)]">{OFFERS[i].match}%</span>
                </div>
                <p className="mt-1 text-[14px] font-semibold text-[var(--ink-900)]">{t("ui.vehicle")}</p>
                <p className="text-[1.35rem] font-bold tabular-nums tracking-tight text-[var(--ink-900)]">{OFFERS[i].price}</p>
                <div className="offer-detail mt-1.5 flex gap-3 text-[11px] text-[var(--ink-500)]">
                  <span>{OFFERS[i].year}</span><span>{OFFERS[i].km}</span>
                </div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                  <div className="offer-bar h-full rounded-full bg-[var(--red)]" style={{ width: `${OFFERS[i].match}%` }} />
                </div>
                {i === 1 && (
                  <div className="decide-cta mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-[var(--red)] py-2 text-[12px] font-semibold text-white">
                    {t("ui.choose")} <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* fixed HUD overlay — caption + progress (does not move with the camera) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col items-center px-6 pt-[12vh]">
          <div className="relative h-[88px] w-full max-w-2xl text-center">
            {SCENE_KEYS.map((key) => (
              <div key={key} className="scene-text absolute inset-x-0">
                <span className="text-[12px] font-semibold tracking-[0.2em] text-[var(--red)]">{t(`scenes.${key}.step`)}</span>
                <h2 className="mt-1 text-[clamp(1.6rem,2.6vw,2.2rem)] font-bold tracking-[-0.025em] text-[var(--ink-900)]">{t(`scenes.${key}.title`)}</h2>
                <p className="mx-auto mt-1.5 max-w-lg text-[14.5px] leading-relaxed text-[var(--ink-500)]">{t(`scenes.${key}.body`)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-7 left-1/2 z-30 h-0.5 w-40 -translate-x-1/2 overflow-hidden rounded-full bg-[var(--hairline)]">
          <div className="hud-fill h-full w-full rounded-full bg-[var(--red)]" />
        </div>
      </div>

      {/* ── Mobile / reduced-motion fallback ── */}
      <div className="motion-safe:lg:hidden mx-auto max-w-md px-6 py-20">
        <div className="mb-12">
          <Eyebrow className="text-[var(--ink-400)]">{t("eyebrow")}</Eyebrow>
          <h2 className="text-[clamp(2rem,7vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.025em] text-[var(--ink-900)]" style={{ textWrap: "balance" }}>{t("heading")}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-500)]">{t("sub")}</p>
        </div>
        <div className="space-y-8">
          {SCENE_KEYS.map((key, i) => (
            <div key={key} className="hiw-stack-item motion-safe:opacity-0 motion-safe:translate-y-6 flex gap-4">
              <div className="flex flex-col items-center">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--red)] text-[13px] font-bold text-white">{i + 1}</span>
                {i < SCENE_KEYS.length - 1 && <span className="mt-1 w-px flex-1 bg-[var(--hairline)]" />}
              </div>
              <div className="pb-2">
                <h3 className="text-[1.2rem] font-semibold tracking-[-0.01em] text-[var(--ink-900)]">{t(`scenes.${key}.title`)}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--ink-500)]">{t(`scenes.${key}.body`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
