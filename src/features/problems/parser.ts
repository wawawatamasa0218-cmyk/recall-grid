import { createDraft } from "./draft";
import type { ProblemDraft } from "./types";

export function parseTsv(text: string): ProblemDraft[] {
  return text.replace(/\r\n/g, "\n").split("\n").filter((line) => line.trim()).map((line) => {
    const [front = "", back = "", explanation = "", tags = ""] = line.split("\t");
    return createDraft({ front: front.trim(), back: back.trim(), explanation: explanation.trim(), tags: tags.trim() });
  });
}

export function mergeTsvAtRow(rows: ProblemDraft[], rowId: string, text: string) {
  const parsed = parseTsv(text);
  if (!parsed.length) return rows;
  const index = rows.findIndex((row) => row.id === rowId);
  if (index < 0) return [...rows, ...parsed];
  return [...rows.slice(0, index), ...parsed, ...rows.slice(index + 1)];
}
