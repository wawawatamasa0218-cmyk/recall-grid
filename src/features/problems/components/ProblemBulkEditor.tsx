"use client";

import { useMemo, useState, useTransition } from "react";
import type { Deck } from "@/features/decks/types";
import { createDraft, isBlankDraft } from "../draft";
import { mergeTsvAtRow, parseTsv } from "../parser";
import { validateDrafts } from "../validator";
import { saveProblemsAction } from "../actions";
import type { ProblemDraft, SaveProblemsResult } from "../types";
import { ProblemRow } from "./ProblemRow";
import { ProblemPreview } from "./ProblemPreview";

const initialRows = () => Array.from({ length: 3 }, () => createDraft());

export function ProblemBulkEditor({ decks, currentCardCount, maxCards }: { decks: Deck[]; currentCardCount: number; maxCards: number }) {
  const [rows, setRows] = useState(initialRows);
  const [deckId, setDeckId] = useState(decks[0]?.id ?? "");
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState<SaveProblemsResult | null>(null);
  const [pending, startTransition] = useTransition();
  const validation = useMemo(() => validateDrafts(rows), [rows]);
  const remaining = Math.max(0, maxCards - currentCardCount);
  const exceedsLimit = validation.rows.length > remaining;
  const errorMap = new Map(validation.errors.map((error) => [error.rowId, error]));

  const update = (id: string, field: keyof Omit<ProblemDraft, "id">, value: string) => setRows((current) => current.map((row) => row.id === id ? { ...row, [field]: value } : row));
  const pasteRows = (id: string, text: string) => setRows((current) => mergeTsvAtRow(current, id, text));
  const pasteArea = (text: string) => { const parsed = parseTsv(text); if (parsed.length) setRows((current) => [...current.filter((row) => !isBlankDraft(row)), ...parsed]); };
  const save = () => startTransition(async () => { const result = await saveProblemsAction(deckId, rows); setMessage(result); if (result.ok) setRows(initialRows()); });

  if (!decks.length) return <div className="empty-state"><div className="empty-icon">＋</div><h2>先にデッキを作りましょう</h2><p>問題には保存先が必要です。デッキを1つ作ると、ここでまとめて入力できます。</p><a className="button primary" href="/decks">デッキを作る</a></div>;

  return <section className="editor-card">
    <div className="editor-toolbar"><label>保存先<select value={deckId} onChange={(e) => setDeckId(e.target.value)}>{decks.map((deck) => <option key={deck.id} value={deck.id}>{deck.name}</option>)}</select></label><label>問題タイプ<select disabled><option>一問一答</option></select></label><div className="toolbar-tip"><kbd>TSV</kbd><span>Excelの4列をそのまま貼り付け</span></div></div>
    <div className="paste-zone"><textarea aria-label="TSV一括貼り付け" placeholder={'Excelから「問題文 / 答え / 解説 / タグ」の列をコピーして、ここに貼り付け'} onPaste={(e) => { e.preventDefault(); pasteArea(e.clipboardData.getData("text")); }} /></div>
    <div className="problem-grid"><div className="problem-header"><span>No.</span><span>問題文 *</span><span>答え *</span><span>解説</span><span>タグ</span><span></span></div>{rows.map((row, index) => <ProblemRow key={row.id} index={index} row={row} error={errorMap.get(row.id)} onChange={update} onDelete={(id) => setRows((current) => current.length === 1 ? [createDraft()] : current.filter((row) => row.id !== id))} onTsvPaste={pasteRows} />)}</div>
    <div className="editor-footer"><button className="button ghost" type="button" onClick={() => setRows((current) => [...current, createDraft()])} disabled={remaining === 0}>＋ 行を追加</button><span className={`row-count ${exceedsLimit ? "limit-error" : ""}`}>{validation.rows.length}問を入力中 · あと{remaining}問登録可</span><div className="footer-actions"><button className="button secondary" type="button" disabled={!validation.rows.length} onClick={() => setPreview(true)}>プレビュー</button><button className="button primary" type="button" disabled={pending || !validation.rows.length || exceedsLimit || remaining === 0} onClick={save}>{pending ? "保存中…" : "まとめて保存"}</button></div></div>
    {exceedsLimit && <p className="form-error status-message" role="alert">プランの残り登録数を超えています。{validation.rows.length - remaining}行減らしてください。</p>}
    {message && <p className={message.ok ? "form-success status-message" : "form-error status-message"}>{message.message}</p>}
    {preview && <ProblemPreview rows={validation.rows} onClose={() => setPreview(false)} />}
  </section>;
}
