"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { assertCanCreateCards } from "@/features/entitlements/service";
import { createCards, deleteCard, updateCard, uploadCardImage } from "./repository";
import { validateDrafts } from "./validator";
import type { ProblemDraft, SaveProblemsResult } from "./types";

export async function saveProblemsAction(deckId: string, drafts: ProblemDraft[]): Promise<SaveProblemsResult> {
  try {
    const user = await requireUser();
    if (!deckId) return { ok: false, message: "保存先のデッキを選んでください。" };
    const result = validateDrafts(drafts);
    if (!result.valid) return { ok: false, message: "問題文と答えの未入力箇所を確認してください。" };
    await assertCanCreateCards(user.id, result.rows.length);
    await createCards(user.id, deckId, result.rows);
    revalidatePath("/problems");
    revalidatePath("/dashboard");
    revalidatePath("/review");
    return { ok: true, message: `${result.rows.length}問を保存しました。`, count: result.rows.length };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "保存に失敗しました。" };
  }
}

export async function updateProblemAction(cardId: string, formData: FormData): Promise<SaveProblemsResult> {
  try {
    const user = await requireUser();
    const front = String(formData.get("front") ?? "").trim();
    const back = String(formData.get("back") ?? "").trim();
    if (!front || !back) return { ok: false, message: "問題文と答えは必須です。" };
    const image = formData.get("image");
    let imagePath: string | undefined;
    if (image instanceof File && image.size > 0) {
      if (image.size > 5 * 1024 * 1024 || !image.type.startsWith("image/")) return { ok: false, message: "画像は5MB以下のJPEG/PNG/WebP/GIFを選んでください。" };
      imagePath = await uploadCardImage(user.id, image);
    }
    await updateCard(user.id, cardId, { deckId: String(formData.get("deckId")), front, back, explanation: String(formData.get("explanation") ?? "").trim(), tags: String(formData.get("tags") ?? "").split(/[,、]/).map((tag) => tag.trim()).filter(Boolean), imagePath });
    revalidatePath("/problems"); revalidatePath("/review");
    return { ok: true, message: "問題を更新しました。" };
  } catch (error) { return { ok: false, message: error instanceof Error ? error.message : "更新できませんでした。" }; }
}

export async function deleteProblemAction(cardId: string): Promise<SaveProblemsResult> {
  try { const user = await requireUser(); await deleteCard(user.id, cardId); revalidatePath("/problems"); revalidatePath("/dashboard"); revalidatePath("/review"); return { ok: true, message: "問題を削除しました。" }; }
  catch (error) { return { ok: false, message: error instanceof Error ? error.message : "削除できませんでした。" }; }
}
