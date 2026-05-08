"use server";

import { redirect } from "next/navigation";
import { checkPassword, setAdminSession } from "@/lib/auth";

export async function loginAction(_prev: unknown, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    return { error: "Incorrect password." };
  }
  await setAdminSession();
  redirect("/admin");
}
