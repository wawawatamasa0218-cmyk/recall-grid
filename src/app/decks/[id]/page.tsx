import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { getDeck } from "@/features/decks/repository";
import { listCards } from "@/features/problems/repository";

export default async function DeckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [deck, cards] = await Promise.all([getDeck(user.id, id), listCards(user.id, 500, "", id)]);
  if (!deck) notFound();
  return <AppShell email={user.email}><div className="page-wrap narrow"><header className="page-header deck-detail-header"><div><span className="eyebrow">DECK DETAIL</span><h1>{deck.name}</h1><p>{deck.description || "このデッキにはまだ説明がありません。"}</p><div className="deck-detail-meta"><span>{cards.length}問</span>{deck.sharingEnabled && <span>公開中 · {deck.copyCount}コピー</span>}{deck.copiedFromDeckId && <span>公開デッキからコピー</span>}</div></div><div className="header-actions"><Link href={`/problems?deck=${deck.id}`} className="button primary">問題を追加・編集</Link><Link href="/decks" className="button secondary">一覧へ</Link></div></header><section className="deck-detail-cards">{cards.map((card, index) => <article key={card.id}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{card.front}</h3><p>{card.back}</p></div><div className="tags">{card.tags.map((tag) => <em key={tag}>{tag}</em>)}</div></article>)}{!cards.length && <div className="inline-empty"><p>まだ問題がありません。</p></div>}</section></div></AppShell>;
}
