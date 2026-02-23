"use client";

import { useState, useEffect } from "react";
import { cn } from "@/app/lib/utils/cn";
import { useReactions } from "@/app/lib/hooks/useReactions";
import type { ReactionType } from "@/app/lib/types/reaction";

interface Props {
  type: ReactionType;
  count: number;
  confessionId: string;
  isActive?: boolean;
}

export const ReactionButton = ({
  type,
  count,
  confessionId,
  isActive = false,
}: Props) => {
  const [localCount, setLocalCount] = useState(count);
  const [active, setActive] = useState(isActive);
  const [isAnimating, setIsAnimating] = useState(false);
  const { addReaction, isPending } = useReactions();

  useEffect(() => {
    setLocalCount(count);
  }, [count, confessionId]);

  const react = async () => {
    setLocalCount((c) => c + 1);
    setActive(true);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    try {
      const result = await addReaction({ confessionId, type });
      if (result.ok && result.data.reactions?.[type] !== undefined) {
        setLocalCount(result.data.reactions[type]);
      }
    } catch {
      setActive(false);
      setLocalCount(count);
    }
  };

  return (
    <button
      onClick={react}
      disabled={isPending}
      aria-label={`React with ${type}`}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2 rounded-full",
        "min-w-[44px] min-h-[44px] touch-manipulation",
        "transition-all duration-200 ease-out",
        "bg-zinc-800 hover:bg-zinc-700",
        "active:scale-95",
        active && "bg-pink-600 text-white",
        isAnimating && "animate-reaction-bounce"
      )}
    >
      <span className="text-lg select-none">
        {type === "like" ? "👍" : "❤️"}
      </span>

      <span className="text-sm font-medium">{localCount}</span>
    </button>
  );
};
