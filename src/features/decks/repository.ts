import { db, unwrap } from "@/lib/db";
import type { Deck } from "./types";

type DeckRow = { id: string; user_id: string; name: string; description?: string | null; sharing_enabled?: boolean; share_slug?: string | null; category?: string | null; author_name?: string | null; copy_count?: number; copied_from_deck_id?: string | null; created_at: string; updated_at: string };
const mapDeck = (row: DeckRow): Deck => ({ id: row.id, userId: row.user_id, name: row.name, description: row.description ?? "", sharingEnabled: row.sharing_enabled ?? false, shareSlug: row.share_slug ?? undefined, category: row.category ?? "その他", authorName: row.author_name ?? undefined, copyCount: row.copy_count ?? 0, copiedFromDeckId: row.copied_from_deck_id ?? undefined, createdAt: row.created_at, updatedAt: row.updated_at });

export async function listDecks(userId: string) {
  const supabase = await db();
  const rows = unwrap(await supabase.from("decks").select("*").eq("user_id", userId).order("updated_at", { ascending: false })) as DeckRow[];
  return rows.map(mapDeck);
}

export async function getDeck(userId: string, deckId: string) {
  const supabase = await db();
  const { data, error } = await supabase.from("decks").select("*").eq("id", deckId).eq("user_id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapDeck(data as DeckRow) : null;
}

export async function createDeck(userId: string, name: string) {
  const supabase = await db();
  const row = unwrap(await supabase.from("decks").insert({ user_id: userId, name }).select().single()) as DeckRow;
  return mapDeck(row);
}

export async function countDecks(userId: string) {
  const supabase = await db();
  const { count, error } = await supabase.from("decks").select("id", { count: "exact", head: true }).eq("user_id", userId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function updateDeck(userId: string, deckId: string, name: string) {
  const supabase = await db();
  const { error } = await supabase.from("decks").update({ name, updated_at: new Date().toISOString() }).eq("id", deckId).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function deleteDeck(userId: string, deckId: string) {
  const supabase = await db();
  const { data: cards } = await supabase.from("cards").select("image_path").eq("deck_id", deckId).eq("user_id", userId);
  const { error } = await supabase.from("decks").delete().eq("id", deckId).eq("user_id", userId);
  if (error) throw new Error(error.message);
  const paths = (cards ?? []).map((card) => card.image_path).filter((path): path is string => Boolean(path));
  if (paths.length) await supabase.storage.from("card-images").remove(paths);
}

export async function enableDeckSharing(userId: string, deckId: string, description: string, category: string, authorName: string) {
  const supabase = await db();
  const slug = crypto.randomUUID().replaceAll("-", "").slice(0, 16);
  const row = unwrap(await supabase.from("decks").update({ is_public: true, public_slug: slug, description: description.trim() || null, category: category.trim() || "その他", author_name: authorName, updated_at: new Date().toISOString() }).eq("id", deckId).eq("user_id", userId).select().single()) as DeckRow;
  return mapDeck(row);
}

export async function disableDeckSharing(userId: string, deckId: string) {
  const supabase = await db();
  const { error } = await supabase.from("decks").update({ is_public: false, public_slug: null, updated_at: new Date().toISOString() }).eq("id", deckId).eq("user_id", userId);
  if (error) throw new Error(error.message);
}
