import { useEffect, useRef,useState } from 'react';

export const cache = new Map<string, any>();
export const activeRequests = new Map<string, Promise<any>>();

type UseAsyncRequestOptions<T> = {
  /**
   * Unique key for the query
   */
  queryKey: string | any[];
  /**
   * Query function that returns a promise
   * Note: For best performance, use a stable function reference
   * (defined outside component or wrapped in useCallback)
   * But not required - the hook will work without it
   */
  queryFn: () => Promise<T>;
  /**
   * Whether the query should execute
   * @default true
   */
  enabled?: boolean;
  /**
   * Whether to disable caching
   * @default false
   */
  disableCache?: boolean;
};

export function useAsync<T>({
  queryKey,
  queryFn,
  enabled = true,
  disableCache = false,
}: UseAsyncRequestOptions<T>) {
  const [state, setState] = useState<{
    data: T | null;
    isLoading: boolean;
    error: Error | null;
  }>({
    data: null,
    isLoading: false,
    error: null,
  });

  const mountedRef = useRef(false);
  const queryFnRef = useRef(queryFn);
  const cacheKey = Array.isArray(queryKey)
    ? JSON.stringify(queryKey)
    : queryKey;

  // Always update the current function
  queryFnRef.current = queryFn;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const cleanup = () => { active = false; };

    if (!enabled) {
      setState({
        data: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    if (!disableCache && cache.has(cacheKey)) {
      setState(prev => ({
        ...prev,
        data: cache.get(cacheKey),
        isLoading: false,
        error: null,
      }));
      return;
    }

    if (activeRequests.has(cacheKey)) {
      activeRequests.get(cacheKey)!.then(
        (data) => {
          if (active && mountedRef.current) {
            setState({
              data,
              isLoading: false,
              error: null,
            });
          }
        },
        (error) => {
          if (active && mountedRef.current) {
            setState({
              data: null,
              isLoading: false,
              error,
            });
          }
        }
      );
      return cleanup;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const requestPromise = queryFnRef.current()
      .then((data) => {
        if (!disableCache) {
          cache.set(cacheKey, data);
        }
        if (active && mountedRef.current) {
          setState({
            data,
            isLoading: false,
            error: null,
          });
        }
        return data;
      })
      .catch((error) => {
        if (active && mountedRef.current) {
          setState({
            data: null,
            isLoading: false,
            error,
          });
        }
      })
      .finally(() => {
        activeRequests.delete(cacheKey);
      });

    activeRequests.set(cacheKey, requestPromise);
    return cleanup;
  }, [cacheKey, enabled, disableCache]);

  const refetch = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const data = await queryFnRef.current();
      if (!disableCache) {
        cache.set(cacheKey, data);
      }
      if (mountedRef.current) {
        setState({
          data,
          isLoading: false,
          error: null,
        });
      }
      return data;
    } catch (error) {
      if (mountedRef.current) {
        setState({
          data: null,
          isLoading: false,
          error: error as Error,
        });
      }
      throw error;
    }
  };

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refetch,
  };
}