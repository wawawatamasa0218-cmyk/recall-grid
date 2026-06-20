import type { BillingStatus } from "./types";

// Stripe 導入時も、アプリ本体はこの境界の内側だけを差し替える。
export async function getBillingStatus(): Promise<BillingStatus> {
  return { provider: "none", canManageSubscription: false };
}
