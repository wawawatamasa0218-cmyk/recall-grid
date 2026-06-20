import { db, unwrap } from "@/lib/db";
import { endOfTodayIso } from "@/lib/date";
import type { ReviewCard, ReviewResult } from "./types";

type DueRow = { id: string; front: string; back: string; explanation: string | null; tags: string[] | null; next_review_at: string; decks?: { name: string } | { name: string }[] | null };

export async function listDueCards(userId: string, limit = 50): Promise<ReviewCard[]> {
  const supabase = await db();
  const rows = unwrap(await supabase.from("cards").select("id, front, back, explanation, tags, next_review_at, decks(name)").eq("user_id", userId).lte("next_review_at", endOfTodayIso()).order("next_review_at").limit(limit)) as DueRow[];
  return rows.map((row) => {
    const deck = Array.isArray(row.decks) ? row.decks[0] : row.decks;
    return { id: row.id, front: row.front, back: row.back, explanation: row.explanation ?? "", tags: row.tags ?? [], nextReviewAt: row.next_review_at, deckName: deck?.name ?? "デッキ" };
  });
}

export async function saveReview(userId: string, cardId: string, result: ReviewResult, reviewedAt: Date, nextReviewAt: Date) {
  const supabase = await db();
  const { error } = await supabase.rpc("record_review", { p_user_id: userId, p_card_id: cardId, p_result: result, p_reviewed_at: reviewedAt.toISOString(), p_next_review_at: nextReviewAt.toISOString() });
  if (error) throw new Error(error.message);
}

export async function countDueCards(userId: string) {
  const supabase = await db();
  const { count, error } = await supabase.from("cards").select("id", { count: "exact", head: true }).eq("user_id", userId).lte("next_review_at", endOfTodayIso());
  if (error) throw new Error(error.message);
  return count ?? 0;
}
