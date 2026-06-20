import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/date";
import { listDecks } from "@/features/decks/repository";
import { countCards, listCards } from "@/features/problems/repository";
import { ProblemBulkEditor } from "@/features/problems/components/ProblemBulkEditor";
import { getEntitlements } from "@/features/entitlements/service";

export default async function ProblemsPage() {
  const user = await requireUser();
  const [decks, cards, cardCount, limits] = await Promise.all([listDecks(user.id), listCards(user.id, 20), countCards(user.id), getEntitlements(user.id)]);
  return <AppShell email={user.email}><div className="page-wrap wide"><header className="page-header compact"><div><span className="eyebrow">PROBLEM BUILDER</span><h1>問題をまとめて作る</h1><p>1行に1問。Excelからの貼り付けにも対応しています。</p></div></header><ProblemBulkEditor decks={decks} currentCardCount={cardCount} maxCards={limits.maxCards} /><section className="problem-list-section"><div className="section-heading"><div><span className="eyebrow">RECENTLY ADDED</span><h2>最近の問題</h2></div><span>全{cardCount}件 · 最新{cards.length}件を表示</span></div>{cards.length ? <div className="card-table"><div className="card-table-head"><span>問題文</span><span>答え</span><span>デッキ</span><span>次回</span></div>{cards.map((card) => <div className="card-table-row" key={card.id}><strong>{card.front}</strong><span>{card.back}</span><span>{card.deck?.name}</span><small>{formatDateTime(card.nextReviewAt)}</small></div>)}</div> : <div className="inline-empty"><p>保存した問題がここに並びます。</p></div>}</section></div></AppShell>;
}
