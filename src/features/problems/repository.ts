import { db, unwrap } from "@/lib/db";
import type { Card, ProblemDraft } from "./types";

type CardRow = { id: string; user_id: string; deck_id: string; front: string; back: string; explanation: string | null; tags: string[] | null; next_review_at: string; created_at: string; decks?: { name: string } | { name: string }[] | null };
const mapCard = (row: CardRow): Card => {
  const deck = Array.isArray(row.decks) ? row.decks[0] : row.decks;
  return { id: row.id, userId: row.user_id, deckId: row.deck_id, front: row.front, back: row.back, explanation: row.explanation ?? "", tags: row.tags ?? [], nextReviewAt: row.next_review_at, createdAt: row.created_at, deck: deck ?? null };
};

export async function createCards(userId: string, deckId: string, rows: ProblemDraft[]) {
  const supabase = await db();
  const { data: deck, error: deckError } = await supabase
    .from("decks")
    .select("id")
    .eq("id", deckId)
    .eq("user_id", userId)
    .maybeSingle();
  if (deckError) throw new Error(deckError.message);
  if (!deck) throw new Error("保存先のデッキが見つかりません。");
  const payload = rows.map((row) => ({ user_id: userId, deck_id: deckId, front: row.front.trim(), back: row.back.trim(), explanation: row.explanation.trim() || null, tags: row.tags.split(/[,、]/).map((tag) => tag.trim()).filter(Boolean) }));
  const { error } = await supabase.from("cards").insert(payload);
  if (error) throw new Error(error.message);
}

export async function listCards(userId: string, limit = 50) {
  const supabase = await db();
  const rows = unwrap(await supabase.from("cards").select("*, decks(name)").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit)) as CardRow[];
  return rows.map(mapCard);
}

export async function countCards(userId: string) {
  const supabase = await db();
  const { count, error } = await supabase.from("cards").select("id", { count: "exact", head: true }).eq("user_id", userId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}
