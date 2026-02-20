"use client";

import { SearchResultItem } from "./SearchResultItem";
import type { SearchConfession } from "@/app/lib/types/search";
import { SkeletonCard } from "@/app/components/confession/LoadingSkeleton";
import { cn } from "@/app/lib/utils/cn";

interface SearchResultsProps {
  results: SearchConfession[];
  query?: string;
  isLoading: boolean;
  isEmpty: boolean;
  hasSearched: boolean;
  page: number;
  hasMore: boolean;
  total?: number;
  onLoadMore?: () => void;
  className?: string;
}

export function SearchResults({
  results,
  query,
  isLoading,
  isEmpty,
  hasSearched,
  page,
  hasMore,
  total,
  onLoadMore,
  className,
}: SearchResultsProps) {
  if (isLoading && page === 1) {
    return (
      <div
        className={cn("space-y-4", className)}
        role="status"
        aria-live="polite"
        aria-label="Loading search results"
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50",
          className
        )}
        role="status"
      >
        <p className="text-zinc-400 text-center">
          Enter a search term or use filters to find confessions.
        </p>
        <p className="text-zinc-500 text-sm mt-2 text-center">
          Try &quot;love&quot;, &quot;secret&quot;, or &quot;coding&quot;.
        </p>
      </div>
    );
  }

  if (isEmpty && !isLoading) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <p className="text-zinc-400 text-center">
          No confessions match your search.
        </p>
        <p className="text-zinc-500 text-sm mt-2 text-center">
          Try different keywords or loosen your filters.
        </p>
      </div>
    );
  }

  const start = 1;
  const end = results.length;
  const showCount = total != null && total > 0;

  return (
    <div className={cn("space-y-4", className)} role="region" aria-label="Search results">
      {showCount && (
        <p className="text-sm text-zinc-500">
          Showing {start}–{end} of {total} result{total !== 1 ? "s" : ""}
        </p>
      )}
      <ul className="list-none space-y-3" role="list">
        {results.map((c) => (
          <li key={c.id} role="listitem">
            <SearchResultItem confession={c} searchQuery={query} />
          </li>
        ))}
      </ul>
      {isLoading && page > 1 && (
        <div className="flex justify-center py-6" aria-hidden>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.1s]" />
            <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.2s]" />
          </div>
        </div>
      )}
      {hasMore && !isLoading && onLoadMore && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={onLoadMore}
            className="px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
