"use client";

import { clearAllFamiliesAction } from "./actions";

export function ClearAllButton() {
  return (
    <form action={clearAllFamiliesAction}>
      <button
        type="submit"
        className="text-xs text-rose-600 hover:underline"
        onClick={(e) => {
          if (
            !confirm(
              "Delete ALL families and RSVP responses? This cannot be undone.",
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        Clear all
      </button>
    </form>
  );
}
