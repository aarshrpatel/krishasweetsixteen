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
          ? "h-14 flex-1 rounded-full bg-[color:var(--primary)] text-base font-semibold text-[color:var(--background)] shadow-sm transition active:opacity-90 disabled:opacity-60"
          : "h-14 flex-1 rounded-full border border-[color:var(--card-border)] bg-[color:var(--card)] text-base font-medium text-[color:var(--foreground)] transition active:border-[color:var(--primary)] active:text-[color:var(--primary)] disabled:opacity-60"
      }
    >
      {pending
        ? "Sending…"
        : choice === "yes"
          ? "Yes, we'll be there"
          : "Sorry, can't make it"}
    </button>
  );
}

export function RsvpForm({
  token,
  familyName,
  maxAttendees,
  initialStatus,
  initialAttendees,
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
      className="mt-6 flex flex-col gap-4"
      aria-labelledby="rsvp-heading"
    >
      <input type="hidden" name="token" value={token} />

      <div className="rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-5 text-[color:var(--foreground)] shadow-sm">
        <p className="text-xs uppercase tracking-widest text-[color:var(--muted)]">
          Hello
        </p>
        <p className="font-display mt-1 text-2xl">{familyName}!</p>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {maxAttendees === 1
            ? "We've reserved a spot just for you."
            : `We've reserved ${maxAttendees} spots for you and your family.`}
        </p>
      </div>

      {maxAttendees > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-5 text-[color:var(--foreground)] shadow-sm">
          <span className="text-base">How many will attend?</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAttendees((n) => Math.max(1, n - 1))}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--card-border)] text-2xl text-[color:var(--muted)] active:bg-[color:var(--primary-soft)]"
              aria-label="Decrease attendees"
            >
              −
            </button>
            <input
              name="attendees"
              type="number"
              inputMode="numeric"
              min={1}
              max={maxAttendees}
              value={attendees}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!Number.isNaN(v))
                  setAttendees(Math.max(1, Math.min(maxAttendees, v)));
              }}
              className="w-14 rounded-md border border-[color:var(--card-border)] bg-white py-2 text-center text-base font-semibold"
            />
            <button
              type="button"
              onClick={() =>
                setAttendees((n) => Math.min(maxAttendees, n + 1))
              }
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--card-border)] text-2xl text-[color:var(--muted)] active:bg-[color:var(--primary-soft)]"
              aria-label="Increase attendees"
            >
              +
            </button>
          </div>
        </div>
      )}
      {maxAttendees === 1 && (
        <input type="hidden" name="attendees" value={1} />
      )}

      {state && !state.ok && (
        <p className="rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700">
          {state.error}
        </p>
      )}

      {showThankYou ? (
        <div className="rounded-2xl border border-[color:var(--primary)] bg-[color:var(--primary-soft)] p-5 text-center text-[color:var(--foreground)] shadow-sm">
          <p className="font-display text-2xl">
            {successStatus === "yes"
              ? "Yay! See you soon. 🥂"
              : "We'll miss you."}
          </p>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Your RSVP has been recorded. You can update it any time from this
            link.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <SubmitButton choice="yes" />
        <SubmitButton choice="no" />
      </div>

      {initialStatus !== "pending" && !showThankYou && (
        <p className="text-center text-xs text-[color:var(--muted-on-bg)]">
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
