"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 rounded-full bg-[color:var(--primary)] px-6 font-semibold text-[color:var(--background)] transition hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export default function AdminLoginPage() {
  const [state, formAction] = useActionState<{ error?: string } | null, FormData>(
    loginAction,
    null,
  );

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-8 text-[color:var(--foreground)] shadow-lg"
      >
        <h1 className="font-display text-2xl">Admin sign-in</h1>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          Enter the admin password to continue.
        </p>
        <label className="mt-6 block text-sm font-medium">
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-2 w-full rounded-md border border-[color:var(--card-border)] bg-white p-3 outline-none focus:border-[color:var(--primary)]"
          />
        </label>
        {state?.error && (
          <p className="mt-3 text-sm text-rose-700">{state.error}</p>
        )}
        <div className="mt-6 flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </main>
  );
}
