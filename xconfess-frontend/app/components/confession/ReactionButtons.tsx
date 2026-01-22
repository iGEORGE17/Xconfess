"use client";

import { useState } from "react";

interface Props {
  type: "like" | "love";
  count: number;
  confessionId: string;
}

export const ReactionButton = ({ type, count, confessionId }: Props) => {
  const [localCount, setLocalCount] = useState(count);

  const react = async () => {
    setLocalCount(c => c + 1); // optimistic update

    await fetch(`/api/confessions/${confessionId}/react`, {
      method: "POST",
      body: JSON.stringify({ type }),
    });
  };

  return (
    <button
      onClick={react}
      aria-label={`React with ${type}`}
      className="flex items-center gap-1 text-sm text-gray-400 hover:text-white"
    >
      {type === "like" ? "👍" : "❤️"} {localCount}
    </button>
  );
};
