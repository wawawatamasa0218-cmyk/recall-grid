import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/env";

export function createSupabaseAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY が設定されていません。");
  const { url } = getSupabaseEnv();
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
