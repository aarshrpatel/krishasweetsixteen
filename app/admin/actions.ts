"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { families } from "@/lib/db/schema";
import { parseFamilies } from "@/lib/excel";
import { clearAdminSession, requireAdmin } from "@/lib/auth";

export async function uploadFamiliesAction(
  _prev: { error?: string; uploaded?: number } | null,
  formData: FormData,
) {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose an Excel (.xlsx) file." };
  }

  let parsed;
  try {
    const buf = await file.arrayBuffer();
    parsed = parseFamilies(buf);
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Could not read the file.",
    };
  }
  if (parsed.length === 0) {
    return { error: "No families found in the file." };
  }

  const rows = parsed.map((f) => ({ ...f, rsvpToken: nanoid(12) }));
  await db.insert(families).values(rows);
  revalidatePath("/admin");
  return { uploaded: rows.length };
}

export async function deleteFamilyAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await db.delete(families).where(eq(families.id, id));
  revalidatePath("/admin");
}

export async function clearAllFamiliesAction() {
  await requireAdmin();
  await db.delete(families);
  revalidatePath("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}
