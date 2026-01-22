"use client";
import { useInfiniteConfessions } from "@/app/lib/hooks/useConfessions";
import { ConfessionCard } from "./ConfessionCard";
import { SkeletonCard } from "./LoadingSkeleton";

const ConfessionFeed = () => {
  const { data, loading, hasMore, observerRef, error } = useInfiniteConfessions();

  if (error && data.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-6">
        <div className="rounded-lg border border-red-500 bg-red-900/20 p-4">
          <h2 className="text-lg font-semibold text-red-400 mb-2">
            Failed to load confessions
          </h2>
          <p className="text-sm text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-10">
        No confessions yet.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-4 px-4 py-6">
      {data.map(confession => (
        <ConfessionCard key={confession.id} confession={confession} />
      ))}

      {error && data.length > 0 && (
        <div className="rounded-lg border border-yellow-500 bg-yellow-900/20 p-3">
          <p className="text-sm text-yellow-300">{error}</p>
        </div>
      )}

      {loading && <SkeletonCard />}

      {hasMore && (
        <div ref={observerRef} className="h-10" aria-hidden />
      )}
    </div>
  );
};

export default ConfessionFeed;
