import { act, cleanup,renderHook, waitFor } from '@testing-library/react';

import { activeRequests,cache, useAsync } from '../../src/hooks/useAsync';

describe('useAsync', () => {
  beforeEach(() => {
    cache.clear();
    activeRequests.clear();
  });
  afterEach(cleanup);

  it('should return initial state', async () => {
    const { result } = renderHook(() =>
      useAsync({
        queryKey: 'test1',
        queryFn: async () => 'data',
      })
    );
    await waitFor(() => {
      expect(result.current.data).toBeNull();
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
    });

  });

  it('should fetch data and update state', async () => {
    const queryFn = jest.fn().mockResolvedValue('data');

    const { result } = renderHook(() =>
      useAsync({
        queryKey: 'test2',
        queryFn,
      })
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe('data');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it('should handle errors', async () => {
    const queryFn = jest.fn().mockRejectedValue(new Error('Error occurred'));

    const { result } = renderHook(() =>
      useAsync({
        queryKey: 'test3',
        queryFn,
      })
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error?.message).toEqual('Error occurred');
  });

  it('should use cached data if available', async () => {
    cache.set('test4', 'cachedData');

    const queryFn = jest.fn().mockResolvedValue('data');

    const { result } = renderHook(() =>
      useAsync({
        queryKey: 'test4',
        queryFn,
      })
    );

    expect(result.current.data).toBe('cachedData');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(queryFn).not.toHaveBeenCalled();
  });

  it('should refetch data when refetch is called', async () => {
    const queryFn = jest.fn().mockResolvedValue('data');

    const { result } = renderHook(() =>
      useAsync({
        queryKey: 'test5',
        queryFn,
      })
    );

    await waitFor(async () => {
      await expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.data).toBe('data');

    expect(result.current.data).toBe('data');

    queryFn.mockResolvedValue('newData');

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toBe('newData');
    expect(queryFn).toHaveBeenCalledTimes(2);
  });

  it('should not fetch data if enabled is false', () => {
    const queryFn = jest.fn();

    const { result } = renderHook(() =>
      useAsync({
        queryKey: 'test6',
        queryFn,
        enabled: false,
      })
    );

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(queryFn).not.toHaveBeenCalled();
  });

  it('should clear states on enabled change to false', async () => {
    const queryFn = jest.fn().mockResolvedValue('data');

    const { result, rerender } = renderHook(
      ({ enabled }) =>
        useAsync({
          queryKey: 'test7',
          queryFn,
          enabled,
        }),
      {
        initialProps: { enabled: true },
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe('data');

    rerender({ enabled: false });

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('ignores an old query result after switching keys', async () => {
    let resolveOld!: (value: string) => void;
    const oldRequest = new Promise<string>((resolve) => { resolveOld = resolve; });
    const queryFn = jest.fn().mockReturnValueOnce(oldRequest).mockResolvedValueOnce('new data');
    const { result, rerender } = renderHook(
      ({ queryKey }) => useAsync({ queryKey, queryFn }),
      { initialProps: { queryKey: 'old-query' } }
    );

    rerender({ queryKey: 'new-query' });
    await waitFor(() => expect(result.current.data).toBe('new data'));
    await act(async () => { resolveOld('old data'); });

    expect(result.current.data).toBe('new data');
    expect(result.current.error).toBeNull();
    expect(cache.get('old-query')).toBe('old data');
  });

  it('ignores an old query error after switching keys', async () => {
    let rejectOld!: (error: Error) => void;
    const oldRequest = new Promise<string>((_, reject) => { rejectOld = reject; });
    const queryFn = jest.fn().mockReturnValueOnce(oldRequest).mockResolvedValueOnce('new data');
    const { result, rerender } = renderHook(
      ({ queryKey }) => useAsync({ queryKey, queryFn }),
      { initialProps: { queryKey: 'old-query-error' } }
    );

    rerender({ queryKey: 'new-query-success' });
    await waitFor(() => expect(result.current.data).toBe('new data'));
    await act(async () => { rejectOld(new Error('old request failed')); });

    expect(result.current.data).toBe('new data');
    expect(result.current.error).toBeNull();
  });

  it('does not restore data when a pending query is disabled', async () => {
    let resolveRequest!: (value: string) => void;
    const request = new Promise<string>((resolve) => { resolveRequest = resolve; });
    const queryFn = jest.fn(() => request);
    const { result, rerender } = renderHook(
      ({ enabled }) => useAsync({ queryKey: 'disabled-pending', queryFn, enabled }),
      { initialProps: { enabled: true } }
    );

    rerender({ enabled: false });
    await act(async () => { resolveRequest('late data'); });

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('ignores a shared request for a disabled subscriber while updating the active one', async () => {
    let resolveRequest!: (value: string) => void;
    const request = new Promise<string>((resolve) => { resolveRequest = resolve; });
    const queryFn = jest.fn(() => request);
    const owner = renderHook(() => useAsync({ queryKey: 'shared-pending', queryFn }));
    const subscriber = renderHook(
      ({ enabled }) => useAsync({ queryKey: 'shared-pending', queryFn, enabled }),
      { initialProps: { enabled: true } }
    );

    subscriber.rerender({ enabled: false });
    await act(async () => { resolveRequest('shared data'); });

    expect(owner.result.current.data).toBe('shared data');
    expect(subscriber.result.current.data).toBeNull();
    expect(subscriber.result.current.isLoading).toBe(false);
    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(activeRequests.has('shared-pending')).toBe(false);
  });
});