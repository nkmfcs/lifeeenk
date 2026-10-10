"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addEntry, deleteEntry, entryTypeFrom, parseEntry } from "@/lib/finance";

export async function createEntry(formData: FormData) {
  const type = entryTypeFrom(formData.get("type"));
  const parsed = parseEntry(formData);
  if (!parsed.ok) redirect(`/new-expense?type=${type}&error=${parsed.error}`);

  try {
    await addEntry(parsed.value);
  } catch {
    redirect(`/new-expense?type=${type}&error=save`);
  }
  revalidatePath("/", "layout");
  redirect("/finance");
}

export async function removeEntry(formData: FormData) {
  await deleteEntry(String(formData.get("id") ?? ""));
  revalidatePath("/", "layout");
}
