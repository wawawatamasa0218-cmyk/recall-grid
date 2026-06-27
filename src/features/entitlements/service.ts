import { PLAN_LIMITS } from "./limits";
import type { Entitlements, Plan } from "./types";

export async function getPlan(userId: string): Promise<Plan> {
  // MVP期間はDBの将来用plan値にかかわらず、全ユーザーをfreeとして扱う。
  // ただし制限はユーザーに見せず、作成制限もかけない。
  void userId;
  return "free";
}

export async function getEntitlements(userId: string): Promise<Entitlements> {
  const plan = await getPlan(userId);
  return { plan, ...PLAN_LIMITS[plan] };
}

export async function assertCanCreateDeck(userId: string) {
  void userId;
}

export async function assertCanCreateCards(userId: string, adding: number) {
  void userId;
  void adding;
}
