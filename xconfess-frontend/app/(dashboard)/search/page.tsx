"use client";

import { useState, useCallback, useEffect } from "react";
import { SearchInput } from "@/app/components/search/SearchInput";
import { FilterSidebar } from "@/app/components/search/FilterSidebar";
import { FilterChips } from "@/app/components/search/FilterChips";
import { SearchResults } from "@/app/components/search/SearchResults";
import { useDebounce } from "@/app/lib/hooks/useDebounce";
import { useSearch } from "@/app/lib/hooks/useSearch";
import {
  DEFAULT_FILTERS,
  type SearchFilters,
} from "@/app/lib/types/search";
import type { FilterChipKey } from "@/app/components/search/FilterChips";
import { Filter, X } from "lucide-react";
import { cn } from "@/app/lib/utils/cn";

const DEBOUNCE_MS = 300;

function hasActiveFilters(f: SearchFilters): boolean {
  return !!(
    f.dateFrom ||
    f.dateTo ||
    (f.minReactions != null && f.minReactions > 0) ||
    (f.sort && f.sort !== "newest")
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({ ...DEFAULT_FILTERS });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);
  const runSearch =
    debouncedQuery.trim().length > 0 || hasActiveFilters(filters);

  const {
    results,
    total,
    hasMore,
    page,
    isLoading,
    error,
    loadMore,
    reset,
  } = useSearch({
    query,
    filters,
    debouncedQuery,
    runSearch,
  });

  const hasSearched = runSearch;
  const isEmpty = hasSearched && !isLoading && results.length === 0;

  const handleSubmit = useCallback((q: string) => {
    setQuery(q.trim());
  }, []);

  const handleApplyFilters = useCallback((f: SearchFilters) => {
    setFilters(f);
    setSidebarOpen(false);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
    setSidebarOpen(false);
  }, []);

  const handleRemoveFilter = useCallback(
    (key: FilterChipKey) => {
      if (key === "query") {
        setQuery("");
        reset();
        return;
      }
      if (key === "dateFrom") {
        setFilters((prev) => ({ ...prev, dateFrom: undefined }));
        return;
      }
      if (key === "dateTo") {
        setFilters((prev) => ({ ...prev, dateTo: undefined }));
        return;
      }
      if (key === "minReactions") {
        setFilters((prev) => ({ ...prev, minReactions: undefined }));
        return;
      }
      if (key === "sort") {
        setFilters((prev) => ({ ...prev, sort: "newest" }));
        return;
      }
    },
    [reset]
  );

  const handleClearAll = useCallback(() => {
    setQuery("");
    setFilters({ ...DEFAULT_FILTERS });
    reset();
    setSidebarOpen(false);
  }, [reset]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const el = document.querySelector<HTMLInputElement>("[data-search-input]");
        el?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="container mx-auto py-6 px-4 lg:py-8 lg:px-6">
        <header className="mb-6 lg:mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Search confessions
          </h1>
          <p className="text-zinc-400 text-sm lg:text-base">
            Find confessions by keyword, date, reactions, and more.
          </p>
        </header>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 min-w-0">
            <SearchInput
              value={query}
              onChange={setQuery}
              onSubmit={handleSubmit}
              placeholder="Search confessions..."
              aria-label="Search confessions"
            />
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className={cn(
              "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border bg-zinc-900 text-zinc-200 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 transition-colors lg:hidden",
              sidebarOpen && "bg-zinc-800 border-zinc-600"
            )}
            aria-expanded={sidebarOpen}
            aria-controls="search-filters-sidebar"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <FilterChips
            filters={filters}
            query={query}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleClearAll}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div
            id="search-filters-sidebar"
            className={cn(
              "lg:w-80 lg:shrink-0",
              sidebarOpen ? "block" : "hidden lg:block"
            )}
            role="complementary"
            aria-label="Search filters"
          >
            <div className="lg:hidden relative mb-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="absolute top-2 right-2 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                aria-label="Close filters"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />
          </div>

          <main className="flex-1 min-w-0">
            {error && (
              <div
                className="mb-6 rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-red-200 text-sm"
                role="alert"
              >
                {error}
              </div>
            )}
            <SearchResults
              results={results}
              query={debouncedQuery.trim() || undefined}
              isLoading={isLoading}
              isEmpty={isEmpty}
              hasSearched={hasSearched}
              page={page}
              hasMore={hasMore}
              total={total}
              onLoadMore={loadMore}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
