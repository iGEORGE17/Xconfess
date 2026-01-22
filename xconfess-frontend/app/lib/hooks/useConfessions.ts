"use client";
import { useEffect, useRef, useState } from "react";
import { Confession } from "../types/confession";

export const useInfiniteConfessions = () => {
  const [data, setData] = useState<Confession[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchConfessions = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/confessions?page=${page}`);

        if (!res.ok) {
          throw new Error(`Failed to fetch confessions: ${res.statusText}`);
        }

        const result = await res.json();

        if (result.confessions.length === 0) setHasMore(false);
        setData(prev => [...prev, ...result.confessions]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Fetch confessions error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfessions();
  }, [page]);

  useEffect(() => {
    if (!observerRef.current || !hasMore) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loading) {
        setPage(p => p + 1);
      }
    });

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  return { data, loading, hasMore, observerRef, error };
};
