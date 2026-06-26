import { db, unwrap } from "@/lib/db";
import type { Card, ProblemDraft } from "./types";

type CardRow = { id: string; user_id: string; deck_id: string; front: string; back: string; explanation: string | null; tags: string[] | null; image_path?: string | null; next_review_at: string; created_at: string; decks?: { name: string } | { name: string }[] | null };
const mapCard = (row: CardRow, imageUrl?: string): Card => {
  const deck = Array.isArray(row.decks) ? row.decks[0] : row.decks;
  return { id: row.id, userId: row.user_id, deckId: row.deck_id, front: row.front, back: row.back, explanation: row.explanation ?? "", tags: row.tags ?? [], imageUrl, nextReviewAt: row.next_review_at, createdAt: row.created_at, deck: deck ?? null };
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

export async function listCards(userId: string, limit = 50, query = "", deckId = "", tag = "") {
  const supabase = await db();
  let request = supabase.from("cards").select("*, decks(name)").eq("user_id", userId);
  if (deckId) request = request.eq("deck_id", deckId);
  if (tag.trim()) request = request.contains("tags", [tag.trim()]);
  const safeQuery = query.trim().replace(/[%_,().]/g, " ").trim();
  if (safeQuery) request = request.or(`front.ilike.%${safeQuery}%,back.ilike.%${safeQuery}%,explanation.ilike.%${safeQuery}%`);
  const rows = unwrap(await request.order("created_at", { ascending: false }).limit(limit)) as CardRow[];
  return rows.map((row) => mapCard(row, row.image_path ? supabase.storage.from("card-images").getPublicUrl(row.image_path).data.publicUrl : undefined));
}

export async function listUserTags(userId: string) {
  const supabase = await db();
  const { data, error } = await supabase.from("cards").select("tags").eq("user_id", userId);
  if (error) throw new Error(error.message);
  return [...new Set((data ?? []).flatMap((row) => row.tags ?? []))].sort();
}

export async function updateCard(userId: string, cardId: string, values: { deckId: string; front: string; back: string; explanation: string; tags: string[]; imagePath?: string }) {
  const supabase = await db();
  const { data: current } = await supabase.from("cards").select("image_path").eq("id", cardId).eq("user_id", userId).maybeSingle();
  const payload: Record<string, unknown> = { deck_id: values.deckId, front: values.front, back: values.back, explanation: values.explanation || null, tags: values.tags, updated_at: new Date().toISOString() };
  if (values.imagePath) payload.image_path = values.imagePath;
  const { error } = await supabase.from("cards").update(payload).eq("id", cardId).eq("user_id", userId);
  if (error) throw new Error(error.message);
  if (values.imagePath && current?.image_path) await supabase.storage.from("card-images").remove([current.image_path]);
}

export async function deleteCard(userId: string, cardId: string) {
  const supabase = await db();
  const { data: current } = await supabase.from("cards").select("image_path").eq("id", cardId).eq("user_id", userId).maybeSingle();
  const { error } = await supabase.from("cards").delete().eq("id", cardId).eq("user_id", userId);
  if (error) throw new Error(error.message);
  if (current?.image_path) await supabase.storage.from("card-images").remove([current.image_path]);
}

export async function uploadCardImage(userId: string, file: File) {
  const supabase = await db();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("card-images").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

export async function countCards(userId: string) {
  const supabase = await db();
  const { count, error } = await supabase.from("cards").select("id", { count: "exact", head: true }).eq("user_id", userId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}
