# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

A Next.js 16 (App Router) RSVP site for Krisha's Sweet Sixteen, deployed on
Vercel. The owner uploads an Excel guest list in the admin dashboard, the
site generates a per-guest RSVP link, the owner copies a personalized
invite message and forwards it via WhatsApp/text, and guests respond
yes/no. The dashboard updates as responses come in.

There is no email integration — explicitly removed at the user's request
because they wanted to control distribution themselves.

Free-tier stack: Vercel (Hobby) + Neon Postgres (free tier, via Vercel
Marketplace).

## Common commands

```bash
npm run dev            # Next.js dev server (Turbopack) on :3000
npm run build          # Production build
npm run lint           # ESLint
npm run db:generate    # Generate a SQL migration from schema changes
npm run db:push        # Push schema directly to DATABASE_URL (use this for first-time setup)
npm run db:studio      # Drizzle Studio (browse the DB in a web UI)
```

There are no tests. Verification is `npm run build` + manually clicking
through `/admin`, `/rsvp/<token>`, and the upload flow with a real
xlsx file.

## Required env vars

Listed in `.env.example`. The app fails fast at startup if `DATABASE_URL`
or `ADMIN_SECRET` are missing.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string |
| `ADMIN_PASSWORD` | Plaintext password for the `/admin/login` form |
| `ADMIN_SECRET` | HMAC key for signing the admin session cookie |
| `NEXT_PUBLIC_SITE_URL` | Used to render absolute RSVP links in the admin table |

## Architecture

Three surfaces share one Postgres table (`families`):

1. **`/` (landing)** — static page that points guests to their personal link.
2. **`/admin`** — owner-only dashboard. Auth is a simple HMAC-signed cookie
   set after the password check (`lib/auth.ts`); there is no users table.
   Server actions in `app/admin/actions.ts` handle Excel upload, delete,
   clear-all, and logout. Upload parses the xlsx with SheetJS
   (`lib/excel.ts`), generates a 12-char `nanoid` per row for the RSVP
   token, and bulk-inserts. The dashboard table includes `CopyInvite`
   (per-row, copies a personalized message) and `CopyAllInvites` (copies
   all rows as a multi-line block).
3. **`/rsvp/[token]`** — public per-guest RSVP form. The token is the only
   credential — anyone with the link can submit. The submit action
   (`app/rsvp/[token]/actions.ts`) updates the row in place; revisiting
   the link lets the guest change their answer.

### Data model

Single table `families` (see `lib/db/schema.ts`). Each row holds a
`name` (first name shown in the invite greeting), `maxAttendees` cap,
a `status` enum (`pending` / `yes` / `no`), and an optional
`confirmedAttendees` count which is set only when status is `yes`. The
token is unique and indexed. The `notes`, `email`, and `phone` columns
are vestigial — kept on the table but no UI surfaces them. Don't restore
the notes field without asking; it was deliberately removed.

### Excel parsing

`lib/excel.ts` accepts column-name variants for the name field
(`First Name` / `Firstname` / `First` / `Name` / `Family Name`) and the
attendee count (`People` / `Attendees` / `Number of People`). Matching
is case-insensitive and trim-tolerant. Errors carry the offending row
number so the admin sees a useful message. If you need to support a new
column, add it to the `pick(...)` call.

### Invite message format

Hardcoded in `app/admin/CopyLink.tsx::buildInviteMessage`:

```
Hi {name}! You're invited to Krisha's Sweet Sixteen 🥂
Please RSVP here: {url}
```

Both `CopyInvite` and `CopyAllInvites` go through this single function,
so changing the wording is a one-line edit.

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
  Theme is **navy + champagne gold** (dark body, cream cards). The palette
  is `--background` / `--background-deep` (navy), `--primary` (gold),
  `--primary-soft` (pale gold), `--accent` (lighter gold), `--card` (cream
  card), `--card-border` (gold-tinted), `--foreground` (dark text on
  cards), `--on-bg` and `--muted-on-bg` (text on the navy body). Don't
  hardcode hex; reuse these.
- The RSVP page is phone-first: 44px+ tap targets, `inputMode="numeric"`
  on the count input, 16px+ font on inputs to prevent iOS auto-zoom,
  full-width stacked submit buttons.
- Fonts are loaded via `next/font/google` in `app/layout.tsx`
  (Inter + Playfair Display). Use `font-display` for the serif heading look.
- After changing `lib/db/schema.ts`, run `npm run db:push`.
- The hero photo lives at `public/krisha.jpg`. The RSVP page renders it
  with `next/image` and `priority`.
