"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addExpense, deleteEntry, parseExpense } from "@/lib/finance";

export async function createExpense(formData: FormData) {
  const parsed = parseExpense(formData);
  if (!parsed.ok) redirect(`/new-expense?error=${parsed.error}`);

  try {
    await addExpense(parsed.value);
  } catch {
    redirect("/new-expense?error=save");
  }
  revalidatePath("/", "layout");
  redirect("/finance");
}

export async function removeEntry(formData: FormData) {
  await deleteEntry(String(formData.get("id") ?? ""));
  revalidatePath("/", "layout");
}
