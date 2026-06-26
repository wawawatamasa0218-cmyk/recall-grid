import { db } from "@/lib/db";

export async function getDisplayName(userId: string) {
  const supabase = await db();
  const { data, error } = await supabase.from("profiles").select("display_name").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data?.display_name ?? "";
}

export async function updateDisplayName(userId: string, displayName: string) {
  const supabase = await db();
  const { error } = await supabase.from("profiles").update({ display_name: displayName, updated_at: new Date().toISOString() }).eq("user_id", userId);
  if (error) throw new Error(error.message);
}
