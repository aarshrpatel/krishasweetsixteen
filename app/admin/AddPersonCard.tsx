"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { addPersonAction } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 rounded-full bg-[color:var(--primary)] px-5 text-sm font-semibold text-[color:var(--background)] transition hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Adding…" : "Add"}
    </button>
  );
}

export function AddPersonCard() {
  const [state, formAction] = useActionState<
    { error?: string; added?: string } | null,
    FormData
  >(addPersonAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <section className="rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-6 text-[color:var(--foreground)] shadow-sm">
      <h2 className="font-display text-xl">Add a person</h2>
      <p className="mt-1 text-sm text-[color:var(--muted)]">
        Add one guest at a time — useful for last-minute additions.
      </p>
      <form
        action={(fd) => {
          formAction(fd);
          formRef.current?.reset();
        }}
        ref={formRef}
        className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <label className="flex-1 text-xs font-medium uppercase tracking-wider text-[color:var(--muted)]">
          First name
          <input
            name="name"
            type="text"
            required
            placeholder="Mehul"
            className="mt-1 block w-full rounded-md border border-[color:var(--card-border)] bg-white p-2 text-base font-normal normal-case text-[color:var(--foreground)] tracking-normal outline-none focus:border-[color:var(--primary)]"
          />
        </label>
        <label className="text-xs font-medium uppercase tracking-wider text-[color:var(--muted)] sm:w-28">
          People
          <input
            name="people"
            type="number"
            inputMode="numeric"
            min={1}
            defaultValue={1}
            required
            className="mt-1 block w-full rounded-md border border-[color:var(--card-border)] bg-white p-2 text-base font-normal normal-case text-[color:var(--foreground)] tracking-normal outline-none focus:border-[color:var(--primary)]"
          />
        </label>
        <Submit />
      </form>
      {state?.error && (
        <p className="mt-3 text-sm text-rose-700">{state.error}</p>
      )}
      {state?.added && (
        <p className="mt-3 text-sm text-emerald-700">
          Added <span className="font-semibold">{state.added}</span>. Scroll
          down to copy their invite.
        </p>
      )}
    </section>
  );
}
