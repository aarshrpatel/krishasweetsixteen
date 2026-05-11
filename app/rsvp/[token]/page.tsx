import { eq } from "drizzle-orm";
import Image from "next/image";
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
    <main className="confetti-bg flex flex-1 justify-center px-5 py-8">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="relative mx-auto aspect-[2/3] w-48 overflow-hidden rounded-[3rem] border-2 border-[color:var(--primary)] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] sm:w-56">
            <Image
              src="/krisha.jpg"
              alt="Krisha"
              fill
              priority
              sizes="(max-width: 640px) 12rem, 14rem"
              className="object-cover"
            />
          </div>
          <p
            id="rsvp-heading"
            className="font-display mt-6 text-xs uppercase tracking-[0.4em] text-[color:var(--accent)]"
          >
            You&apos;re invited
          </p>
          <h1 className="font-display mt-2 text-3xl text-[color:var(--card)] sm:text-4xl">
            Krisha&apos;s Sweet Sixteen
          </h1>
          <div className="mt-4 flex items-center justify-center gap-3 text-[color:var(--accent)]">
            <span className="h-px w-8 bg-[color:var(--primary)]" />
            <span className="font-display text-base italic">
              August 8, 2026
            </span>
            <span className="h-px w-8 bg-[color:var(--primary)]" />
          </div>
          <p className="mt-3 text-sm text-[color:var(--muted-on-bg)]">
            Please let us know if you&apos;ll join the celebration.
          </p>
        </div>
        <RsvpForm
          token={token}
          familyName={family.name}
          maxAttendees={family.maxAttendees}
          initialStatus={family.status}
          initialAttendees={family.confirmedAttendees}
        />
      </div>
    </main>
  );
}
