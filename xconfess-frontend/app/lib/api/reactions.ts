import { normalizeApiError, type ApiError } from "./errors";
import type { ReactionType, ReactionCounts } from "../types/reaction";

const API_BASE = "";

export type { ReactionType } from "../types/reaction";

export interface AddReactionResult {
  success: boolean;
  reactions?: ReactionCounts;
}

export type AddReactionResponse =
  | { ok: true; data: AddReactionResult }
  | { ok: false; error: ApiError };

/**
 * Adds a reaction (like or love) to a confession.
 */
export async function addReaction(
  confessionId: string,
  type: ReactionType,
  signal?: AbortSignal
): Promise<AddReactionResponse> {
  if (!confessionId) {
    return {
      ok: false,
      error: { message: "Confession ID is required.", code: "VALIDATION_ERROR" },
    };
  }
  if (!type || !["like", "love"].includes(type)) {
    return {
      ok: false,
      error: { message: "Invalid reaction type.", code: "VALIDATION_ERROR" },
    };
  }

  try {
    const response = await fetch(
      `${API_BASE}/api/confessions/${confessionId}/react`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
        signal,
      }
    );

    if (!response.ok) {
      const error = await normalizeApiError(response);
      return { ok: false, error };
    }

    const data = await response.json();
    return {
      ok: true,
      data: {
        success: data.success === true,
        reactions: data.reactions,
      },
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: { message: "Request was cancelled." } };
    }
    const error = await normalizeApiError(
      err instanceof Error ? err : new Error(String(err))
    );
    return { ok: false, error };
  }
}
