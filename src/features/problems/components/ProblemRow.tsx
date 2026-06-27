"use client";

import type { ClipboardEvent } from "react";
import type { ProblemDraft, ProblemError } from "../types";

type Props = { index: number; row: ProblemDraft; error?: ProblemError; onChange: (id: string, field: keyof Omit<ProblemDraft, "id">, value: string) => void; onDelete: (id: string) => void; onTsvPaste: (id: string, text: string) => void };

export function ProblemRow({ index, row, error, onChange, onDelete, onTsvPaste }: Props) {
  const paste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData("text");
    if (text.includes("\t") || text.includes("\n") || text.split(",").length >= 2) { event.preventDefault(); onTsvPaste(row.id, text); }
  };
  return (
    <div className={`problem-row ${error ? "has-error" : ""}`}>
      <span className="row-number">{index + 1}</span>
      <div><input aria-label={`${index + 1}行目の問題文`} value={row.front} onChange={(e) => onChange(row.id, "front", e.target.value)} onPaste={paste} placeholder="例：日本の首都は？" />{error?.fields.front && <small>{error.fields.front}</small>}</div>
      <div><input aria-label={`${index + 1}行目の答え`} value={row.back} onChange={(e) => onChange(row.id, "back", e.target.value)} placeholder="東京" />{error?.fields.back && <small>{error.fields.back}</small>}</div>
      <input aria-label={`${index + 1}行目の解説`} value={row.explanation} onChange={(e) => onChange(row.id, "explanation", e.target.value)} placeholder="任意の補足" />
      <input aria-label={`${index + 1}行目のタグ`} value={row.tags} onChange={(e) => onChange(row.id, "tags", e.target.value)} placeholder="地理,日本" />
      <button className="icon-button danger" type="button" onClick={() => onDelete(row.id)} aria-label={`${index + 1}行目を削除`}>×</button>
    </div>
  );
}
