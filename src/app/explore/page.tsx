import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { listPublicDecks } from "@/features/sharing/repository";

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ sort?: string; category?: string; tag?: string; q?: string }> }) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
  const sort = params.sort === "popular" ? "popular" : "new";
  const allDecks = await listPublicDecks(sort);
  const categories = [...new Set(allDecks.map((deck) => deck.category))];
  const popularTags = [...new Set(allDecks.flatMap((deck) => deck.tags))].map((tag) => ({ tag, count: allDecks.filter((deck) => deck.tags.includes(tag)).length })).sort((a, b) => b.count - a.count).slice(0, 12);
  const query = params.q?.trim().toLowerCase() ?? "";
  const decks = allDecks.filter((deck) => (!params.category || deck.category === params.category) && (!params.tag || deck.tags.includes(params.tag)) && (!query || `${deck.name} ${deck.description} ${deck.authorName}`.toLowerCase().includes(query)));
  const ranking = [...allDecks].sort((a, b) => b.copyCount - a.copyCount).slice(0, 5);
  const content = <div className="page-wrap wide"><header className="page-header"><div><span className="eyebrow">COMMUNITY</span><h1>公開デッキ</h1><p>みんなが作った無料デッキを、自分の学習に取り込めます。</p></div></header><form className="explore-filters"><input name="q" defaultValue={params.q} placeholder="デッキ名・説明・作成者で検索" /><select name="category" defaultValue={params.category}><option value="">すべてのカテゴリ</option>{categories.map((category) => <option key={category}>{category}</option>)}</select><select name="sort" defaultValue={sort}><option value="new">新着順</option><option value="popular">人気順</option></select><button className="button primary">表示</button></form><div className="explore-layout"><section><div className="section-heading"><div><span className="eyebrow">PUBLIC DECKS</span><h2>{decks.length}件のデッキ</h2></div></div><div className="public-deck-grid">{decks.map((deck) => <Link href={`/share/${deck.slug}`} className="public-deck-card" key={deck.id}><div className="public-deck-top"><span>{deck.category}</span><strong>↗</strong></div><h3>{deck.name}</h3><p>{deck.description || "説明はありません。"}</p><div className="public-deck-tags">{deck.tags.slice(0, 3).map((tag) => <em key={tag}>{tag}</em>)}</div><footer><span>{deck.authorName}</span><span>{deck.cardCount}問 · {deck.copyCount}コピー</span></footer></Link>)}</div>{!decks.length && <div className="inline-empty"><p>条件に一致する公開デッキがありません。</p></div>}</section><aside className="ranking-panel"><span className="eyebrow">TOP COPIED</span><h2>人気ランキング</h2>{ranking.map((deck, index) => <Link href={`/share/${deck.slug}`} key={deck.id}><b>{index + 1}</b><div><strong>{deck.name}</strong><small>{deck.copyCount}コピー</small></div></Link>)}<div className="popular-tags"><span className="eyebrow">POPULAR TAGS</span>{popularTags.map(({ tag, count }) => <Link href={`/explore?tag=${encodeURIComponent(tag)}`} key={tag}>#{tag} <small>{count}</small></Link>)}</div></aside></div></div>;
  if (user) return <AppShell email={user.email}>{content}</AppShell>;
  return <main className="public-explore"><header className="shared-nav"><Link href="/" className="brand"><span>R</span><strong>RecallGrid</strong></Link><Link href="/" className="button secondary">ログイン</Link></header>{content}</main>;
}
