export type ReviewResult = "again" | "hard" | "good" | "easy";
export type ReviewCard = { id: string; front: string; back: string; explanation: string; tags: string[]; deckName: string; nextReviewAt: string };
export type ReviewActionResult = { ok: boolean; nextReviewAt?: string; message?: string };
