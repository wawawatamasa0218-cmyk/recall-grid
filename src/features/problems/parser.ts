import { createDraft } from "./draft";
import type { ProblemDraft } from "./types";

const HEADER_ALIASES = {
  front: ["問題", "問題文", "question", "front", "q"],
  back: ["答え", "回答", "解答", "answer", "back", "a"],
} as const;

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function isHeaderRow(cells: string[]) {
  const [front = "", back = ""] = cells.map(normalizeHeader);
  return HEADER_ALIASES.front.includes(front as never) && HEADER_ALIASES.back.includes(back as never);
}

function parseCsvRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const source = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if (char === "\n" && !inQuotes) {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

function parseDelimitedRows(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (normalized.includes("\t")) {
    return normalized.split("\n").map((line) => line.split("\t"));
  }
  return parseCsvRows(normalized);
}

function cellsToDrafts(rows: string[][]) {
  const meaningfulRows = rows.filter((cells) => cells.some((cell) => cell.trim()));
  const bodyRows = meaningfulRows.length && isHeaderRow(meaningfulRows[0]) ? meaningfulRows.slice(1) : meaningfulRows;

  return bodyRows.map((cells) => {
    const [front = "", back = "", explanation = "", tags = ""] = cells;
    return createDraft({ front: front.trim(), back: back.trim(), explanation: explanation.trim(), tags: tags.trim() });
  });
}

export function parseTsv(text: string): ProblemDraft[] {
  return cellsToDrafts(text.replace(/\r\n/g, "\n").split("\n").filter((line) => line.trim()).map((line) => line.split("\t")));
}

export function parseCsv(text: string): ProblemDraft[] {
  return cellsToDrafts(parseCsvRows(text));
}

export function parseImportedText(text: string): ProblemDraft[] {
  return cellsToDrafts(parseDelimitedRows(text));
}

export function mergeTsvAtRow(rows: ProblemDraft[], rowId: string, text: string) {
  const parsed = parseImportedText(text);
  if (!parsed.length) return rows;
  const index = rows.findIndex((row) => row.id === rowId);
  if (index < 0) return [...rows, ...parsed];
  return [...rows.slice(0, index), ...parsed, ...rows.slice(index + 1)];
}
