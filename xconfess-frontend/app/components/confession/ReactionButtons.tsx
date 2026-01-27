"use client";

import { useState, useEffect } from "react";
import { cn } from "@/app/lib/utils/cn";

interface Props {
  type: "like" | "love";
  count: number;
  confessionId: string;
  isActive?: boolean;
}

export const ReactionButton = ({type, count, confessionId,
isActive = false,
}: Props) => {
  const [localCount, setLocalCount] = useState(count);
  const [active, setActive] = useState(isActive);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sync localCount with prop changes (e.g., after refetch)
  useEffect(() => {
    setLocalCount(count);
  }, [count]);

  const react = async () => {
    if (active) return;

    setActive(true);
    setLocalCount((c) => c + 1);  // optimistic update
    setIsAnimating(true);

    try {
      const res = await fetch(`/api/confessions/${confessionId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (!res.ok) {
        throw new Error("Failed to react");
      }
    } catch (error) {
      setActive(false);
      setLocalCount((c) => c - 1);
      console.error(error);
    } finally {
      setTimeout(() => setIsAnimating(false), 250);
    }
  };

  return (
    <button
      onClick={react}
      aria-pressed={active}
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
