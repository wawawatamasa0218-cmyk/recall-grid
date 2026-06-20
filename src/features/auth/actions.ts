"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createSupabaseServerClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "メールアドレスまたはパスワードを確認してください。" };
  redirect("/dashboard");
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createSupabaseServerClient();
  const origin = (await headers()).get("origin");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "パスワードは8文字以上で入力してください。" };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: origin ? { emailRedirectTo: `${origin}/auth/callback` } : undefined,
  });
  if (error) return { error: error.message };
  if (data.session) redirect("/dashboard");
  return { message: "確認メールを送りました。メール内のリンクを開いてください。" };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
