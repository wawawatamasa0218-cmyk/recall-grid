import { db, unwrap } from "@/lib/db";
import type { Deck } from "./types";

type DeckRow = { id: string; user_id: string; name: string; created_at: string; updated_at: string };
const mapDeck = (row: DeckRow): Deck => ({ id: row.id, userId: row.user_id, name: row.name, createdAt: row.created_at, updatedAt: row.updated_at });

export async function listDecks(userId: string) {
  const supabase = await db();
  const rows = unwrap(await supabase.from("decks").select("*").eq("user_id", userId).order("updated_at", { ascending: false })) as DeckRow[];
  return rows.map(mapDeck);
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
