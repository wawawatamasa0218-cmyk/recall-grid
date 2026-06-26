export type Deck = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  sharingEnabled?: boolean;
  shareSlug?: string;
  category?: string;
  authorName?: string;
  copyCount?: number;
  copiedFromDeckId?: string;
  createdAt: string;
  updatedAt: string;
};
