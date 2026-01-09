import { useState, useEffect, useCallback } from 'react';

interface UseLazyLoadOptions<T> {
  fetchFunction: (params: Record<string, string>) => Promise<{
    success: boolean;
    data: T[] | { items: T[]; pagination?: any };
    meta?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }>;
  initialParams?: Record<string, string>;
  pageSize?: number;
}

interface LazyLoadResult<T> {
  data: T[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  search: string;
  setSearch: (search: string) => void;
  loadMore: () => void;
  refresh: () => Promise<void>;
  reset: () => void;
}

export function useLazyLoad<T extends { id: number }>({
  fetchFunction,
  initialParams = {},
  pageSize = 20,
}: UseLazyLoadOptions<T>): LazyLoadResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [lastParams, setLastParams] = useState<Record<string, string>>(initialParams);

  const fetchData = useCallback(async (
    currentPage: number = 1,
    currentSearch: string = '',
    params: Record<string, string> = initialParams,
    isLoadMore: boolean = false
  ) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setData([]);
    }

    try {
      const queryParams: Record<string, string> = {
        ...params,
        per_page: pageSize.toString(),
        page: currentPage.toString(),
        ...(currentSearch && { q: currentSearch }),
      };

      const response = await fetchFunction(queryParams);

      if (response.success) {
        let newData: T[];
        if (Array.isArray(response.data)) {
          newData = response.data;
        } else if (response.data && 'items' in response.data) {
          newData = response.data.items;
        } else {
          newData = [];
        }
        
        if (isLoadMore) {
          setData(prev => [...prev, ...newData]);
        } else {
          setData(newData);
        }

        // Check if there are more pages
        if (response.meta) {
          setHasMore(currentPage < response.meta.last_page);
        } else if (response.data && 'pagination' in response.data && response.data.pagination) {
          setHasMore(currentPage < response.data.pagination.last_page);
        } else {
          // Fallback: if we got less than pageSize, assume no more data
          setHasMore(newData.length === pageSize);
        }

        setPage(currentPage);
      } else {
        setHasMore(false);
        if (!isLoadMore) {
          setData([]);
        }
      }
    } catch (error) {
      console.error('Error in lazy load:', error);
      setHasMore(false);
      if (!isLoadMore) {
        setData([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [fetchFunction, pageSize, initialParams]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      fetchData(page + 1, search, lastParams, true);
    }
  }, [fetchData, page, search, hasMore, loadingMore, lastParams]);

  const refresh = useCallback(async () => {
    await fetchData(1, search, lastParams, false);
  }, [fetchData, search, lastParams]);

  const handleSearch = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
    setHasMore(true);
  }, []);

  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setSearch('');
    setHasMore(true);
    setLoading(false);
    setLoadingMore(false);
  }, []);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (page === 1) {
        fetchData(1, search, lastParams, false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, fetchData, page, lastParams]);

  // Initial load
  useEffect(() => {
    fetchData(1, search, initialParams, false);
  }, [fetchData, search, initialParams]);

  // Update params when they change
  useEffect(() => {
    if (JSON.stringify(lastParams) !== JSON.stringify(initialParams)) {
      setLastParams(initialParams);
      fetchData(1, search, initialParams, false);
    }
  }, [initialParams, fetchData, search, lastParams]);

  return {
    data,
    loading,
    loadingMore,
    hasMore,
    search,
    setSearch: handleSearch,
    loadMore,
    refresh,
    reset,
  };
}