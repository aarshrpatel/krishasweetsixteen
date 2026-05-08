import { Resend } from "resend";

type Args = {
  familyName: string;
  status: "yes" | "no";
  confirmedAttendees: number | null;
  maxAttendees: number;
  notes: string | null;
};

export async function sendRsvpNotification(args: Args) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFICATION_TO;
  const from = process.env.NOTIFICATION_FROM;

  if (!apiKey || !to || !from) {
    console.warn(
      "[email] Resend not configured (RESEND_API_KEY / NOTIFICATION_TO / NOTIFICATION_FROM); skipping notification",
    );
    return { sent: false, reason: "not-configured" as const };
  }

  const subject =
    args.status === "yes"
      ? `RSVP YES — ${args.familyName} (${args.confirmedAttendees ?? "?"}/${args.maxAttendees})`
      : `RSVP NO — ${args.familyName}`;

  const lines = [
    `Family: ${args.familyName}`,
    `Status: ${args.status.toUpperCase()}`,
    args.status === "yes"
      ? `Attending: ${args.confirmedAttendees ?? 0} of ${args.maxAttendees}`
      : null,
    args.notes ? `Notes: ${args.notes}` : null,
    "",
    `— Krisha's Sweet Sixteen RSVP`,
  ].filter(Boolean) as string[];

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to,
    subject,
    text: lines.join("\n"),
  });

  if (result.error) {
    console.error("[email] Resend error", result.error);
    return { sent: false, reason: "send-error" as const, error: result.error };
  }
  return { sent: true as const };
}
