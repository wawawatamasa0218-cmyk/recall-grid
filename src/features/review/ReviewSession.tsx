"use client";

import { useState, useTransition } from "react";
import { recordReviewAction } from "./actions";
import type { ReviewCard, ReviewResult } from "./types";

const choices: { result: ReviewResult; label: string; interval: string }[] = [
  { result: "again", label: "もう一度", interval: "10分" }, { result: "hard", label: "難しい", interval: "1日" }, { result: "good", label: "できた", interval: "3日" }, { result: "easy", label: "簡単", interval: "7日" },
];

export function ReviewSession({ initialCards }: { initialCards: ReviewCard[] }) {
  const [cards, setCards] = useState(initialCards);
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const card = cards[0];

  if (!card) return <div className="review-complete"><div className="complete-mark">✓</div><span className="eyebrow">ALL CLEAR</span><h2>{completed ? `${completed}問、おつかれさまでした` : "今日の復習はありません"}</h2><p>次の復習日になったカードが、ここに自動で並びます。</p><a href="/problems" className="button primary">新しい問題を作る</a></div>;

  const answer = (result: ReviewResult) => startTransition(async () => { const response = await recordReviewAction(card.id, result); if (!response.ok) { setError(response.message ?? "保存できませんでした"); return; } setCards((current) => current.slice(1)); setCompleted((value) => value + 1); setRevealed(false); setError(""); });

  return <div className="review-session"><div className="review-progress"><span>{completed + 1} / {completed + cards.length}</span><div><i style={{ width: `${(completed / (completed + cards.length)) * 100}%` }} /></div><span>{card.deckName}</span></div><article className={`review-card ${revealed ? "revealed" : ""}`}><span className="eyebrow">QUESTION</span><h2>{card.front}</h2>{!revealed ? <button className="button primary reveal-button" onClick={() => setRevealed(true)}>答えを見る</button> : <div className="answer-area"><span className="eyebrow">ANSWER</span><h3>{card.back}</h3>{card.explanation && <p>{card.explanation}</p>}{card.tags.length > 0 && <div className="tags">{card.tags.map((tag) => <em key={tag}>{tag}</em>)}</div>}</div>}</article>{revealed && <div className="review-choices">{choices.map((choice) => <button key={choice.result} className={choice.result} disabled={pending} onClick={() => answer(choice.result)}><strong>{choice.label}</strong><span>{choice.interval}後</span></button>)}</div>}{error && <p className="form-error centered">{error}</p>}</div>;
}
