export type ProblemDraft = { id: string; front: string; back: string; explanation: string; tags: string };
export type ProblemError = { rowId: string; fields: Partial<Record<"front" | "back", string>> };
export type Card = { id: string; userId: string; deckId: string; front: string; back: string; explanation: string; tags: string[]; nextReviewAt: string; createdAt: string; deck?: { name: string } | null };
export type SaveProblemsResult = { ok: boolean; message: string; count?: number };
