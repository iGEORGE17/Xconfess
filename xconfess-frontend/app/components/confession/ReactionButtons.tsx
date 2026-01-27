"use client";

import { useState, useEffect } from "react";

interface Props {
  type: "like" | "love";
  count: number;
  confessionId: string;
}

export const ReactionButton = ({ type, count, confessionId }: Props) => {
  const [localCount, setLocalCount] = useState(count);

  // Sync localCount with prop changes (e.g., after page refresh)
  useEffect(() => {
    setLocalCount(count);
  }, [count, confessionId]); // Also reset if confession ID changes

  const react = async () => {
    // Optimistic increment - this will persist until page refresh
    setLocalCount((c) => c + 1);

    try {
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
      // Rollback on failure
      setLocalCount((c) => c - 1);
      console.error("Failed to react:", error);
    }
  };

  return (
    <button
      onClick={react}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors min-w-11 min-h-11 justify-center touch-manipulation"
      aria-label={`React with ${type}`}
    >
      <span className="text-lg">{type === "like" ? "👍" : "❤️"}</span>
      <span className="text-sm font-medium">{localCount}</span>
    </button>
  );
};
