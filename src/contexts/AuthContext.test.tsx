import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

const mocks = vi.hoisted(() => {
  const channel = {
    on: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  };
  channel.on.mockReturnValue(channel);
  channel.subscribe.mockReturnValue(channel);

  return {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    channel,
  };
});

vi.mock('../lib/supabase', () => ({
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
      signUp: mocks.signUp,
      signInWithPassword: mocks.signInWithPassword,
      signInWithOAuth: mocks.signInWithOAuth,
      signOut: mocks.signOut,
      resetPasswordForEmail: mocks.resetPasswordForEmail,
    },
    channel: vi.fn(() => mocks.channel),
  },
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    mocks.getSession.mockResolvedValue({ data: { session: null } });
    mocks.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mocks.signInWithPassword.mockResolvedValue({ error: null });
    mocks.signOut.mockResolvedValue({ error: null });
    mocks.resetPasswordForEmail.mockResolvedValue({ error: null });
  });

  it('forwards email/password login to Supabase and settles loading', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signIn('pessoa@example.com', 'senha-segura');
    });

    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: 'pessoa@example.com',
      password: 'senha-segura',
    });
  });

  it('normalizes the recovery email and uses an app-local redirect', async () => {
    window.history.replaceState({}, '', '/dia-a-dia-ens/');
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.sendPasswordReset('  PESSOA@EXAMPLE.COM  ');
    });

    expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith(
      'pessoa@example.com',
      expect.objectContaining({
        redirectTo: expect.stringMatching(/^http:\/\/localhost(?::\d+)?\//),
      }),
    );
  });

  it('clears the authenticated user when logout succeeds', async () => {
    const user = { id: 'user-1', email: 'pessoa@example.com' };
    const session = { user, access_token: 'access-token' };
    mocks.getSession.mockResolvedValue({ data: { session } });
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const data = url.includes('/rpc/')
        ? null
        : [{ id: user.id, display_name: 'Pessoa', couple_id: 'couple-1', spouse_email: null }];
      return {
        ok: true,
        status: 200,
        json: async () => data,
      } as Response;
    }));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user?.id).toBe(user.id));

    await act(async () => {
      await result.current.signOut();
    });

    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
  });

  it('saves a normalized spouse email without exposing a couple id update', async () => {
    const user = { id: 'user-1', email: 'pessoa@example.com' };
    const session = { user, access_token: 'access-token' };
    let spouseEmail: string | null = null;
    mocks.getSession.mockResolvedValue({ data: { session } });

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/rpc/check_and_pair')) {
        return { ok: true, status: 200, json: async () => null } as Response;
      }
      if (init?.method === 'PATCH') {
        const body = JSON.parse(String(init.body)) as Record<string, unknown>;
        spouseEmail = String(body.spouse_email);
      }
      const profile = {
        id: user.id,
        display_name: 'Pessoa',
        couple_id: null,
        spouse_email: spouseEmail,
      };
      return { ok: true, status: 200, json: async () => [profile] } as Response;
    });
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.profile?.id).toBe(user.id));

    let response: { error: string | null } | undefined;
    await act(async () => {
      response = await result.current.setSpouseEmail('  CONJUGE@EXAMPLE.COM  ');
    });

    expect(response).toEqual({ error: null });
    const patchCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH');
    expect(JSON.parse(String(patchCall?.[1]?.body))).toEqual({
      spouse_email: 'conjuge@example.com',
    });
  });
});
