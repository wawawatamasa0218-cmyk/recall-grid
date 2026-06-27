import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { listDecks } from "@/features/decks/repository";
import { countCards } from "@/features/problems/repository";
import { countDueCards } from "@/features/review/repository";

export default async function DashboardPage() {
  const user = await requireUser();
  const [decks, cardCount, dueCount] = await Promise.all([listDecks(user.id), countCards(user.id), countDueCards(user.id)]);
  return <AppShell email={user.email}><div className="page-wrap"><header className="page-header"><div><span className="eyebrow">DASHBOARD</span><h1>こんにちは。</h1><p>今日も、ひとつずつ記憶を育てていきましょう。</p></div><div className="header-actions"><Link href="/explore" className="button secondary">公開デッキを探す</Link><Link href="/problems" className="button primary">＋ 問題を作る</Link></div></header><section className="stats-grid"><article className="stat-card accent"><span>今日の復習</span><strong>{dueCount}<small>問</small></strong><Link href="/review">復習を始める →</Link></article><article className="stat-card"><span>デッキ</span><strong>{decks.length}<small>個</small></strong><Link href="/decks">一覧を見る →</Link></article><article className="stat-card"><span>登録済みカード</span><strong>{cardCount}<small>問</small></strong><Link href="/problems">問題を追加する →</Link></article></section><section className="dashboard-section"><div className="section-heading"><div><span className="eyebrow">YOUR DECKS</span><h2>最近のデッキ</h2></div><Link href="/decks">すべて見る →</Link></div>{decks.length ? <div className="deck-grid">{decks.slice(0, 3).map((deck, index) => <Link href={`/decks/${deck.id}`} className={`deck-card color-${index % 3}`} key={deck.id}><span className="deck-number">{String(index + 1).padStart(2, "0")}</span><h3>{deck.name}</h3><p>{deck.description || "問題を追加して復習を始める"}</p><span className="deck-arrow">↗</span></Link>)}</div> : <div className="inline-empty"><p>まだデッキがありません。</p><Link href="/decks" className="button secondary">最初のデッキを作る</Link></div>}</section></div></AppShell>;
}
