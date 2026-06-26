/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSharedDeck, hasLikedDeck } from "@/features/sharing/repository";
import { importSharedDeckAction, toggleDeckLikeAction } from "@/features/sharing/actions";

export default async function SharedDeckPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [deck, user] = await Promise.all([getSharedDeck(slug), getCurrentUser()]);
  if (!deck) notFound();
  const liked = user ? await hasLikedDeck(user.id, deck.id) : false;
  const importAction = importSharedDeckAction.bind(null, slug);
  const likeAction = toggleDeckLikeAction.bind(null, deck.id, slug);
  return <main className="shared-page"><header className="shared-nav"><Link href="/" className="brand"><span>R</span><strong>RecallGrid</strong></Link><Link href="/explore">公開デッキ一覧</Link></header><section className="shared-hero"><div><span className="eyebrow">COMMUNITY DECK</span><h1>{deck.name}</h1><p>{deck.description || "RecallGridで作成された公開デッキです。"}</p><div className="shared-meta"><span>{deck.category}</span><span>{deck.cardCount}問</span><span>{deck.copyCount}コピー</span><span>♡ {deck.likeCount}</span><span>by {deck.authorName}</span></div></div><div className="shared-import-card"><strong>このデッキで学習する</strong><p>自分のRecallGridへコピーすると、内容を自由に編集して復習できます。</p>{user ? <><form action={importAction}><button className="button primary full">自分のデッキに追加</button></form><form action={likeAction}><button className={`like-button ${liked ? "liked" : ""}`}>{liked ? "♥ いいね済み" : "♡ いいね"}</button></form></> : <Link href="/" className="button primary full">ログインして追加・いいね</Link>}</div></section><section className="shared-cards"><div className="section-heading"><div><span className="eyebrow">PREVIEW</span><h2>収録問題</h2></div></div>{deck.cards.map((card, index) => <article key={`${card.front}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span>{card.imageUrl && <img src={card.imageUrl} alt="問題画像" />}<h3>{card.front}</h3><details><summary>答えを見る</summary><strong>{card.back}</strong>{card.explanation && <p>{card.explanation}</p>}</details>{card.tags.length > 0 && <div className="tags">{card.tags.map((tag) => <em key={tag}>{tag}</em>)}</div>}</article>)}</section><footer className="shared-footer">RecallGrid — Learn together.</footer></main>;
}
