import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { families } from "@/lib/db/schema";
import { RsvpForm } from "./RsvpForm";

export const dynamic = "force-dynamic";

export default async function RsvpPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [family] = await db
    .select()
    .from(families)
    .where(eq(families.rsvpToken, token))
    .limit(1);

  if (!family) notFound();

  return (
    <main className="confetti-bg flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p
            id="rsvp-heading"
            className="font-display text-xs uppercase tracking-[0.4em] text-[color:var(--primary)]"
          >
            You&apos;re invited
          </p>
          <h1 className="font-display mt-3 text-4xl text-[color:var(--foreground)]">
            Krisha&apos;s Sweet Sixteen
          </h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Please let us know if you&apos;ll join the celebration.
          </p>
        </div>
        <RsvpForm
          token={token}
          familyName={family.name}
          maxAttendees={family.maxAttendees}
          initialStatus={family.status}
          initialAttendees={family.confirmedAttendees}
          initialNotes={family.notes}
        />
      </div>
    </main>
  );
}
