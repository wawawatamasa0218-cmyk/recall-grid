import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function db() {
  return createSupabaseServerClient();
}

export function unwrap<T>(result: { data: T | null; error: { message: string } | null }) {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}
