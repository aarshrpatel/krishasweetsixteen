"use client";

import { useState } from "react";

function buildInviteMessage(name: string, url: string) {
  const origin = new URL(url).origin;
  const flyer = `${origin}/flyer.pdf`;
  return `Hi ${name}! You're invited to Krisha's Sweet Sixteen 🥂\nInvitation: ${flyer}\nPlease RSVP here: ${url}`;
}

export function CopyInvite({ name, url }: { name: string; url: string }) {
  const [state, setState] = useState<"idle" | "msg" | "url">("idle");

  async function copy(text: string, kind: "msg" | "url") {
    try {
      await navigator.clipboard.writeText(text);
      setState(kind);
      setTimeout(() => setState("idle"), 1500);
    } catch {
      // ignored — clipboard may be unavailable
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => copy(buildInviteMessage(name, url), "msg")}
        className="rounded-full bg-[color:var(--primary)] px-3 py-1 text-xs font-semibold text-[color:var(--background)] transition hover:opacity-90"
      >
        {state === "msg" ? "Copied!" : "Copy invite"}
      </button>
      <button
        type="button"
        onClick={() => copy(url, "url")}
        title={url}
        className="rounded-full border border-[color:var(--card-border)] px-2 py-1 text-xs text-[color:var(--muted)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
      >
        {state === "url" ? "✓" : "link"}
      </button>
    </div>
  );
}

export function CopyAllInvites({
  invites,
}: {
  invites: { name: string; url: string }[];
}) {
  const [copied, setCopied] = useState<"msgs" | "tsv" | null>(null);

  async function copy(text: string, kind: "msgs" | "tsv") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  if (invites.length === 0) return null;

  const allMessages = invites
    .map(({ name, url }) => buildInviteMessage(name, url))
    .join("\n\n---\n\n");

  // Tab-separated so you can paste into a sheet
  const tsv =
    "Name\tInvite link\n" +
    invites.map(({ name, url }) => `${name}\t${url}`).join("\n");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => copy(allMessages, "msgs")}
        className="rounded-full bg-[color:var(--primary)] px-4 py-1.5 text-xs font-semibold text-[color:var(--background)] transition hover:opacity-90"
      >
        {copied === "msgs"
          ? `Copied ${invites.length} invites!`
          : `Copy all ${invites.length} invites`}
      </button>
      <button
        type="button"
        onClick={() => copy(tsv, "tsv")}
        className="rounded-full border border-[color:var(--card-border)] px-3 py-1.5 text-xs text-[color:var(--muted)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
      >
        {copied === "tsv" ? "Copied!" : "Copy as table"}
      </button>
    </div>
  );
}
