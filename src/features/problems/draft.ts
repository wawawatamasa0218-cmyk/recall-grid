import type { ProblemDraft } from "./types";

export function createDraft(values: Partial<Omit<ProblemDraft, "id">> = {}): ProblemDraft {
  return { id: crypto.randomUUID(), front: "", back: "", explanation: "", tags: "", ...values };
}

export function isBlankDraft(draft: ProblemDraft) {
  return !draft.front.trim() && !draft.back.trim() && !draft.explanation.trim() && !draft.tags.trim();
}
