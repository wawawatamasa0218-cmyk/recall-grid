"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  return <main className="system-page"><form className="system-card stack-md" onSubmit={async (event) => { event.preventDefault(); setPending(true); const form = new FormData(event.currentTarget); const password = String(form.get("password")); const { error } = await createSupabaseBrowserClient().auth.updateUser({ password }); setPending(false); if (error) setMessage(error.message); else { setMessage("更新しました。"); setTimeout(() => router.push("/dashboard"), 800); } }}><span className="system-code">SECURITY</span><h1>新しいパスワード</h1><label>パスワード<input name="password" type="password" minLength={8} autoComplete="new-password" required /></label>{message && <p role="status">{message}</p>}<button className="button primary" disabled={pending}>パスワードを更新</button></form></main>;
}
