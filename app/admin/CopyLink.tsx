"use client";

import { useState } from "react";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // ignored — clipboard may be unavailable
        }
      }}
      title={url}
      className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-medium text-[color:var(--muted)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
