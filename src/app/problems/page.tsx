import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { listDecks } from "@/features/decks/repository";
import { countCards, listCards, listUserTags } from "@/features/problems/repository";
import { ProblemBulkEditor } from "@/features/problems/components/ProblemBulkEditor";
import { ProblemManager } from "@/features/problems/components/ProblemManager";
import { getEntitlements } from "@/features/entitlements/service";

export default async function ProblemsPage({ searchParams }: { searchParams: Promise<{ q?: string; deck?: string; tag?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const [decks, cards, cardCount, limits, tags] = await Promise.all([listDecks(user.id), listCards(user.id, 100, params.q, params.deck, params.tag), countCards(user.id), getEntitlements(user.id), listUserTags(user.id)]);
  return <AppShell email={user.email}><div className="page-wrap wide"><header className="page-header compact"><div><span className="eyebrow">PROBLEM BUILDER</span><h1>問題をまとめて作る</h1><p>1行に1問。Excelからの貼り付けにも対応しています。</p></div></header><ProblemBulkEditor decks={decks} currentCardCount={cardCount} maxCards={limits.maxCards} /><section className="problem-list-section"><div className="section-heading"><div><span className="eyebrow">ALL PROBLEMS</span><h2>問題一覧</h2></div><span>全{cardCount}件 · {cards.length}件を表示</span></div><form className="problem-filters tag-filters"><input name="q" defaultValue={params.q} placeholder="問題文・答え・解説を検索" /><select name="deck" defaultValue={params.deck}><option value="">すべてのデッキ</option>{decks.map((deck) => <option value={deck.id} key={deck.id}>{deck.name}</option>)}</select><select name="tag" defaultValue={params.tag}><option value="">すべてのタグ</option>{tags.map((tag) => <option value={tag} key={tag}>{tag}</option>)}</select><button className="button secondary">検索</button><a href="/problems" className="button ghost">クリア</a></form>{cards.length ? <ProblemManager cards={cards} decks={decks} /> : <div className="inline-empty"><p>条件に一致する問題がありません。</p></div>}</section></div></AppShell>;
}
