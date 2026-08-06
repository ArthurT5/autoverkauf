@AGENTS.md

# AutoVerkauf — Web

Reverse car marketplace for Switzerland: buyers describe the car they want once, and verified Swiss dealerships compete by sending matching offers. The platform creates the match — it does not complete the sale. See `PRODUCT.md` for users, brand, and design principles.

## Stack

- **Next.js 16** (App Router, RSC). This is NOT the Next.js in your training data — read `node_modules/next/dist/docs/` before writing framework code (see AGENTS.md).
- **React 19** + **TypeScript** (strict).
- **Tailwind CSS v4** — configured via `@import` in `src/app/globals.css` and `@tailwindcss/postcss` (see `postcss.config.mjs`). There is no `tailwind.config.*` file; theme lives in CSS. `tw-animate-css` is imported in the CSS layer.
- **UI primitives:** `@base-ui/react` (NOT Radix). shadcn is configured (`components.json`, style `base-nova`) and generates components into `src/components/ui/`; `shadcn/tailwind.css` is imported in globals. Icons: `lucide-react`.
- **Styling helpers:** `class-variance-authority`, `clsx`, `tailwind-merge` (via `cn()` in `src/lib/utils.ts`).
- **Motion:** GSAP (+ ScrollTrigger) via `src/lib/gsap.ts`, Lenis smooth scroll (`src/components/motion/lenis-provider.tsx`, dynamically imported), Framer Motion. See `.claude/skills` GSAP skills and `reference/sondaven.html` for animation patterns.
- **State:** Zustand (`src/store/`).
- **Auth:** NextAuth v5 (beta) — config in `src/lib/auth.ts`, route at `src/app/api/auth/[...nextauth]/route.ts`. Passwords hashed with `bcryptjs`.
- **DB:** Supabase (`src/lib/supabase.ts`). Schema in `supabase-schema.sql`.
- **i18n:** `next-intl` with **cookie-based** locale (no `[locale]` route segment — all languages share one URL).

## Architecture & conventions

- Path alias: `@/*` → `src/*`.
- **i18n:** locales are `de` (default), `fr`, `it`, `en` — defined in `src/i18n/config.ts`. Active locale is read from the `NEXT_LOCALE` cookie via `src/i18n/locale.ts`; `src/i18n/request.ts` wires `next-intl` (registered in `next.config.ts`). Translations live in `messages/{de,fr,it,en}.json` — keep all four in sync. Layouts must tolerate ~40% text expansion.
- **Supabase clients:** `supabase` (anon, browser-safe) and `supabaseAdmin` (service role, **server-only**, bypasses RLS). Never import `supabaseAdmin` into client components. Public anon role has no table access — all reads/writes go through the service role in server-side API routes (`src/app/api/**`).
- **Data model** (`supabase-schema.sql`): `users` (role BUYER/DEALER/ADMIN) → `buyers` / `dealers` (status PENDING/APPROVED/REJECTED); `vehicle_requests` (buyer criteria, status ACTIVE/CLOSED/EXPIRED); `offers` (dealer→request, price in CHF cents, status PENDING/VIEWED/ACCEPTED/DECLINED); `notifications`. RLS is on for all tables.
- **App structure:** marketing pages at `src/app/*` (about, contact, for-dealers, login, privacy, terms); role dashboards under `buyer/`, `dealer/`, `admin/dashboard/`; the buyer request flow is the wizard in `src/components/wizard/` backed by `src/store/request-wizard.ts`. API routes: auth, register, dealer apply/requests, offers, requests, admin overview.
- **Components:** `src/components/ui/` (shadcn primitives), `landing/`, `motion/`, `dashboard/`, `wizard/`.

## Product & design constraints (from PRODUCT.md / project memory)

- Premium · Efficient · Swiss — "Zurich private banking software." White space is a feature; typography does the heavy lifting; precision is the aesthetic. Calm, not delight-theatre.
- **No fake/placeholder data and no stock photos** in shipped UI. Treat this as a launched product.
- One decision at a time (progressive disclosure). Motion serves orientation, not showcase.
- **Accessibility:** WCAG 2.1 AA. Body text ≥ 4.5:1 contrast. Keyboard-accessible interactive elements. Respect `prefers-reduced-motion` (transitions become instant crossfades).

## Commands

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`, extends `eslint-config-next`)

## Notes

- Env: see `.env.example`. Requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, plus NextAuth secrets.
- **Dead dependencies** (safe to remove — no imports found anywhere): `@radix-ui/react-accordion`, `@radix-ui/react-tabs`, `@hookform/resolvers`, `react-hook-form`, `zod`, `playwright`. UI uses `@base-ui/react`, not Radix; forms use Zustand, not react-hook-form/zod.
- Commit or push only when explicitly asked.
