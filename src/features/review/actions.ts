"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { scheduleReview } from "./scheduler";
import { getSchedulingState, saveReview } from "./repository";
import type { ReviewActionResult, ReviewResult } from "./types";

export async function recordReviewAction(cardId: string, result: ReviewResult): Promise<ReviewActionResult> {
  try {
    const user = await requireUser();
    const reviewedAt = new Date();
    const currentState = await getSchedulingState(user.id, cardId);
    const scheduled = scheduleReview(result, currentState, reviewedAt);
    await saveReview(user.id, cardId, result, reviewedAt, scheduled.nextReviewAt, scheduled.state);
    revalidatePath("/review");
    revalidatePath("/dashboard");
    return { ok: true, nextReviewAt: scheduled.nextReviewAt.toISOString() };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "復習結果を保存できませんでした。" };
  }
}
