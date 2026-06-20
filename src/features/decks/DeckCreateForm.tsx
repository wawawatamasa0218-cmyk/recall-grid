"use client";

import { useActionState, useEffect, useRef } from "react";
import { createDeckAction, type DeckActionState } from "./actions";

const initialState: DeckActionState = { ok: false };

export function DeckCreateForm({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState(createDeckAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form action={action} ref={formRef} className="deck-create-form">
      <div className="field-with-message">
        <input
          name="name"
          aria-label="デッキ名"
          placeholder="例：英単語、基本情報技術者"
          maxLength={80}
          disabled={disabled || pending}
          required
        />
        {state.message && (
          <small className={state.ok ? "form-success" : "form-error"} role="status">
            {state.message}
          </small>
        )}
      </div>
      <button className="button primary" disabled={disabled || pending}>
        {pending ? "作成中…" : disabled ? "上限に達しました" : "作成する"}
      </button>
    </form>
  );
}
