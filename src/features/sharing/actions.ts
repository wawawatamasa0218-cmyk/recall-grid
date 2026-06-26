"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertCanCreateCards, assertCanCreateDeck } from "@/features/entitlements/service";
import { disableDeckSharing, enableDeckSharing } from "@/features/decks/repository";
import { copySharedDeck, getSharedDeck } from "./repository";
import { getDisplayName } from "@/features/profile/repository";

export type ShareActionResult = { ok: boolean; message: string; url?: string };

export async function enableShareAction(deckId: string, description: string, category: string): Promise<ShareActionResult> {
  try { const user = await requireUser(); const savedName = await getDisplayName(user.id); const authorName = savedName || String(user.user_metadata?.full_name || "RecallGrid ユーザー"); const deck = await enableDeckSharing(user.id, deckId, description, category, authorName); revalidatePath("/decks"); revalidatePath("/explore"); const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"; return { ok: true, message: "公開リンクを発行しました。", url: `${appUrl}/share/${deck.shareSlug}` }; }
  catch (error) { return { ok: false, message: error instanceof Error ? error.message : "共有できませんでした。" }; }
}

export async function disableShareAction(deckId: string): Promise<ShareActionResult> {
  try { const user = await requireUser(); await disableDeckSharing(user.id, deckId); revalidatePath("/decks"); revalidatePath("/explore"); return { ok: true, message: "公開を停止しました。" }; }
  catch (error) { return { ok: false, message: error instanceof Error ? error.message : "停止できませんでした。" }; }
}

export async function importSharedDeckAction(slug: string) {
  const user = await requireUser();
  const shared = await getSharedDeck(slug);
  if (!shared) throw new Error("共有デッキが見つかりません。");
  await Promise.all([assertCanCreateDeck(user.id), assertCanCreateCards(user.id, shared.cardCount)]);
  await copySharedDeck(user.id, shared);
  revalidatePath("/decks"); revalidatePath("/dashboard"); revalidatePath("/problems");
  redirect("/decks?imported=1");
}

export async function toggleDeckLikeAction(deckId: string, slug: string) {
  await requireUser();
  const supabase = await db();
  const { error } = await supabase.rpc("toggle_deck_like", { p_deck_id: deckId });
  if (error) throw new Error(error.message);
  revalidatePath(`/share/${slug}`);
  revalidatePath("/explore");
}
