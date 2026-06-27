"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { Deck } from "@/features/decks/types";
import { createDraft, isBlankDraft } from "../draft";
import { mergeTsvAtRow, parseImportedText } from "../parser";
import { validateDrafts } from "../validator";
import { saveProblemsAction } from "../actions";
import type { ProblemDraft, SaveProblemsResult } from "../types";
import { ProblemRow } from "./ProblemRow";
import { ProblemPreview } from "./ProblemPreview";

const initialRows = () => Array.from({ length: 3 }, () => createDraft());

export function ProblemBulkEditor({ decks }: { decks: Deck[] }) {
  const [rows, setRows] = useState(initialRows);
  const [deckId, setDeckId] = useState(decks[0]?.id ?? "");
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState<SaveProblemsResult | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const validation = useMemo(() => validateDrafts(rows), [rows]);
  const errorMap = new Map(validation.errors.map((error) => [error.rowId, error]));

  const update = (id: string, field: keyof Omit<ProblemDraft, "id">, value: string) => setRows((current) => current.map((row) => row.id === id ? { ...row, [field]: value } : row));
  const pasteRows = (id: string, text: string) => setRows((current) => mergeTsvAtRow(current, id, text));
  const importRows = (text: string, source = "貼り付け") => {
    const parsed = parseImportedText(text);
    if (!parsed.length) {
      setImportMessage(`${source}から読み込める問題がありませんでした。`);
      return;
    }
    setRows((current) => [...current.filter((row) => !isBlankDraft(row)), ...parsed]);
    setImportMessage(`${source}から${parsed.length}問を読み込みました。`);
  };
  const decodeFile = (buffer: ArrayBuffer) => {
    const utf8 = new TextDecoder("utf-8").decode(buffer);
    if (!utf8.includes("�")) return utf8;
    try {
      return new TextDecoder("shift_jis").decode(buffer);
    } catch {
      return utf8;
    }
  };
  const importFile = async (file: File | null) => {
    if (!file) return;
    const allowed = /\.(csv|tsv|txt)$/i.test(file.name);
    if (!allowed) {
      setImportMessage("CSV / TSV / TXT ファイルを選んでください。ExcelはCSV保存して読み込めます。");
      return;
    }
    importRows(decodeFile(await file.arrayBuffer()), file.name);
  };
  const save = () => startTransition(async () => { const result = await saveProblemsAction(deckId, rows); setMessage(result); if (result.ok) setRows(initialRows()); });

  if (!decks.length) return <div className="empty-state"><div className="empty-icon">＋</div><h2>先にデッキを作りましょう</h2><p>問題には保存先が必要です。デッキを1つ作ると、ここでまとめて入力できます。</p><Link className="button primary" href="/decks">デッキを作る</Link></div>;

  return <section className="editor-card">
    <div className="editor-toolbar"><label>保存先<select value={deckId} onChange={(e) => setDeckId(e.target.value)}>{decks.map((deck) => <option key={deck.id} value={deck.id}>{deck.name}</option>)}</select></label><label>問題タイプ<select disabled><option>一問一答</option></select></label><div className="toolbar-tip"><kbd>CSV / TSV</kbd><span>Excelのコピー貼り付け・CSV読み込み対応</span></div></div>
    <div className="paste-zone import-zone"><textarea aria-label="CSVまたはTSV一括貼り付け" placeholder={'Excel / CSVから「問題文, 答え, 解説, タグ」の4列を貼り付け'} onPaste={(e) => { e.preventDefault(); importRows(e.clipboardData.getData("text")); }} /><label className="file-import-button">CSVを読み込む<input type="file" accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values" onChange={(e) => { void importFile(e.target.files?.[0] ?? null); e.currentTarget.value = ""; }} /></label></div>
    {importMessage && <p className="import-message">{importMessage}</p>}
    <div className="problem-grid"><div className="problem-header"><span>No.</span><span>問題文 *</span><span>答え *</span><span>解説</span><span>タグ</span><span></span></div>{rows.map((row, index) => <ProblemRow key={row.id} index={index} row={row} error={errorMap.get(row.id)} onChange={update} onDelete={(id) => setRows((current) => current.length === 1 ? [createDraft()] : current.filter((row) => row.id !== id))} onTsvPaste={pasteRows} />)}</div>
    <div className="editor-footer"><button className="button ghost" type="button" onClick={() => setRows((current) => [...current, createDraft()])}>＋ 行を追加</button><span className="row-count">{validation.rows.length}問を入力中</span><div className="footer-actions"><button className="button secondary" type="button" disabled={!validation.rows.length} onClick={() => setPreview(true)}>プレビュー</button><button className="button primary" type="button" disabled={pending || !validation.rows.length} onClick={save}>{pending ? "保存中…" : "まとめて保存"}</button></div></div>
    {message && <p className={message.ok ? "form-success status-message" : "form-error status-message"}>{message.message}</p>}
    {preview && <ProblemPreview rows={validation.rows} onClose={() => setPreview(false)} />}
  </section>;
}
