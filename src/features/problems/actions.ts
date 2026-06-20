"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { assertCanCreateCards } from "@/features/entitlements/service";
import { createCards } from "./repository";
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
