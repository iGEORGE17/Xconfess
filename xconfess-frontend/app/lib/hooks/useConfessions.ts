import { useEffect, useState } from "react";
import apiClient from "@/app/lib/api/client";
import { getErrorMessage } from "@/app/lib/utils/errorHandler";

import { Confession } from "@/app/lib/types/confession";

export const useConfessions = () => {
  const [data, setData] = useState<Confession[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfessions = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get(`/confessions?page=${page}`);
        setData(res.data.confessions || []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchConfessions();
  }, [page]);

  return { data, loading, error, setPage };
};

