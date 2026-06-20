import type { ReviewResult } from "./types";

const DAYS_BY_RESULT: Record<ReviewResult, number> = { again: 0, hard: 1, good: 3, easy: 7 };

export function calculateNextReviewAt(result: ReviewResult, reviewedAt = new Date()) {
  const next = new Date(reviewedAt);
  next.setDate(next.getDate() + DAYS_BY_RESULT[result]);
  if (result === "again") next.setMinutes(next.getMinutes() + 10);
  else next.setHours(9, 0, 0, 0);
  return next;
}
