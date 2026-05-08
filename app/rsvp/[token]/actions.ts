"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { families } from "@/lib/db/schema";
import { sendRsvpNotification } from "@/lib/email";

const Schema = z.object({
  token: z.string().min(1),
  status: z.enum(["yes", "no"]),
  attendees: z.coerce.number().int().min(0).optional(),
  notes: z.string().max(2000).optional(),
});

export type RsvpResult =
  | { ok: true; status: "yes" | "no"; attendees: number | null }
  | { ok: false; error: string };

export async function submitRsvpAction(
  _prev: RsvpResult | null,
  formData: FormData,
): Promise<RsvpResult> {
  const parsed = Schema.safeParse({
    token: formData.get("token"),
    status: formData.get("status"),
    attendees: formData.get("attendees") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: "Please fill in the form correctly." };
  }
  const { token, status, attendees, notes } = parsed.data;

  const [family] = await db
    .select()
    .from(families)
    .where(eq(families.rsvpToken, token))
    .limit(1);
  if (!family) return { ok: false, error: "Invitation not found." };

  let confirmed: number | null = null;
  if (status === "yes") {
    if (attendees === undefined || attendees < 1) {
      return {
        ok: false,
        error: "Please tell us how many people will attend.",
      };
    }
    if (attendees > family.maxAttendees) {
      return {
        ok: false,
        error: `We have you down for up to ${family.maxAttendees} ${
          family.maxAttendees === 1 ? "guest" : "guests"
        }.`,
      };
    }
    confirmed = attendees;
  }

  await db
    .update(families)
    .set({
      status,
      confirmedAttendees: confirmed,
      notes: notes?.trim() || null,
      respondedAt: new Date(),
    })
    .where(eq(families.id, family.id));

  // Fire-and-mostly-forget the email so a transient Resend error doesn't
  // block the user's RSVP from being recorded.
  try {
    await sendRsvpNotification({
      familyName: family.name,
      status,
      confirmedAttendees: confirmed,
      maxAttendees: family.maxAttendees,
      notes: notes?.trim() || null,
    });
  } catch (e) {
    console.error("[rsvp] notification failed", e);
  }

  revalidatePath(`/rsvp/${token}`);
  revalidatePath("/admin");
  return { ok: true, status, attendees: confirmed };
}
