import { db, unwrap } from "@/lib/db";

type ReviewRow = { result: "again" | "hard" | "good" | "easy"; reviewed_at: string };

export async function getLearningAnalytics(userId: string) {
  const supabase = await db();
  const since = new Date(); since.setDate(since.getDate() - 89); since.setHours(0, 0, 0, 0);
  const reviews = unwrap(await supabase.from("reviews").select("result,reviewed_at").eq("user_id", userId).gte("reviewed_at", since.toISOString()).order("reviewed_at")) as ReviewRow[];
  const { count: totalCards } = await supabase.from("cards").select("id", { count: "exact", head: true }).eq("user_id", userId);
  const correct = reviews.filter((review) => review.result === "good" || review.result === "easy").length;
  const dailyMap = new Map<string, number>();
  reviews.forEach((review) => { const key = review.reviewed_at.slice(0, 10); dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1); });
  const last14Days = Array.from({ length: 14 }, (_, offset) => { const date = new Date(); date.setDate(date.getDate() - (13 - offset)); const key = date.toISOString().slice(0, 10); return { date: key, count: dailyMap.get(key) ?? 0 }; });
  let streak = 0; const cursor = new Date();
  while (dailyMap.has(cursor.toISOString().slice(0, 10))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  return { totalReviews: reviews.length, totalCards: totalCards ?? 0, accuracy: reviews.length ? Math.round((correct / reviews.length) * 100) : 0, streak, last14Days };
}
