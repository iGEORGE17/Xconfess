"use client";

import { useState, useEffect } from "react";
import { cn } from "@/app/lib/utils/cn";
import { Heart, ThumbsUp } from "lucide-react";
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
  const Icon = type === "like" ? ThumbsUp : Heart;
  return (
    <button
      onClick={react}
      disabled={isPending}
      aria-label={`React with ${type}`}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2 rounded-full justify-center touch-manipulation",
        "min-w-11 min-h-11",
        "transition-all duration-200 ease-out",
        "bg-zinc-800 hover:bg-zinc-700",
        "active:scale-95",
        active && (type !== "like" ? "bg-pink-600 text-white" : "bg-blue-600 text-white"),
        isAnimating && "animate-reaction-bounce",
        type !== "like" ? "hover:bg-pink-700" : "hover:bg-blue-700"
      )}
    >
      <span className="text-lg select-none text-inherit">
        <Icon size={18} />
      </span>

      <span className="text-sm font-medium">{localCount}</span>
    </button>
  );
};
