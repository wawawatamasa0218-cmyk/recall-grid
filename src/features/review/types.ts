export type ReviewResult = "again" | "hard" | "good" | "easy";
export type SchedulingState = { stability: number; difficulty: number; reps: number; lapses: number };
export type ReviewCard = { id: string; front: string; back: string; explanation: string; tags: string[]; imageUrl?: string; deckName: string; nextReviewAt: string } & SchedulingState;
export type ReviewQuestion = ReviewCard & { choices: string[] };
export type ReviewActionResult = { ok: boolean; nextReviewAt?: string; message?: string };
