# Krisha's Sweet Sixteen — RSVP

A small, free-to-host RSVP site:

- 📥 Upload an Excel sheet of invited people
- 🔗 Each person gets a unique RSVP link
- 📋 One tap copies a ready-to-send invite message — you forward it via WhatsApp / text
- ✅ Guests reply yes/no (and how many will attend); the dashboard updates live

**Stack:** Next.js 16 (App Router) · Vercel (Hobby, free) · Neon Postgres
(free) · Drizzle ORM · SheetJS · Tailwind v4.

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

### 4. Add the remaining env vars

In **Settings → Environment Variables**, add:

- `ADMIN_PASSWORD` — pick anything; this is the password for the admin page
- `ADMIN_SECRET` — any long random string (e.g. `openssl rand -hex 32`)
- `NEXT_PUBLIC_SITE_URL` — your Vercel URL (e.g.
  `https://krishasweetsixteen.vercel.app`)

### 5. Push the database schema

From your local machine, with `DATABASE_URL` from Vercel pulled into
`.env.local` (`npx vercel env pull .env.local`):

```bash
npm install
npm run db:push
```

This creates the `families` table on Neon.

### 6. Redeploy

In Vercel, **Deployments → … → Redeploy** the latest deploy. The site is
now live.

---

## Using the site

1. Go to `https://your-site.vercel.app/admin/login` and sign in with
   `ADMIN_PASSWORD`.
2. Upload an Excel (`.xlsx`) file. Required columns:

   | First Name | People |
   | ---------- | ------ |
   | Mehul      | 4      |
   | Ravi       | 2      |

   Use the first name of whoever you'd like the invitation greeting
   addressed to. Column names are case-insensitive and several variants
   are accepted (`Name`, `Family Name`, `Number of People`, `Attendees`,
   etc.).

3. After upload, each row in the dashboard has a **Copy invite** button.
   Tap it → a personalized message ("Hi Mehul! You're invited to Krisha's
   Sweet Sixteen 🥂 Please RSVP here: …") is copied to your clipboard.
   Paste it into WhatsApp / Messages / iMessage / etc.
4. There's also a **Copy all invites** button that copies one block per
   guest separated by `---` — useful for bulk reviewing.
5. When someone opens their link and submits, the dashboard updates live
   (totals at the top + per-row status).

Guests can revisit their link to change their answer at any time.

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

---

## Project layout

```
app/
  page.tsx                   landing
  admin/                     owner dashboard (password-gated)
    page.tsx                 stats + invitations table
    actions.ts               upload / delete / clear / logout server actions
    UploadCard.tsx           Excel upload form
    CopyLink.tsx             CopyInvite + CopyAllInvites client buttons
    login/                   password form
  rsvp/[token]/              public per-guest RSVP form
    page.tsx, RsvpForm.tsx, actions.ts
lib/
  db/                        Drizzle schema + client (Neon HTTP)
  auth.ts                    HMAC-signed cookie session
  excel.ts                   SheetJS parser, lenient column matching
drizzle.config.ts
```

See `CLAUDE.md` for architecture notes aimed at future Claude Code sessions.
