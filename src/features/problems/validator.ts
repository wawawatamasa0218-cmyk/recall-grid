import { isBlankDraft } from "./draft";
import type { ProblemDraft, ProblemError } from "./types";

export function validateDrafts(rows: ProblemDraft[]) {
  const savable = rows.filter((row) => !isBlankDraft(row));
  const errors: ProblemError[] = savable.flatMap((row) => {
    const fields: ProblemError["fields"] = {};
    if (!row.front.trim()) fields.front = "問題文を入力してください";
    if (!row.back.trim()) fields.back = "答えを入力してください";
    return Object.keys(fields).length ? [{ rowId: row.id, fields }] : [];
  });
  return { rows: savable, errors, valid: savable.length > 0 && errors.length === 0 };
}
