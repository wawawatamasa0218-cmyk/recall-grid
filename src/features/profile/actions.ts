"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { updateDisplayName } from "./repository";

export async function updateDisplayNameAction(name: string) {
  try { const user = await requireUser(); const value = name.trim(); if (!value || value.length > 40) return { ok: false, message: "公開名は1〜40文字で入力してください。" }; await updateDisplayName(user.id, value); revalidatePath("/settings"); return { ok: true, message: "公開名を更新しました。" }; }
  catch (error) { return { ok: false, message: error instanceof Error ? error.message : "更新できませんでした。" }; }
}
