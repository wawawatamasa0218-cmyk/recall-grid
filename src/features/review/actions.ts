"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { calculateNextReviewAt } from "./scheduler";
import { saveReview } from "./repository";
import type { ReviewActionResult, ReviewResult } from "./types";

export async function recordReviewAction(cardId: string, result: ReviewResult): Promise<ReviewActionResult> {
  try {
    const user = await requireUser();
    const reviewedAt = new Date();
    const nextReviewAt = calculateNextReviewAt(result, reviewedAt);
    await saveReview(user.id, cardId, result, reviewedAt, nextReviewAt);
    revalidatePath("/review");
    revalidatePath("/dashboard");
    return { ok: true, nextReviewAt: nextReviewAt.toISOString() };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "復習結果を保存できませんでした。" };
  }
}
