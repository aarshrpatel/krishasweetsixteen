# Krisha's Sweet Sixteen — RSVP

A small, free-to-host RSVP site:

- 📥 Upload an Excel sheet of invited families
- 🔗 Each family gets a unique RSVP link
- ✅ Families say yes/no (and how many will attend)
- 📧 You get an email per response

**Stack:** Next.js 16 (App Router) · Vercel (Hobby, free) · Neon Postgres
(free) · Resend (free, 100 emails/day) · Drizzle ORM · SheetJS · Tailwind v4.

---

## Deploy in ~10 minutes

### 1. Push this repo to GitHub

```bash
git add .
git commit -m "Initial RSVP app"
gh repo create krishasweetsixteen --public --source=. --remote=origin --push
```

### 2. Create the Vercel project

1. Go to <https://vercel.com/new>, import the repo.
2. Framework preset is auto-detected (Next.js). Click **Deploy** — the first
   deploy will fail because env vars aren't set yet. That's fine.

### 3. Add the database (Neon, free)

In the Vercel project → **Storage** → **Create Database** → **Neon**.
Vercel will provision a free Neon Postgres database and automatically
populate `DATABASE_URL` (and a few other Postgres env vars) into your
project's environment.

### 4. Add the email provider (Resend, free)

1. Sign up at <https://resend.com>.
2. Get an API key from **API Keys**.
3. To send from your own address, add a domain under **Domains** and
   verify it. For testing without a domain, use the built-in
   `onboarding@resend.dev` sender (it can only send to *your* verified
   email, which is perfect for this use case).
4. In the Vercel project → **Settings → Environment Variables**, add:
   - `RESEND_API_KEY` — the key you just created
   - `NOTIFICATION_FROM` — e.g. `Krisha RSVP <onboarding@resend.dev>` or
     `RSVP <rsvp@yourdomain.com>` if you verified a domain
   - `NOTIFICATION_TO` — the inbox you want responses to land in

### 5. Add the remaining env vars

Still in **Settings → Environment Variables**, add:

- `ADMIN_PASSWORD` — pick anything; this is the password for the admin page
- `ADMIN_SECRET` — any long random string (e.g. `openssl rand -hex 32`)
- `NEXT_PUBLIC_SITE_URL` — your Vercel URL (e.g.
  `https://krishasweetsixteen.vercel.app`)

### 6. Push the database schema

From your local machine, with `DATABASE_URL` from Vercel pulled into
`.env.local` (`npx vercel env pull .env.local`):

```bash
npm install
npm run db:push
```

This creates the `families` table on Neon.

### 7. Redeploy

In Vercel, **Deployments → … → Redeploy** the latest deploy. The site is
now live.

---

## Using the site

1. Go to `https://your-site.vercel.app/admin/login` and sign in with
   `ADMIN_PASSWORD`.
2. Upload an Excel (`.xlsx`) file. Required columns:

   | Family Name        | People |
   | ------------------ | ------ |
   | Patel — Mehul fam. | 4      |
   | Shah — Ravi fam.   | 2      |

   Optional columns: `Email`, `Phone`. Column names are case-insensitive
   and several variants are accepted (`Family`, `Number of People`,
   `Attendees`, etc.).

3. The dashboard shows each family with a **Copy link** button — that's
   the personal RSVP URL (`/rsvp/<token>`) to send to them via text /
   email / WhatsApp.
4. When a family clicks their link and submits, you get an email and the
   dashboard updates.

Families can revisit their link to change their answer at any time.

---

## Local development

```bash
npm install
cp .env.example .env.local   # then fill it in
npm run db:push              # creates tables
npm run dev                  # http://localhost:3000
```

For local development you can either:
- run the Vercel-provisioned Neon DB by pulling its URL with
  `npx vercel env pull .env.local`, or
- spin up a separate free Neon project at <https://neon.tech> just for
  development and use that connection string.

To skip emails during local testing, leave `RESEND_API_KEY` blank — RSVPs
will still save and a warning will be logged.

---

## Project layout

```
app/
  page.tsx                   landing
  admin/                     owner dashboard (password-gated)
    page.tsx                 stats + family table
    actions.ts               upload / delete / clear / logout server actions
    UploadCard.tsx, CopyLink.tsx
    login/                   password form
  rsvp/[token]/              public per-family RSVP form
    page.tsx, RsvpForm.tsx, actions.ts
lib/
  db/                        Drizzle schema + client (Neon HTTP)
  auth.ts                    HMAC-signed cookie session
  excel.ts                   SheetJS parser, lenient column matching
  email.ts                   Resend client
drizzle.config.ts
```

See `CLAUDE.md` for architecture notes aimed at future Claude Code sessions.
