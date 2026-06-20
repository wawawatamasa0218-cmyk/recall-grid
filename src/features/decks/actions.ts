"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { assertCanCreateDeck } from "@/features/entitlements/service";
import { createDeck } from "./repository";

export type DeckActionState = { ok: boolean; message?: string };

export async function createDeckAction(
  _: DeckActionState,
  formData: FormData,
): Promise<DeckActionState> {
  try {
    const user = await requireUser();
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { ok: false, message: "デッキ名を入力してください。" };
    if (name.length > 80) return { ok: false, message: "デッキ名は80文字以内で入力してください。" };
    await assertCanCreateDeck(user.id);
    await createDeck(user.id, name);
    revalidatePath("/decks");
    revalidatePath("/dashboard");
    return { ok: true, message: "デッキを作成しました。" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "デッキを作成できませんでした。",
    };
  }
}
