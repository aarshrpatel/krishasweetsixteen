# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

A Next.js 16 (App Router) RSVP site for Krisha's Sweet Sixteen, deployed on
Vercel. The owner uploads an Excel guest list in the admin dashboard, the
site generates a per-family RSVP link, families respond yes/no, and the
owner gets an email per response.

Free-tier stack: Vercel (Hobby) + Neon Postgres (free tier, via Vercel
Marketplace) + Resend (free tier, 100 emails/day).

## Common commands

```bash
npm run dev            # Next.js dev server (Turbopack) on :3000
npm run build          # Production build
npm run lint           # ESLint
npm run db:generate    # Generate a SQL migration from schema changes
npm run db:push        # Push schema directly to DATABASE_URL (use this for first-time setup)
npm run db:studio      # Drizzle Studio (browse the DB in a web UI)
```

There are no tests in this repo. Verification is: `npm run build` + manually
clicking through `/admin`, `/rsvp/<token>`, and the upload flow with a real
xlsx file.

## Required env vars

Listed in `.env.example`. The app fails fast at startup if `DATABASE_URL`
or `ADMIN_SECRET` are missing. Email is optional — if Resend vars are unset
the RSVP still saves to the DB and a warning is logged.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string |
| `ADMIN_PASSWORD` | Plaintext password for the `/admin/login` form |
| `ADMIN_SECRET` | HMAC key for signing the admin session cookie |
| `NEXT_PUBLIC_SITE_URL` | Used to render absolute RSVP links in the admin table |
| `RESEND_API_KEY` / `NOTIFICATION_FROM` / `NOTIFICATION_TO` | Email notifications |

## Architecture

Three surfaces share one Postgres table (`families`):

1. **`/` (landing)** — static page that points guests to their personal link.
2. **`/admin`** — owner-only dashboard. Auth is a simple HMAC-signed cookie
   set after the password check (`lib/auth.ts`); there is no users table.
   Server actions in `app/admin/actions.ts` handle Excel upload, delete,
   clear-all, and logout. Upload parses the xlsx with SheetJS
   (`lib/excel.ts`), generates a 12-char `nanoid` per family for the RSVP
   token, and bulk-inserts.
3. **`/rsvp/[token]`** — public per-family RSVP form. The token is the only
   credential — anyone with the link can submit. The submit action
   (`app/rsvp/[token]/actions.ts`) updates the row and best-effort calls
   Resend (`lib/email.ts`); email failure is logged but does not roll back
   the RSVP.

### Data model

Single table `families` (see `lib/db/schema.ts`). Families have a
`maxAttendees` cap (from the spreadsheet), a `status` enum
(`pending` / `yes` / `no`), and an optional `confirmedAttendees` count
which is set only when status is `yes`. The token is unique and indexed.

### Excel parsing

`lib/excel.ts` accepts a number of column-name variants
(`Family Name` / `Family` / `Name`; `People` / `Attendees` /
`Number of People`) and is case-insensitive. Errors carry the offending
row number so the admin sees a useful message. If you need to support a
new column, add it to the `pick(...)` call.

### Why Drizzle + Neon HTTP

Neon's HTTP driver works with Vercel's serverless functions without
connection-pool headaches. Migrations are managed with drizzle-kit; for
a one-person side project we use `db:push` (sync schema directly) rather
than maintaining a migration history.

### Auth model

The admin password is compared with `crypto.timingSafeEqual` against the
`ADMIN_PASSWORD` env var. The session cookie is HMAC-signed with
`ADMIN_SECRET` so it can't be forged without that secret. There is no
multi-user support and no rate limiting — fine for one private admin,
not fine for anything larger.

## Editing notes

- Next.js 16 / React 19: `cookies()`, `headers()`, and route `params` are
  all `Promise`-based. Always `await` them.
- Server Actions are used for every mutation. Avoid creating route
  handlers (`route.ts`) unless something genuinely needs an HTTP endpoint.
- Tailwind v4 with CSS variables in `app/globals.css` (no `tailwind.config.js`).
  The palette is `--primary`, `--primary-soft`, `--accent`, `--muted`,
  `--border` — reuse these instead of hardcoding hex.
- Fonts are loaded via `next/font/google` in `app/layout.tsx`
  (Inter + Playfair Display). Use `font-display` for the serif heading look.
- After changing `lib/db/schema.ts`, run `npm run db:push`.
