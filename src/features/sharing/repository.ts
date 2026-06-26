import { db } from "@/lib/db";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SharedDeck } from "./types";

type PublicDeckRow = {
  id: string; title: string; description: string | null; public_slug: string;
  category: string | null; author_name: string | null; copy_count: number;
  like_count: number; created_at: string;
  cards?: { front: string; back: string; explanation: string | null; tags: string[] | null; image_path: string | null }[];
};

function mapPublicDeck(row: PublicDeckRow, publicUrl: (path: string) => string): SharedDeck {
  const cards = (row.cards ?? []).map((card) => ({ front: card.front, back: card.back, explanation: card.explanation ?? "", tags: card.tags ?? [], imagePath: card.image_path ?? undefined, imageUrl: card.image_path ? publicUrl(card.image_path) : undefined }));
  return { id: row.id, slug: row.public_slug, name: row.title, description: row.description ?? "", category: row.category ?? "その他", authorName: row.author_name ?? "RecallGrid ユーザー", copyCount: row.copy_count, likeCount: row.like_count, createdAt: row.created_at, cardCount: cards.length, tags: [...new Set(cards.flatMap((card) => card.tags))], cards };
}

const selection = "id,title,description,public_slug,category,author_name,copy_count,like_count,created_at,cards(front,back,explanation,tags,image_path)";

export async function getSharedDeck(slug: string): Promise<SharedDeck | null> {
  const supabase = await db();
  const { data, error } = await supabase.from("decks").select(selection).eq("public_slug", slug).eq("is_public", true).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapPublicDeck(data as unknown as PublicDeckRow, (path) => supabase.storage.from("card-images").getPublicUrl(path).data.publicUrl);
}

export async function listPublicDecks(sort: "new" | "popular" = "new") {
  const supabase = await db();
  const orderColumn = sort === "popular" ? "copy_count" : "created_at";
  const { data, error } = await supabase.from("decks").select(selection).eq("is_public", true).order(orderColumn, { ascending: false }).limit(100);
  if (error) throw new Error(error.message);
  return (data as unknown as PublicDeckRow[]).map((row) => mapPublicDeck(row, (path) => supabase.storage.from("card-images").getPublicUrl(path).data.publicUrl));
}

export async function hasLikedDeck(userId: string, deckId: string) {
  const supabase = await db();
  const { data } = await supabase.from("deck_likes").select("id").eq("user_id", userId).eq("deck_id", deckId).maybeSingle();
  return Boolean(data);
}

export async function copySharedDeck(userId: string, shared: SharedDeck) {
  const supabase = await db();
  const admin = createSupabaseAdminClient();
  const { data: deck, error } = await supabase.from("decks").insert({ user_id: userId, name: `${shared.name}（コピー）`, description: shared.description || null, category: shared.category, copied_from_deck_id: shared.id }).select("id").single();
  if (error) throw new Error(error.message);
  try {
    const rows = [];
    for (const card of shared.cards) {
      let imagePath: string | null = null;
      if (card.imagePath) {
        const downloaded = await admin.storage.from("card-images").download(card.imagePath);
        if (!downloaded.error) { imagePath = `${userId}/${crypto.randomUUID()}.${card.imagePath.split(".").pop() ?? "jpg"}`; await supabase.storage.from("card-images").upload(imagePath, downloaded.data); }
      }
      rows.push({ user_id: userId, deck_id: deck.id, front: card.front, back: card.back, explanation: card.explanation || null, tags: card.tags, image_path: imagePath });
    }
    if (rows.length) { const inserted = await supabase.from("cards").insert(rows); if (inserted.error) throw inserted.error; }
    const recorded = await supabase.rpc("record_deck_copy", { p_source_deck_id: shared.id, p_copied_deck_id: deck.id });
    if (recorded.error) throw recorded.error;
    return deck.id;
  } catch (error) { await supabase.from("decks").delete().eq("id", deck.id); throw error; }
}
