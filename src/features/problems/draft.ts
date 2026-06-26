import type { ProblemDraft } from "./types";

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createDraft(values: Partial<Omit<ProblemDraft, "id">> = {}): ProblemDraft {
  return { id: createId(), front: "", back: "", explanation: "", tags: "", ...values };
}

export function isBlankDraft(draft: ProblemDraft) {
  return !draft.front.trim() && !draft.back.trim() && !draft.explanation.trim() && !draft.tags.trim();
}
