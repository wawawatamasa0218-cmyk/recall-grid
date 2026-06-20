import Link from "next/link";
import { AuthForm } from "@/features/auth/AuthForm";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";

export default async function Home() {
  const configured = isSupabaseConfigured();
  const user = configured ? await getCurrentUser() : null;
  return <main className="landing"><header className="landing-nav"><div className="brand"><span>R</span><strong>RecallGrid</strong></div>{user && <Link className="button secondary" href="/dashboard">ダッシュボードへ</Link>}</header><section className="hero"><div className="hero-copy"><div className="pill">LEARN A LITTLE. REMEMBER A LOT.</div><h1>覚える流れを、<br /><em>もっと軽やかに。</em></h1><p>問題をまとめて作って、今日覚えるものだけに集中。<br />RecallGridは、毎日の復習を迷わず続けるための暗記ツールです。</p><div className="feature-strip"><div><strong>01</strong><span>まとめて高速入力</span></div><div><strong>02</strong><span>今日の復習を自動整理</span></div><div><strong>03</strong><span>シンプルな学習記録</span></div></div></div><div>{user ? <div className="auth-card signed-in"><span className="eyebrow">WELCOME BACK</span><h2>続きから始めましょう</h2><p>{user.email}</p><Link href="/review" className="button primary full">今日の復習へ</Link></div> : configured ? <AuthForm /> : <div className="auth-card setup-card"><span className="eyebrow">ONE MORE STEP</span><h2>Supabaseを接続</h2><p><code>.env.example</code> を <code>.env.local</code> にコピーし、接続情報を設定するとログインできます。</p><div className="setup-code">NEXT_PUBLIC_SUPABASE_URL<br />NEXT_PUBLIC_SUPABASE_ANON_KEY</div></div>}</div></section><footer className="landing-footer"><span>© 2026 RecallGrid</span><span>Built for steady progress.</span></footer></main>;
}
