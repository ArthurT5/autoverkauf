# AutoVerkauf

A reverse car marketplace for Switzerland. Buyers describe the car they want once, and verified Swiss dealerships compete by sending matching offers — no searching, no cold calls, free for buyers.

## How it works

1. **Describe your car** — budget, body type, brand, specs, and features through a guided wizard.
2. **Dealers are notified** — your request reaches verified Swiss dealerships across all 26 cantons.
3. **Offers arrive** — matching offers land directly in your dashboard. You choose. Your contact details stay private until you decide to share them.

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS v4** with OKLCH color tokens
- **Framer Motion** + **GSAP** for motion
- **Supabase** (Postgres) for the database
- **NextAuth v5** (Credentials + bcrypt) for auth
- **next-intl** for i18n — German (default), French, Italian, English

## Getting started

```bash
cd web
npm install
cp .env.example .env   # fill in your Supabase + NextAuth values
npm run dev
```

The app runs at `http://localhost:3000`.

### Database

Run [`web/supabase-schema.sql`](web/supabase-schema.sql) in your Supabase project's SQL Editor to create the tables.

## Internationalization

The app ships in the four Swiss languages. Locale routing is `as-needed`:

- `/` → German (default)
- `/fr` → French
- `/it` → Italian
- `/en` → English

Translation files live in [`web/messages/`](web/messages).

## Project structure

```
web/
  src/
    app/[locale]/      # localized routes (landing, buyer, dealer, admin)
    app/api/           # auth, requests, offers API routes
    components/        # landing sections, wizard, shared UI
    i18n/              # next-intl routing + request config
    lib/               # supabase client, auth config
    proxy.ts           # locale middleware (Next.js 16 proxy convention)
  messages/            # de / fr / it / en translation catalogs
  supabase-schema.sql  # database schema
```
