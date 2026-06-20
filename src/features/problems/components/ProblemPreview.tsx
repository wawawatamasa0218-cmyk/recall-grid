"use client";

import type { ProblemDraft } from "../types";

export function ProblemPreview({ rows, onClose }: { rows: ProblemDraft[]; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="modal" role="dialog" aria-modal="true" aria-label="問題プレビュー" onMouseDown={(e) => e.stopPropagation()}><div className="section-heading"><div><span className="eyebrow">PREVIEW</span><h2>保存前の確認</h2></div><button className="icon-button" onClick={onClose}>×</button></div><div className="preview-list">{rows.map((row, index) => <article className="preview-card" key={row.id}><span>QUESTION {String(index + 1).padStart(2, "0")}</span><h3>{row.front || "（問題文なし）"}</h3><p className="preview-answer">{row.back || "（答えなし）"}</p>{row.explanation && <p>{row.explanation}</p>}{row.tags && <div className="tags">{row.tags.split(",").map((tag) => <em key={tag}>{tag.trim()}</em>)}</div>}</article>)}</div><button className="button secondary full" onClick={onClose}>編集に戻る</button></section></div>;
}
