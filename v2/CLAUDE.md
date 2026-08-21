# AutoVerkauf — v2 (active rebuild)

Reverse car marketplace for Switzerland: a **buyer** describes the car they want once, and **verified Swiss dealers compete** by sending matching offers with a price. The buyer compares and chooses. **The platform creates the match — it does not complete the sale.** Mechanic is **buyer-side** (not seller-side).

This `v2/` is the **active** project. The original v1 lives at `../web` (Next 16) and is **paused** — do not build there. v1 was judged "too generic"; v2 is the distinctive rebuild.

## Stack

- **Astro 5** + **React islands** (`@astrojs/react`). Zero JS by default — add `client:load` / `client:visible` only where interaction lives. Most of the page is static Astro.
- **Tailwind CSS v4** via `@tailwindcss/vite` (no `tailwind.config.*`). Design tokens live in `src/styles/global.css` under `@theme` (OKLCH). Utilities like `bg-paper`, `text-ink-900`, `text-red`, `border-line`, `.num`, `.grain` come from there.
- **TypeScript strict**. Path alias `@/*` → `src/*`.
- **Motion** (`motion/react`) and **GSAP** (+ ScrollTrigger, SplitText, TextPlugin, ScrambleText, DrawSVG, MotionPath — all registered in `src/lib/gsap.ts`; GSAP 3.13+ ships every former Club plugin free). GSAP is the default for scroll-driven and complex sequences.
- Helpers: `clsx` + `tailwind-merge` via `cn()` in `src/lib/utils.ts`.

## i18n (Astro, URL-based)

- Locales: **`en` (default, unprefixed)**, `de`, `fr`, `it` (prefixed: `/de`, `/fr`, `/it`). Configured in `astro.config.mjs`.
- All strings live in **`src/lib/i18n/ui.ts`** (`ui[locale][key]`). **Keep all four locales in sync** — every key exists in every locale. `UIKey` is derived from the `de` block.
- Helpers in `src/lib/i18n/utils.ts`: `getLangFromUrl(url)`, `useTranslations(lang)` → `t(key)`, `localizedPath(path, lang)`, `localeList`.
- Layouts must tolerate ~40% text expansion (FR/IT run long). No hardcoded UI text in components — resolve via `t()` and pass into islands as a dict prop.
- CHF formatting: `src/lib/format.ts` (`chf()` → Swiss apostrophe `CHF 39'800`). Cantons: `src/lib/cantons.ts` (all 26, localized).

## Architecture & conventions

- **Pages:** `src/pages/{index,de/index,fr/index,it/index}.astro` each render `<Base navTheme="light"><Landing /></Base>`. Add real sections once in **`src/components/Landing.astro`**.
- **Routing/links:** **three real pages** exist — `/` (landing), `/haendler` (dealer), and **`/anfrage` (the buyer request wizard)**, each localized. "How it works" and "Pricing" are **sections, not pages** → nav/footer link to anchors `/#how-it-works` and `/haendler#pricing` (targets carry `id=` + `scroll-mt-20` for the fixed nav). A script in `Base.astro` re-scrolls to `#hash` after fonts/canvas/ScrollTrigger settle (deep-links otherwise mis-land on long animated pages). Not-yet-built routes (`/haendler/apply`, `/login`, `/kontakt`, legal) fall through to a branded **`src/pages/404.astro`** — don't leave raw dead ends; when you build one of those pages, the 404 stops catching it automatically.
- **Request wizard (`/anfrage`, `src/components/wizard/RequestWizard.tsx`):** the product's front door — 6-step light-focused wizard (Car → Budget → Year+Mileage → Fuel+Gearbox → Region → Email), tick-ruler progress, live dossier (desktop right panel / mobile sticky sheet; rows jump back to their step), sliders with tap-to-edit values, canton chips + radius + optional PLZ, localStorage draft autosave (`av-request-draft`), anonymous-until-email, confirmation screen. Strings live in **`src/lib/i18n/wizard.ts`** (own module, ×4 locales, + curated `MAKES` car data — text only, no brand logos). **Submission is frontend-only for now** (stored in `av-request-submitted`; backend TODO in `submit()`).
- **Section pattern:** an Astro wrapper (`Foo.astro`) resolves the locale dict from `ui.ts` and renders the React island (`Foo.tsx`) with `client:load`/`client:visible`. Shared dict builders: `src/lib/heroDict.ts`, `src/lib/howDict.ts`.
- **Layout:** `src/layouts/Base.astro` — head, fonts (Archivo + Geist Mono via Google, Clash Display via Fontshare), and a **fixed, theme-adaptive nav**. `navTheme` sets only the *initial* theme; a small script recolors the nav per section on scroll (white over dark, ink over light) and fades in a blurred backdrop once scrolled. **Every top-level `<section>` (and the footer) must carry `data-nav="dark"` or `"light"`** or the nav won't switch over it.
- **Landing** (`Landing.astro`): `HeroCalm.tsx` (hero, light) → `HowStory.tsx` ("how it works" scrollytelling, light). Consumer page only — dealer content lives on its own page.
- **Dealer page** (`/haendler` + localized; composed in `DealerPage.astro`): a Sondaven-style immersive, theme-switching B2B page — Radar canvas hero (dark) → Problem → Flow → Reach (Contour canvas blend) → Pricing → FAQ → CTA (drenched red) → `Footer.astro`. Components in `src/components/dealer/*`.
- **Reveal system:** `components/motion/Reveal.tsx` — drop `<Reveal client:load />` once per page; it animates any `[data-reveal="h|up|line"]` on scroll (Sondaven-style). Sections stay static Astro. Reduced-motion / no-JS safe.
- Design explorations are parked as preview routes under `src/pages/v/*` (`/v/how-c`, `/v/calm-dark`, `/v/haendler-a`, `/v/haendler-b`, …) — reference only, not linked.

## Design language

Calm-premium Swiss — "Zurich private-banking software." Whitespace is a feature; typography does the heavy lifting; precision is the aesthetic.

- **Brand logo:** official assets in `public/brand/` — `monogram.svg` (red squircle with a white "A" whose crossbar is a downward chevron = the inversion), `lockup-on-light.svg` (ink wordmark, for light bgs), `lockup-on-dark.svg` (white wordmark, for dark bgs). Nav picks the lockup by `navTheme`; footer uses on-dark; `public/favicon.svg` = monogram. Don't hand-draw an "A" box — use these.
- **Accent = Signal Red `#D81E24`** (brand), token `--color-red` (`--color-red-deep #b4171d`). Canvas code uses `rgb(216,30,36)`.
- **Base:** light "paper" (`bg-paper` / `paper-2`) with occasional **dark "void" inversion** moments. The whole surface lives in the Swiss-red hue (27): near-neutral inks/lines carry a trace of it so the single saturated **red** reads as the material intensifying. Red = accent/punctuation only.
- **Type:** **Clash Display** (display headings, `--font-display`), **Archivo** (body/UI, `--font-sans`), **Geist Mono** (labels, numbers, chrome, `--font-mono`).
- **Do NOT** reintroduce v1's bracket-label-on-every-section or a tracked-uppercase eyebrow on every section (AI-slop tell). One deliberate mono chrome line per section is fine.

## Motion rules (non-negotiable)

- Every animation needs a **reduced-motion + no-JS fallback**. Content is visible by default in the DOM; hide it via `gsap.set` only inside the animated path, guarded by `matchMedia("(prefers-reduced-motion: reduce)")`. Never gate content visibility on a class-triggered transition.
- Pinned ScrollTrigger scrubs: apply the `height:100svh` + `overflow:hidden` **lock in JS only** so the static fallback flows at natural height.
- Ease out (power/expo); no bounce/elastic. Respect the house tokens (`--ease-*`, `--dur-*`).

## Product & content constraints (hard rules)

- **No fabricated data, metrics, reviews, or logos.** This is going live. Illustrative product UI (one example request + example offers) is fine but must read as an example, never as platform statistics.
- **No stock or real photos.** Visuals are typography, canvas/SVG, generated scenes.
- **Accessibility:** WCAG 2.1 AA. Body text ≥ 4.5:1. Keyboard-accessible; visible focus. Respect `prefers-reduced-motion`.
- **Commit or push only when explicitly asked.**

## Commands

- `npm run dev` → http://localhost:4321
- `npm run build` · `npm run preview` · `npm run astro`
- **Gotcha:** the Tailwind v4 Vite plugin sometimes misses classes in a **brand-new** component file over HMR — restart `astro dev` after creating a new component.
