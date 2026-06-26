import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { listDecks } from "@/features/decks/repository";
import { DeckCreateForm } from "@/features/decks/DeckCreateForm";
import { DeckList } from "@/features/decks/DeckList";
import { getEntitlements } from "@/features/entitlements/service";

export default async function DecksPage() {
  const user = await requireUser();
  const [decks, limits] = await Promise.all([listDecks(user.id), getEntitlements(user.id)]);
  return <AppShell email={user.email}><div className="page-wrap narrow"><header className="page-header"><div><span className="eyebrow">DECKS</span><h1>デッキ</h1><p>学びたいテーマごとに、問題を整理します。</p></div></header><section className="create-deck-card"><div><h2>新しいデッキ</h2><p>Free プランでは {limits.maxDecks} 個まで作成できます。</p></div><DeckCreateForm disabled={decks.length >= limits.maxDecks} /></section><div className="section-heading deck-heading"><div><span className="eyebrow">ALL DECKS</span><h2>{decks.length}個のデッキ</h2></div><span>{decks.length} / {limits.maxDecks}</span></div>{decks.length ? <DeckList decks={decks} /> : <div className="inline-empty"><p>最初のデッキを作ると、問題を登録できるようになります。</p></div>}</div></AppShell>;
}
