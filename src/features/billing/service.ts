import type { BillingStatus } from "./types";

// Stripe導入時は、この境界の内側だけを差し替える。
export async function getBillingStatus(): Promise<BillingStatus> {
  return { provider: "none", configured: false, canManageSubscription: false };
}
