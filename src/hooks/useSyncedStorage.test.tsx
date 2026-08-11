import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSyncedStorage } from './useSyncedStorage';

const mocks = vi.hoisted(() => {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);

  const channel = {
    on: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  };
  channel.on.mockReturnValue(channel);
  channel.subscribe.mockReturnValue(channel);

  return {
    from: vi.fn(),
    upsert: vi.fn(),
    query,
    channel,
    useAuth: vi.fn(),
    useSync: vi.fn(),
    reportStart: vi.fn(),
    reportSuccess: vi.fn(),
    reportError: vi.fn(),
  };
});

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: mocks.from,
    channel: vi.fn(() => mocks.channel),
  },
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: mocks.useAuth,
}));

vi.mock('../contexts/SyncContext', () => ({
  useSync: mocks.useSync,
}));

describe('useSyncedStorage', () => {
  beforeEach(() => {
    mocks.from.mockImplementation(() => ({
      ...mocks.query,
      upsert: mocks.upsert,
    }));
    mocks.query.maybeSingle.mockResolvedValue({ data: null, error: null });
    mocks.upsert.mockResolvedValue({ error: null });
    mocks.useAuth.mockReturnValue({
      user: { id: 'user-1' },
      profile: { couple_id: 'couple-1' },
    });
    mocks.useSync.mockReturnValue({
      reportStart: mocks.reportStart,
      reportSuccess: mocks.reportSuccess,
      reportError: mocks.reportError,
    });
  });

  it('starts offline-first and replaces local data only with newer remote data', async () => {
    window.localStorage.setItem('ens-test', JSON.stringify({ source: 'local' }));
    window.localStorage.setItem('ens-test::synced-at', '2026-01-01T00:00:00.000Z');
    mocks.query.maybeSingle.mockResolvedValue({
      data: {
        data: { source: 'remote' },
        updated_at: '2026-01-02T00:00:00.000Z',
      },
      error: null,
    });

    const { result } = renderHook(() => useSyncedStorage('ens-test', { source: 'default' }));

    expect(result.current[0]).toEqual({ source: 'local' });
    await waitFor(() => expect(result.current[0]).toEqual({ source: 'remote' }));
    expect(window.localStorage.getItem('ens-test')).toBe(JSON.stringify({ source: 'remote' }));
    expect(mocks.query.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(mocks.reportSuccess).toHaveBeenCalledWith(
      'ens-test',
      '2026-01-02T00:00:00.000Z',
    );
  });

  it('persists changes locally immediately and debounces the user-scoped upload', async () => {
    const { result } = renderHook(() => useSyncedStorage('ens-test', { count: 0 }));
    await waitFor(() => expect(mocks.reportSuccess).toHaveBeenCalled());

    act(() => {
      result.current[1](previous => ({ count: previous.count + 1 }));
    });

    expect(result.current[0]).toEqual({ count: 1 });
    expect(window.localStorage.getItem('ens-test')).toBe(JSON.stringify({ count: 1 }));
    await waitFor(() => expect(mocks.upsert).toHaveBeenCalledWith(
      { user_id: 'user-1', data_key: 'ens-test', data: { count: 1 } },
      { onConflict: 'user_id,data_key' },
    ), { timeout: 2_000 });
  });

  it('uses the couple table and couple id for shared data', async () => {
    renderHook(() => useSyncedStorage('ens-shared', [], { scope: 'couple' }));

    await waitFor(() => expect(mocks.from).toHaveBeenCalledWith('couple_data'));
    expect(mocks.query.eq).toHaveBeenCalledWith('couple_id', 'couple-1');
    expect(mocks.query.eq).toHaveBeenCalledWith('data_key', 'ens-shared');
  });
});
