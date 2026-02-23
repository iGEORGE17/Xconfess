"use client";

import { useEffect, useRef } from "react";
import { ConfessionCard } from "./ConfessionCard";
import { SkeletonCard } from "./LoadingSkeleton";
import type { NormalizedConfession } from "../../lib/utils/normalizeConfession";
import { useConfessionsQuery } from "../../lib/hooks/useConfessionsQuery";
import ErrorState from "../common/ErrorState";

export const ConfessionFeed = () => {
  const observerTarget = useRef<HTMLDivElement>(null);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useConfessionsQuery({ limit: 10 });

  const confessions: NormalizedConfession[] =
    data?.pages.flatMap((p) => p.confessions) ?? [];
  const isEmpty = !isLoading && !isFetching && confessions.length === 0;
  const hasMore = hasNextPage ?? false;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isFetching && !isError) {
          fetchNextPage();
        }
      },
      { rootMargin: "100px", threshold: 0.1 }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, isFetching, isError, fetchNextPage]);

  const handleRetry = () => {
    refetch();
  };

  // Render loading skeleton
  const renderLoadingSkeletons = () => {
    return (
      <>
        {Array.from({ length: 3 }).map((_, idx) => (
          <SkeletonCard key={`skeleton-${idx}`} />
        ))}
      </>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Empty State */}
      {isEmpty && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-4">
            No confessions yet. Be the first to share!
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Error State */}
      {isError && error && (
        <ErrorState
          error={error instanceof Error ? error.message : "Failed to load confessions"}
          title="Failed to load confessions"
          description="Something went wrong while fetching confessions."
          onRetry={handleRetry}
          showRetry
        />
      )}

      {/* Confessions Grid */}
      {!isEmpty && (
        <div className="space-y-4">
          {confessions.map((confession: NormalizedConfession) => (
            <ConfessionCard
              key={confession.id}
              confession={confession}
            />
          ))}

          {/* Loading skeletons while fetching more */}
          {isFetchingNextPage && renderLoadingSkeletons()}
        </div>
      )}

      {/* Initial loading state */}
      {isLoading && (
        <div className="space-y-4">{renderLoadingSkeletons()}</div>
      )}

      {/* Infinite scroll trigger */}
      {hasMore && !isError && (
        <div
          ref={observerTarget}
          className="h-10 flex items-center justify-center mt-8"
          aria-label="Loading more confessions"
        >
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
            </div>
          )}
        </div>
      )}

      {/* End of feed message */}
      {!hasMore && confessions.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            You&apos;ve reached the end of confessions
          </p>
        </div>
      )}
    </div>
  );
};

