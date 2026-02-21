"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ConfessionCard } from "./ConfessionCard";
import { SkeletonCard } from "./LoadingSkeleton";
import type { NormalizedConfession } from "../../lib/utils/normalizeConfession";
import { getConfessions } from "../../lib/api/confessions";
import ErrorState from "../common/ErrorState";

export const ConfessionFeed = () => {
  const [confessions, setConfessions] = useState<NormalizedConfession[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchConfessions = useCallback(async (pageNum: number) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    const result = await getConfessions(
      { page: pageNum, limit: 10 },
      abortControllerRef.current.signal
    );

    if (result.ok === false) {
      // Do not touch isLoading on cancel—the new in-flight request owns it
      if (result.error.message === "Request was cancelled.") return;
      setError(result.error.message);
      setIsLoading(false);
      return;
    }

    const { confessions: list, hasMore: more } = result.data;
    if (pageNum === 1) {
      setConfessions(list);
      setIsEmpty(list.length === 0);
    } else {
      setConfessions((prev: NormalizedConfession[]) => [...prev, ...list]);
    }
    setHasMore(more);
    setIsLoading(false);
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchConfessions(1);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchConfessions]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading && !error) {
          setPage((prev: number) => prev + 1);
        }
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasMore, isLoading, error]);

  // Fetch more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchConfessions(page);
    }
  }, [page, fetchConfessions]);

  // Handle retry
  const handleRetry = async () => {
    setPage(1);
    await fetchConfessions(1);
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
      {isEmpty && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-4">
            No confessions yet. Be the first to share!
          </p>
          <button
            onClick={() => {
              setPage(1);
              fetchConfessions(1);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Error State */}
      {error && (
        <ErrorState
          error={error}
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
          {isLoading && page > 1 && renderLoadingSkeletons()}
        </div>
      )}

      {/* Initial loading state */}
      {isLoading && page === 1 && (
        <div className="space-y-4">{renderLoadingSkeletons()}</div>
      )}

      {/* Infinite scroll trigger */}
      {hasMore && !error && (
        <div
          ref={observerTarget}
          className="h-10 flex items-center justify-center mt-8"
          aria-label="Loading more confessions"
        >
          {isLoading && page > 1 && (
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

