"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Deck } from "./types";
import { deleteDeckAction, updateDeckAction } from "./actions";
import { disableShareAction, enableShareAction } from "@/features/sharing/actions";

export function DeckList({ decks }: { decks: Deck[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [sharing, setSharing] = useState<Deck | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("その他");
  const [shareUrl, setShareUrl] = useState("");
  const [names, setNames] = useState(Object.fromEntries(decks.map((deck) => [deck.id, deck.name])));
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const save = (deck: Deck) => startTransition(async () => { const result = await updateDeckAction(deck.id, names[deck.id]); setMessage(result.message ?? ""); if (result.ok) setEditing(null); });
  const remove = (deck: Deck) => { if (!confirm(`「${deck.name}」と中の問題をすべて削除しますか？`)) return; startTransition(async () => setMessage((await deleteDeckAction(deck.id)).message ?? "")); };
  const openShare = (deck: Deck) => { setSharing(deck); setDescription(deck.description ?? ""); setCategory(deck.category ?? "その他"); setShareUrl(deck.shareSlug ? `${window.location.origin}/share/${deck.shareSlug}` : ""); };
  const enable = () => sharing && startTransition(async () => { const result = await enableShareAction(sharing.id, description, category); setMessage(result.message); if (result.url) setShareUrl(result.url); });
  const disable = () => sharing && startTransition(async () => { const result = await disableShareAction(sharing.id); setMessage(result.message); if (result.ok) { setShareUrl(""); setSharing(null); } });

  return <>
    {message && <p className="form-success list-message" role="status">{message}</p>}
    <div className="deck-list">{decks.map((deck, index) => <article key={deck.id}>
      <span className={`deck-badge color-${index % 3}`}>{String(index + 1).padStart(2, "0")}</span>
      <div>{editing === deck.id ? <input aria-label="デッキ名" value={names[deck.id]} onChange={(event) => setNames({ ...names, [deck.id]: event.target.value })} /> : <><Link href={`/decks/${deck.id}`}><h3>{deck.name} {deck.sharingEnabled && <small className="shared-badge">PUBLIC</small>}</h3></Link><p>{deck.description || "問題を追加して学習を始めましょう"}</p></>}</div>
      <div className="row-actions">{editing === deck.id ? <><button disabled={pending} onClick={() => save(deck)}>保存</button><button onClick={() => setEditing(null)}>取消</button></> : <><Link href={`/problems?deck=${deck.id}`}>問題</Link><button onClick={() => openShare(deck)}>共有</button><button onClick={() => setEditing(deck.id)}>編集</button><button className="danger-text" onClick={() => remove(deck)}>削除</button></>}</div>
    </article>)}</div>
    {sharing && <div className="modal-backdrop" onMouseDown={() => setSharing(null)}><section className="modal share-modal" onMouseDown={(event) => event.stopPropagation()}><div className="section-heading"><div><span className="eyebrow">PUBLISH DECK</span><h2>{sharing.name}</h2></div><button className="icon-button" onClick={() => setSharing(null)}>×</button></div><label>紹介文<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="このデッキで学べること" maxLength={500} /></label><label>カテゴリ<select value={category} onChange={(event) => setCategory(event.target.value)}><option>語学</option><option>資格</option><option>学校・受験</option><option>IT・技術</option><option>趣味・教養</option><option>その他</option></select></label>{shareUrl ? <><label>公開リンク<div className="share-url-row"><input readOnly value={shareUrl} /><button className="button secondary" onClick={async () => { await navigator.clipboard.writeText(shareUrl); setMessage("リンクをコピーしました。"); }}>コピー</button></div></label><a href={shareUrl} target="_blank" rel="noreferrer" className="button primary">公開ページを見る</a><button className="button ghost danger-text" disabled={pending} onClick={disable}>公開を停止</button></> : <button className="button primary" disabled={pending} onClick={enable}>{pending ? "公開中…" : "デッキを公開"}</button>}<p className="share-note">公開すると一覧に掲載され、他のユーザーが閲覧・コピーできます。</p></section></div>}
  </>;
}
