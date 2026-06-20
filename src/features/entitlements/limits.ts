export const PLAN_LIMITS = {
  free: { maxDecks: 3, maxCards: 100, canUseAiGeneration: false, maxAiGenerationsPerMonth: 0 },
  pro: { maxDecks: 999999, maxCards: 999999, canUseAiGeneration: true, maxAiGenerationsPerMonth: 500 },
} as const;
