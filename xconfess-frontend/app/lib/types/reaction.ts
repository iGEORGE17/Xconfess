/**
 * Shared reaction types for API contracts and UI
 */

export type ReactionType = "like" | "love";

export interface ReactionCounts {
  like: number;
  love: number;
}

export interface AddReactionResult {
  success: boolean;
  reactions?: ReactionCounts;
}
