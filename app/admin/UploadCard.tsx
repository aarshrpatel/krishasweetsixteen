"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { uploadFamiliesAction } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 rounded-full bg-[color:var(--primary)] px-5 text-sm font-semibold text-[color:var(--background)] transition hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Uploading…" : "Upload"}
    </button>
  );
}

export function UploadCard() {
  const [state, formAction] = useActionState<
    { error?: string; uploaded?: number } | null,
    FormData
  >(uploadFamiliesAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <section className="rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-6 text-[color:var(--foreground)] shadow-sm">
      <h2 className="font-display text-xl">Upload guest list</h2>
      <p className="mt-1 text-sm text-[color:var(--muted)]">
        Excel (.xlsx) with columns:{" "}
        <code className="rounded bg-[color:var(--primary-soft)] px-1 text-[color:var(--foreground)]">
          First Name
        </code>{" "}
        ·{" "}
        <code className="rounded bg-[color:var(--primary-soft)] px-1 text-[color:var(--foreground)]">
          People
        </code>{" "}
        · optional{" "}
        <code className="rounded bg-[color:var(--primary-soft)] px-1 text-[color:var(--foreground)]">
          Email
        </code>
        ,{" "}
        <code className="rounded bg-[color:var(--primary-soft)] px-1 text-[color:var(--foreground)]">
          Phone
        </code>
        .
      </p>
      <form
        action={(fd) => {
          formAction(fd);
          formRef.current?.reset();
        }}
        ref={formRef}
        className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
      >
        <input
          type="file"
          name="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          required
          className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[color:var(--primary-soft)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[color:var(--foreground)] hover:file:opacity-80"
        />
        <Submit />
      </form>
      {state?.error && (
        <p className="mt-3 text-sm text-rose-700">{state.error}</p>
      )}
      {state?.uploaded ? (
        <p className="mt-3 text-sm text-emerald-700">
          Added {state.uploaded} {state.uploaded === 1 ? "person" : "people"}.
          Scroll down — tap <span className="font-semibold">Copy all invites</span>{" "}
          to grab personalized messages for each one.
        </p>
      ) : null}
    </section>
  );
}
