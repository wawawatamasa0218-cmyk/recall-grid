import { db, unwrap } from "@/lib/db";
import { endOfTodayIso } from "@/lib/date";
import type { ReviewCard, ReviewResult, SchedulingState } from "./types";

type DueRow = { id: string; front: string; back: string; explanation: string | null; tags: string[] | null; image_path: string | null; next_review_at: string; stability: number; difficulty: number; reps: number; lapses: number; decks?: { name: string } | { name: string }[] | null };

export async function listDueCards(userId: string, limit = 50): Promise<ReviewCard[]> {
  const supabase = await db();
  const rows = unwrap(await supabase.from("cards").select("id, front, back, explanation, tags, image_path, next_review_at, stability, difficulty, reps, lapses, decks(name)").eq("user_id", userId).lte("next_review_at", endOfTodayIso()).order("next_review_at").limit(limit)) as DueRow[];
  return rows.map((row) => {
    const deck = Array.isArray(row.decks) ? row.decks[0] : row.decks;
    const imageUrl = row.image_path ? supabase.storage.from("card-images").getPublicUrl(row.image_path).data.publicUrl : undefined;
    return { id: row.id, front: row.front, back: row.back, explanation: row.explanation ?? "", tags: row.tags ?? [], imageUrl, nextReviewAt: row.next_review_at, deckName: deck?.name ?? "デッキ", stability: row.stability, difficulty: row.difficulty, reps: row.reps, lapses: row.lapses };
  });
}

export async function listWeakCards(userId: string, limit = 30): Promise<ReviewCard[]> {
  const supabase = await db();
  const rows = unwrap(await supabase.from("cards").select("id, front, back, explanation, tags, image_path, next_review_at, stability, difficulty, reps, lapses, decks(name)").eq("user_id", userId).gt("lapses", 0).order("lapses", { ascending: false }).order("updated_at", { ascending: false }).limit(limit)) as DueRow[];
  return rows.map((row) => { const deck = Array.isArray(row.decks) ? row.decks[0] : row.decks; const imageUrl = row.image_path ? supabase.storage.from("card-images").getPublicUrl(row.image_path).data.publicUrl : undefined; return { id: row.id, front: row.front, back: row.back, explanation: row.explanation ?? "", tags: row.tags ?? [], imageUrl, nextReviewAt: row.next_review_at, deckName: deck?.name ?? "デッキ", stability: row.stability, difficulty: row.difficulty, reps: row.reps, lapses: row.lapses }; });
}

export async function saveReview(userId: string, cardId: string, result: ReviewResult, reviewedAt: Date, nextReviewAt: Date, state: SchedulingState) {
  const supabase = await db();
  const { error } = await supabase.rpc("record_review", { p_user_id: userId, p_card_id: cardId, p_result: result, p_reviewed_at: reviewedAt.toISOString(), p_next_review_at: nextReviewAt.toISOString(), p_stability: state.stability, p_difficulty: state.difficulty, p_reps: state.reps, p_lapses: state.lapses });
  if (error) throw new Error(error.message);
}

export async function getSchedulingState(userId: string, cardId: string): Promise<SchedulingState> {
  const supabase = await db();
  const row = unwrap(await supabase.from("cards").select("stability,difficulty,reps,lapses").eq("user_id", userId).eq("id", cardId).single()) as SchedulingState;
  return row;
}

export async function countDueCards(userId: string) {
  const supabase = await db();
  const { count, error } = await supabase.from("cards").select("id", { count: "exact", head: true }).eq("user_id", userId).lte("next_review_at", endOfTodayIso());
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function listAnswerPool(userId: string, limit = 500) {
  const supabase = await db();
  const rows = unwrap(
    await supabase
      .from("cards")
      .select("back")
      .eq("user_id", userId)
      .limit(limit),
  ) as { back: string }[];
  return rows.map((row) => row.back);
}
