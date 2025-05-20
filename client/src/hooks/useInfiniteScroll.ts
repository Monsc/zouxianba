import { useState, useCallback, useEffect, useRef } from 'react';

interface UseInfiniteScrollOptions<T> {
  fetchData: (page: number) => Promise<T[]>;
  initialData: T[];
  setData: (data: T[]) => void;
  threshold?: number;
  pageSize?: number;
}

interface UseInfiniteScrollResult {
  loadMore: () => Promise<void>;
  hasMore: boolean;
  loading: boolean;
  error: Error | null;
}

export function useInfiniteScroll<T>({
  fetchData,
  initialData,
  setData,
  threshold = 100,
  pageSize = 10,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollResult {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);
      const newData = await fetchData(page + 1);
      
      if (newData.length === 0) {
        setHasMore(false);
        return;
      }

      setData([...initialData, ...newData]);
      setPage(page + 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('加载失败'));
    } finally {
      setLoading(false);
    }
  }, [fetchData, initialData, loading, hasMore, page, setData]);

  useEffect(() => {
    const currentObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loading && hasMore) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: `${threshold}px`,
        threshold: 0.1,
      }
    );

    if (loadingRef.current) {
      currentObserver.observe(loadingRef.current);
    }

    observer.current = currentObserver;

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loadMore, loading, hasMore, threshold]);

  return {
    loadMore,
    hasMore,
    loading,
    error,
  };
} 