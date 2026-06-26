import type { ReviewResult, SchedulingState } from "./types";

export function scheduleReview(result: ReviewResult, state: SchedulingState, reviewedAt = new Date()) {
  const correct = result === "good" || result === "easy";
  const nextReviewAt = new Date(reviewedAt);
  if (correct) {
    nextReviewAt.setDate(nextReviewAt.getDate() + 3);
    nextReviewAt.setHours(9, 0, 0, 0);
  } else nextReviewAt.setMinutes(nextReviewAt.getMinutes() + 10);
  return { nextReviewAt, state: { stability: 0, difficulty: 5, reps: state.reps + 1, lapses: state.lapses + (correct ? 0 : 1) } };
}

export function calculateNextReviewAt(result: ReviewResult, reviewedAt = new Date()) {
  return scheduleReview(result, { stability: 0, difficulty: 5, reps: 0, lapses: 0 }, reviewedAt).nextReviewAt;
}
