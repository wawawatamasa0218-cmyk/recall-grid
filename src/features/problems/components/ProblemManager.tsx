"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useTransition } from "react";
import type { Deck } from "@/features/decks/types";
import type { Card } from "../types";
import { deleteProblemAction, updateProblemAction } from "../actions";

export function ProblemManager({ cards, decks }: { cards: Card[]; decks: Deck[] }) {
  const [editing, setEditing] = useState<Card | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const remove = (card: Card) => { if (!confirm("この問題を削除しますか？")) return; startTransition(async () => setMessage((await deleteProblemAction(card.id)).message)); };
  const save = (formData: FormData) => { if (!editing) return; startTransition(async () => { const result = await updateProblemAction(editing.id, formData); setMessage(result.message); if (result.ok) setEditing(null); }); };

  return <>{message && <p className="form-success list-message">{message}</p>}<div className="card-table"><div className="card-table-head"><span>問題文</span><span>答え</span><span>デッキ</span><span>操作</span></div>{cards.map((card) => <div className="card-table-row" key={card.id}><strong>{card.front}</strong><span>{card.back}</span><span>{card.deck?.name}</span><div className="row-actions"><button onClick={() => setEditing(card)}>編集</button><button className="danger-text" onClick={() => remove(card)}>削除</button></div></div>)}</div>{editing && <div className="modal-backdrop" onMouseDown={() => setEditing(null)}><form action={save} className="modal edit-problem-modal" onMouseDown={(event) => event.stopPropagation()}><div className="section-heading"><h2>問題を編集</h2><button type="button" className="icon-button" onClick={() => setEditing(null)}>×</button></div><label>デッキ<select name="deckId" defaultValue={editing.deckId}>{decks.map((deck) => <option value={deck.id} key={deck.id}>{deck.name}</option>)}</select></label><label>問題文<textarea name="front" defaultValue={editing.front} required /></label><label>答え<textarea name="back" defaultValue={editing.back} required /></label><label>解説<textarea name="explanation" defaultValue={editing.explanation} /></label><label>タグ<input name="tags" defaultValue={editing.tags.join(", ")} /></label>{editing.imageUrl && <img src={editing.imageUrl} alt="現在の問題画像" className="edit-image-preview" />}<label>画像（5MBまで）<input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" /></label><button className="button primary" disabled={pending}>{pending ? "保存中…" : "変更を保存"}</button></form></div>}</>;
}
