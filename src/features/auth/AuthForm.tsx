"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "./actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const initialState: AuthState = {};

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  return (
    <div className="auth-card">
      <div className="auth-tabs" role="tablist" aria-label="認証方法">
        <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button" role="tab" aria-selected={mode === "login"}>ログイン</button>
        <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")} type="button" role="tab" aria-selected={mode === "signup"}>新規登録</button>
      </div>
      <AuthModeForm key={mode} mode={mode} />
      <button className="google-button" type="button" onClick={async () => { const supabase = createSupabaseBrowserClient(); await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } }); }}><span>G</span> Googleで続ける</button>
      <a className="forgot-link" href="/auth/forgot-password">パスワードを忘れた場合</a>
      <p className="auth-note">カード情報は不要です。すぐに問題作成と復習を始められます。</p>
    </div>
  );
}

function AuthModeForm({ mode }: { mode: "login" | "signup" }) {
  const [state, action, pending] = useActionState(
    mode === "login" ? signIn : signUp,
    initialState,
  );

  return (
      <form action={action} className="stack-md" aria-busy={pending}>
        <label>メールアドレス<input name="email" type="email" placeholder="you@example.com" autoComplete="email" disabled={pending} required /></label>
        <label>パスワード<input name="password" type="password" placeholder="8文字以上" minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} disabled={pending} required /></label>
        {state.error && <p className="form-error" role="alert">{state.error}</p>}
        {state.message && <p className="form-success" role="status">{state.message}</p>}
        <button className="button primary full" disabled={pending}>{pending ? "処理中…" : mode === "login" ? "ログイン" : "アカウントを作成"}</button>
      </form>
  );
}
