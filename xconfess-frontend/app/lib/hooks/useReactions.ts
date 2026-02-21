"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addReaction } from "@/app/lib/api/reactions";
import type { ReactionType } from "@/app/lib/types/reaction";
import { queryKeys } from "@/app/lib/api/queryKeys";

export function useReactions() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      confessionId,
      type,
    }: {
      confessionId: string;
      type: ReactionType;
    }) => addReaction(confessionId, type),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.confessions.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.confessions.detail(variables.confessionId),
      });
    },
  });

  return {
    addReaction: mutation.mutateAsync,
    addReactionMutate: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
