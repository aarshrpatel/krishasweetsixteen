import { desc } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { families } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";
import {
  clearAllFamiliesAction,
  deleteFamilyAction,
  logoutAction,
} from "./actions";
import { UploadCard } from "./UploadCard";
import { CopyLink } from "./CopyLink";

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

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[color:var(--primary)]">
            Admin
          </p>
          <h1 className="font-display mt-1 text-3xl">RSVP dashboard</h1>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm text-[color:var(--muted)] hover:text-[color:var(--primary)]"
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

      <div className="mt-8">
        <UploadCard />
      </div>

      <section className="mt-8 rounded-2xl border border-[color:var(--border)] bg-white/80 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">
            Families{" "}
            <span className="text-sm text-[color:var(--muted)]">
              ({rows.length})
            </span>
          </h2>
          {rows.length > 0 && (
            <form action={clearAllFamiliesAction}>
              <button
                type="submit"
                className="text-xs text-rose-600 hover:underline"
                onClick={(e) => {
                  if (
                    !confirm(
                      "Delete ALL families and RSVP responses? This cannot be undone.",
                    )
                  ) {
                    e.preventDefault();
                  }
                }}
              >
                Clear all
              </button>
            </form>
          )}
        </div>

        {rows.length === 0 ? (
          <p className="mt-6 text-sm text-[color:var(--muted)]">
            No families yet. Upload your guest list above to get started.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-[color:var(--muted)]">
                <tr>
                  <th className="py-2 pr-3">Family</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Attending</th>
                  <th className="py-2 pr-3">Notes</th>
                  <th className="py-2 pr-3">Link</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((f) => {
                  const url = `${siteUrl}/rsvp/${f.rsvpToken}`;
                  return (
                    <tr
                      key={f.id}
                      className="border-t border-[color:var(--border)] align-top"
                    >
                      <td className="py-3 pr-3">
                        <div className="font-medium">{f.name}</div>
                        <div className="text-xs text-[color:var(--muted)]">
                          {f.email ?? f.phone ?? "—"}
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <StatusPill status={f.status} />
                      </td>
                      <td className="py-3 pr-3 whitespace-nowrap">
                        {f.status === "yes"
                          ? `${f.confirmedAttendees ?? 0} / ${f.maxAttendees}`
                          : `— / ${f.maxAttendees}`}
                      </td>
                      <td className="py-3 pr-3 max-w-[18rem] text-xs text-[color:var(--muted)]">
                        {f.notes ?? ""}
                      </td>
                      <td className="py-3 pr-3">
                        <CopyLink url={url} />
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
        "rounded-2xl border p-4 " +
        (accent
          ? "border-[color:var(--primary-soft)] bg-[color:var(--primary-soft)]/40"
          : "border-[color:var(--border)] bg-white/80")
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
