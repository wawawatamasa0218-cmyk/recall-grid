"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useTransition } from "react";
import { recordReviewAction } from "./actions";
import type { ReviewQuestion } from "./types";

type AnswerState = {
  selected: string | null;
  correct: boolean;
  unknown: boolean;
};

export function ReviewSession({ initialCards }: { initialCards: ReviewQuestion[] }) {
  const [cards, setCards] = useState(initialCards);
  const [answer, setAnswer] = useState<AnswerState | null>(null);
  const [completed, setCompleted] = useState(0);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const card = cards[0];

  if (!card) {
    return <div className="review-complete"><div className="complete-mark">✓</div><span className="eyebrow">ALL CLEAR</span><h2>{completed ? `${completed}問、おつかれさまでした` : "今日の復習はありません"}</h2><p>次の復習日になったカードが、ここに自動で並びます。</p><a href="/problems" className="button primary">新しい問題を作る</a></div>;
  }

  const selectAnswer = (selected: string | null) => {
    if (pending || answer) return;
    const unknown = selected === null;
    const correct = !unknown && selected === card.back;

    startTransition(async () => {
      const response = await recordReviewAction(card.id, correct ? "good" : "again");
      if (!response.ok) {
        setError(response.message ?? "保存できませんでした");
        return;
      }
      setAnswer({ selected, correct, unknown });
      setError("");
    });
  };

  const next = () => {
    setCards((current) => current.slice(1));
    setCompleted((value) => value + 1);
    setAnswer(null);
    setError("");
  };

  return <div className="review-session">
    <div className="review-progress"><span>{completed + 1} / {completed + cards.length}</span><div><i style={{ width: `${(completed / (completed + cards.length)) * 100}%` }} /></div><span>{card.deckName}</span></div>
    <article className={`review-card choice-review-card ${answer ? "answered" : ""}`}>
      <span className="eyebrow">QUESTION</span>
      {card.imageUrl && <img className="review-question-image" src={card.imageUrl} alt="問題の参考画像" />}
      <h2>{card.front}</h2>
      {card.choices.length < 5 && <p className="choice-shortage">異なる答えのカードを5問以上登録すると、5択で表示されます。</p>}
      <div className="answer-choices" aria-label="回答の選択肢">
        {card.choices.map((choice, index) => {
          const isCorrect = answer && choice === card.back;
          const isWrongSelection = answer && answer.selected === choice && !answer.correct;
          return <button
            key={choice}
            type="button"
            className={`${isCorrect ? "correct" : ""} ${isWrongSelection ? "wrong" : ""}`}
            disabled={pending || Boolean(answer)}
            onClick={() => selectAnswer(choice)}
          >
            <span>{String.fromCharCode(65 + index)}</span>
            <strong>{choice}</strong>
          </button>;
        })}
      </div>
      <button className={`unknown-choice ${answer?.unknown ? "selected" : ""}`} type="button" disabled={pending || Boolean(answer)} onClick={() => selectAnswer(null)}>？ わからない</button>
      {pending && <p className="saving-answer" role="status">回答を記録しています…</p>}
      {answer && <div className={`answer-feedback ${answer.correct ? "correct" : "incorrect"}`} role="status">
        <span>{answer.correct ? "正解" : answer.unknown ? "答えを確認しましょう" : "惜しい"}</span>
        <h3>{card.back}</h3>
        {card.explanation && <p>{card.explanation}</p>}
        {card.tags.length > 0 && <div className="tags">{card.tags.map((tag) => <em key={tag}>{tag}</em>)}</div>}
        <button className="button primary" type="button" onClick={next}>次の問題へ →</button>
      </div>}
    </article>
    {error && <p className="form-error centered" role="alert">{error}</p>}
  </div>;
}
