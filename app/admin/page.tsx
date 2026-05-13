import { desc } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { families } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";
import { deleteFamilyAction, logoutAction } from "./actions";
import { ClearAllButton } from "./ClearAllButton";
import { UploadCard } from "./UploadCard";
import { AddPersonCard } from "./AddPersonCard";
import { CopyAllInvites, CopyInvite } from "./CopyLink";

export const dynamic = "force-dynamic";

async function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export default async function AdminPage() {
  await requireAdmin();
  const rows = await db
    .select()
    .from(families)
    .orderBy(desc(families.createdAt));
  const siteUrl = await getSiteUrl();

  const totals = rows.reduce(
    (acc, f) => {
      acc.invited += f.maxAttendees;
      if (f.status === "yes") acc.yes += f.confirmedAttendees ?? 0;
      if (f.status === "no") acc.no += f.maxAttendees;
      if (f.status === "pending") acc.pending += f.maxAttendees;
      return acc;
    },
    { invited: 0, yes: 0, no: 0, pending: 0 },
  );

  const invites = rows.map((f) => ({
    name: f.name,
    url: `${siteUrl}/rsvp/${f.rsvpToken}`,
  }));

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[color:var(--accent)]">
            Admin
          </p>
          <h1 className="font-display mt-1 text-3xl text-[color:var(--card)]">
            RSVP dashboard
          </h1>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm text-[color:var(--muted-on-bg)] hover:text-[color:var(--primary)]"
          >
            Sign out
          </button>
        </form>
      </header>

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Invited" value={totals.invited} />
        <Stat label="Attending" value={totals.yes} accent />
        <Stat label="Declined" value={totals.no} />
        <Stat label="Pending" value={totals.pending} />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <UploadCard />
        <AddPersonCard />
      </div>

      <section className="mt-8 rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-6 text-[color:var(--foreground)] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl">
            Invitations{" "}
            <span className="text-sm text-[color:var(--muted)]">
              ({rows.length})
            </span>
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <CopyAllInvites invites={invites} />
            {rows.length > 0 && <ClearAllButton />}
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="mt-6 text-sm text-[color:var(--muted)]">
            No invitations yet. Upload your guest list above to get started.
          </p>
        ) : (
          <>
            <p className="mt-2 text-xs text-[color:var(--muted)]">
              Tap <span className="font-semibold">Copy invite</span> to copy a
              ready-to-send message for that person, then paste it into
              WhatsApp / Messages / etc.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-[color:var(--muted)]">
                  <tr>
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Attending</th>
                    <th className="py-2 pr-3">Invite</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((f) => {
                    const url = `${siteUrl}/rsvp/${f.rsvpToken}`;
                    return (
                      <tr
                        key={f.id}
                        className="border-t border-[color:var(--card-border)] align-top"
                      >
                        <td className="py-3 pr-3">
                          <div className="font-medium">{f.name}</div>
                          {(f.email || f.phone) && (
                            <div className="text-xs text-[color:var(--muted)]">
                              {f.email ?? f.phone}
                            </div>
                          )}
                        </td>
                        <td className="py-3 pr-3">
                          <StatusPill status={f.status} />
                        </td>
                        <td className="py-3 pr-3 whitespace-nowrap">
                          {f.status === "yes"
                            ? `${f.confirmedAttendees ?? 0} / ${f.maxAttendees}`
                            : `— / ${f.maxAttendees}`}
                        </td>
                        <td className="py-3 pr-3">
                          <CopyInvite name={f.name} url={url} />
                        </td>
                        <td className="py-3">
                          <form action={deleteFamilyAction}>
                            <input type="hidden" name="id" value={f.id} />
                            <button
                              type="submit"
                              className="text-xs text-rose-600 hover:underline"
                            >
                              Delete
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={
        "rounded-2xl border p-4 text-[color:var(--foreground)] shadow-sm " +
        (accent
          ? "border-[color:var(--primary)] bg-[color:var(--primary-soft)]"
          : "border-[color:var(--card-border)] bg-[color:var(--card)]")
      }
    >
      <div className="text-xs uppercase tracking-widest text-[color:var(--muted)]">
        {label}
      </div>
      <div className="font-display mt-1 text-3xl">{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: "pending" | "yes" | "no" }) {
  const cls =
    status === "yes"
      ? "bg-emerald-100 text-emerald-700"
      : status === "no"
        ? "bg-rose-100 text-rose-700"
        : "bg-amber-100 text-amber-700";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider ${cls}`}
    >
      {status}
    </span>
  );
}
