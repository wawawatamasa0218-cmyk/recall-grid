export type Plan = "free" | "pro";
export type Entitlements = { plan: Plan; maxDecks: number; maxCards: number; canUseAiGeneration: boolean; maxAiGenerationsPerMonth: number };
