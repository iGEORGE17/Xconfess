"use client";

import { useState, useEffect } from "react";
import { cn } from "@/app/lib/utils/cn";
import { Heart, ThumbsUp } from "lucide-react";

interface Props {
  type: "like" | "love";
  count: number;
  confessionId: string;
  isActive?: boolean;
}

export const ReactionButton = ({ type, count, confessionId,
  isActive = false,
}: Props) => {
  const [localCount, setLocalCount] = useState(count);
  const [active, setActive] = useState(isActive);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sync localCount with prop changes (e.g., after page refresh)
  useEffect(() => {
    setLocalCount(count);
  }, [count, confessionId]); // Also reset if confession ID changes

  const react = async () => {
    // Optimistic increment - this will persist until page refresh
    setLocalCount((c) => c + 1);

    try {
      setActive(true);
      const res = await fetch(`/api/confessions/${confessionId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (!res.ok) {
        throw new Error("Failed to react");
      }

      // In demo mode, we just keep the incremented count
      // In production, the backend would return the actual count
      // The count will reset on page refresh, simulating fresh data from backend
      const data = await res.json().catch(() => null);
      if (data?._demo) {
        // In demo mode, keep the incremented local count
        console.log("Demo mode: reaction persisted locally");
      } else if (
        data &&
        data.reactions &&
        typeof data.reactions[type] === "number"
      ) {
        // In production, sync with backend count
        setLocalCount(data.reactions[type]);
      }
    } catch (error) {
      setActive(false);
      setLocalCount((c) => c - 1);
      console.error("Failed to react:", error);
    } finally {
      setActive(false);
    }
  };
  const Icon = type === "like" ? ThumbsUp : Heart;
  return (
    <button
      onClick={react}
      aria-label={`React with ${type}`}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2 rounded-full justify-center touch-manipulation",
        "min-w-11 min-h-11 touch-manipulation",
        "transition-all duration-200 ease-out",
        "bg-zinc-800 hover:bg-zinc-700",
        "active:scale-95",
        active && "bg-pink-600 text-white",
        isAnimating && "animate-reaction-bounce",
         type !== "like" ? "hover:bg-pink-700" : " hover:bg-blue-700"
      )}
    >
      <span className="text-lg select-none text-inherit">
        <Icon size={18} />
      </span>

      <span className="text-sm font-medium">{localCount}</span>
    </button>
  );
};
