import { countDecks } from "@/features/decks/repository";
import { countCards } from "@/features/problems/repository";
import { PLAN_LIMITS } from "./limits";
import type { Entitlements, Plan } from "./types";

export async function getPlan(userId: string): Promise<Plan> {
  // MVP期間はDBの将来用plan値にかかわらず、全ユーザーをFreeとして扱う。
  void userId;
  return "free";
}

export async function getEntitlements(userId: string): Promise<Entitlements> {
  const plan = await getPlan(userId);
  return { plan, ...PLAN_LIMITS[plan] };
}

export async function assertCanCreateDeck(userId: string) {
  const [limits, count] = await Promise.all([getEntitlements(userId), countDecks(userId)]);
  if (count >= limits.maxDecks) throw new Error(`現在のプランではデッキは${limits.maxDecks}件までです。`);
}

export async function assertCanCreateCards(userId: string, adding: number) {
  const [limits, count] = await Promise.all([getEntitlements(userId), countCards(userId)]);
  if (count + adding > limits.maxCards) throw new Error(`現在のプランではカードは${limits.maxCards}件までです。`);
}
