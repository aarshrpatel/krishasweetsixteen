"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitRsvpAction, type RsvpResult } from "./actions";

type Props = {
  token: string;
  familyName: string;
  maxAttendees: number;
  initialStatus: "pending" | "yes" | "no";
  initialAttendees: number | null;
  initialNotes: string | null;
};

function SubmitButton({ choice }: { choice: "yes" | "no" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="status"
      value={choice}
      disabled={pending}
      className={
        choice === "yes"
          ? "h-12 flex-1 rounded-full bg-[color:var(--primary)] font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          : "h-12 flex-1 rounded-full border border-[color:var(--border)] bg-white font-medium text-[color:var(--muted)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] disabled:opacity-60"
      }
    >
      {pending ? "Sending…" : choice === "yes" ? "Yes, we'll be there" : "Sorry, can't make it"}
    </button>
  );
}

export function RsvpForm({
  token,
  familyName,
  maxAttendees,
  initialStatus,
  initialAttendees,
  initialNotes,
}: Props) {
  const [state, formAction] = useActionState<RsvpResult | null, FormData>(
    submitRsvpAction,
    null,
  );
  const [attendees, setAttendees] = useState<number>(
    initialAttendees ?? maxAttendees,
  );

  const successStatus = state?.ok ? state.status : null;
  const showThankYou = successStatus !== null;

  return (
    <form
      action={formAction}
      className="mt-8 flex flex-col gap-5"
      aria-labelledby="rsvp-heading"
    >
      <input type="hidden" name="token" value={token} />

      <div className="rounded-2xl border border-[color:var(--border)] bg-white/70 p-5">
        <p className="text-xs uppercase tracking-widest text-[color:var(--muted)]">
          Welcome
        </p>
        <p className="font-display mt-1 text-2xl text-[color:var(--foreground)]">
          {familyName}
        </p>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          We have you down for up to{" "}
          <span className="font-semibold text-[color:var(--foreground)]">
            {maxAttendees}
          </span>{" "}
          {maxAttendees === 1 ? "guest" : "guests"}.
        </p>
      </div>

      {maxAttendees > 1 && (
        <label className="flex items-center justify-between rounded-2xl border border-[color:var(--border)] bg-white/70 p-5">
          <span className="text-sm text-[color:var(--foreground)]">
            How many will attend?
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAttendees((n) => Math.max(1, n - 1))}
              className="h-9 w-9 rounded-full border border-[color:var(--border)] text-lg text-[color:var(--muted)] hover:bg-[color:var(--primary-soft)]"
              aria-label="Decrease attendees"
            >
              −
            </button>
            <input
              name="attendees"
              type="number"
              min={1}
              max={maxAttendees}
              value={attendees}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!Number.isNaN(v))
                  setAttendees(Math.max(1, Math.min(maxAttendees, v)));
              }}
              className="w-12 rounded-md border border-[color:var(--border)] bg-white py-1 text-center font-semibold"
            />
            <button
              type="button"
              onClick={() =>
                setAttendees((n) => Math.min(maxAttendees, n + 1))
              }
              className="h-9 w-9 rounded-full border border-[color:var(--border)] text-lg text-[color:var(--muted)] hover:bg-[color:var(--primary-soft)]"
              aria-label="Increase attendees"
            >
              +
            </button>
          </div>
        </label>
      )}
      {maxAttendees === 1 && (
        <input type="hidden" name="attendees" value={1} />
      )}

      <label className="rounded-2xl border border-[color:var(--border)] bg-white/70 p-5">
        <span className="text-sm text-[color:var(--foreground)]">
          Anything you&apos;d like us to know? (optional)
        </span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={initialNotes ?? ""}
          placeholder="Dietary needs, well-wishes, etc."
          className="mt-2 w-full resize-none rounded-md border border-[color:var(--border)] bg-white p-3 text-sm outline-none focus:border-[color:var(--primary)]"
        />
      </label>

      {state && !state.ok && (
        <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {state.error}
        </p>
      )}

      {showThankYou ? (
        <div className="rounded-2xl border border-[color:var(--primary-soft)] bg-[color:var(--primary-soft)]/40 p-5 text-center">
          <p className="font-display text-2xl text-[color:var(--primary)]">
            {successStatus === "yes" ? "Yay! See you soon. 🥂" : "We'll miss you."}
          </p>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Your RSVP has been recorded. You can update it any time from this
            link.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <SubmitButton choice="yes" />
        <SubmitButton choice="no" />
      </div>

      {initialStatus !== "pending" && !showThankYou && (
        <p className="text-center text-xs text-[color:var(--muted)]">
          Previously responded:{" "}
          <span className="font-semibold uppercase">{initialStatus}</span>
          {initialStatus === "yes" && initialAttendees
            ? ` (${initialAttendees})`
            : ""}{" "}
          — you can change it.
        </p>
      )}
    </form>
  );
}
