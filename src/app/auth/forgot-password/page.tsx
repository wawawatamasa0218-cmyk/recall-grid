"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type AuthState } from "@/features/auth/actions";

const initialState: AuthState = {};
export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialState);
  return <main className="system-page"><form action={action} className="system-card stack-md"><span className="system-code">RESET</span><h1>パスワード再設定</h1><p>登録したメールアドレスへ再設定リンクを送ります。</p><label>メールアドレス<input name="email" type="email" autoComplete="email" required /></label>{state.error && <p className="form-error">{state.error}</p>}{state.message && <p className="form-success">{state.message}</p>}<button className="button primary" disabled={pending}>{pending ? "送信中…" : "再設定メールを送る"}</button><Link href="/">ログインへ戻る</Link></form></main>;
}
