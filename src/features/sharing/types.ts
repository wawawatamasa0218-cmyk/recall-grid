export type SharedCard = { front: string; back: string; explanation: string; tags: string[]; imageUrl?: string; imagePath?: string };
export type SharedDeck = { id: string; slug: string; name: string; description: string; category: string; authorName: string; copyCount: number; likeCount: number; createdAt: string; cardCount: number; tags: string[]; cards: SharedCard[] };
