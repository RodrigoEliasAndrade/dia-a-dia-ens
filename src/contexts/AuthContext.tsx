import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  display_name: string | null;
  couple_id: string | null;
  spouse_email: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  setSpouseEmail: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Raw fetch helper with timeout — bypasses Supabase JS client issues
async function supabaseFetch(
  path: string,
  token: string,
  options: { method?: string; body?: object } = {}
) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': options.method === 'POST' ? 'return=representation' :
                  options.method === 'PATCH' ? 'return=representation' : '',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timer);
    return { res, data: await res.json(), error: null };
  } catch (e) {
    clearTimeout(timer);
    return { res: null, data: null, error: e instanceof DOMException ? 'timeout' : String(e) };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current access token
  const getToken = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token ?? null;
  };

  // Fetch profile using raw fetch — with auto-create if missing
  const fetchProfile = async (userId: string) => {
    const token = await getToken();
    if (!token) {
      console.warn('[fetchProfile] No token — session expired');
      setProfile(null);
      return;
    }

    // Read profile
    const { data, error } = await supabaseFetch(
      `profiles?id=eq.${userId}&select=id,display_name,couple_id,spouse_email`,
      token
    );

    if (error) {
      console.error('[fetchProfile] Network error:', error);
      setProfile(null);
      return;
    }

    // Check for auth errors (deleted user, expired token)
    if (data?.code === 'PGRST301' || data?.code === '401' || data?.message?.includes('JWT')) {
      console.warn('[fetchProfile] Invalid session — forcing logout');
      await forceLogout();
      return;
    }

    if (Array.isArray(data) && data.length > 0) {
      setProfile(data[0]);
      return;
    }

    // Profile missing — auto-create
    console.log('[fetchProfile] Profile missing, auto-creating...');
    const { data: insertData, error: insertError } = await supabaseFetch(
      'profiles',
      token,
      { method: 'POST', body: { id: userId, display_name: null } }
    );

    if (insertError) {
      console.error('[fetchProfile] Auto-create failed:', insertError);
      setProfile(null);
      return;
    }

    if (Array.isArray(insertData) && insertData.length > 0) {
      setProfile(insertData[0]);
    } else {
      // Insert succeeded but no return data — re-fetch
      const { data: retryData } = await supabaseFetch(
        `profiles?id=eq.${userId}&select=id,display_name,couple_id,spouse_email`,
        token
      );
      if (Array.isArray(retryData) && retryData.length > 0) {
        setProfile(retryData[0]);
      }
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  // Force logout — clears everything when session is invalid
  const forceLogout = async () => {
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
    setUser(null);
    setSession(null);
    setProfile(null);
    // Clear onboarding flag so user sees fresh start
    localStorage.removeItem('ens-onboarding-done');
  };

  // Listen for auth changes
  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(timeout);

      if (session?.user) {
        // Validate session is still alive by making a quick check
        const token = session.access_token;
        const { data, error } = await supabaseFetch(
          `profiles?id=eq.${session.user.id}&select=id&limit=1`,
          token
        );

        if (error === 'timeout') {
          // Network issue — keep session, try later
          console.warn('[init] Supabase timeout — keeping session');
          setSession(session);
          setUser(session.user);
          setLoading(false);
          return;
        }

        if (data?.code === 'PGRST301' || data?.message?.includes('JWT')) {
          // Dead session — force logout
          console.warn('[init] Dead session detected — forcing logout');
          await forceLogout();
          setLoading(false);
          return;
        }

        // Session is valid
        setSession(session);
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    }).catch(() => {
      clearTimeout(timeout);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Realtime: auto-detect pairing
    let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s?.user) {
        realtimeChannel = supabase
          .channel('profile-pairing')
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${s.user.id}`,
          }, (payload) => {
            setProfile(payload.new as Profile);
          })
          .subscribe();
      }
    });

    return () => {
      subscription.unsubscribe();
      realtimeChannel?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const token = await getToken();
    if (!token) return;
    await supabaseFetch(
      `profiles?id=eq.${user.id}`,
      token,
      { method: 'PATCH', body: updates }
    );
    await fetchProfile(user.id);
  };

  // Set spouse email — triggers auto-pairing via DB trigger
  const setSpouseEmail = async (email: string): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Não autenticado' };

    const token = await getToken();
    if (!token) return { error: 'Sessão expirada. Faça login novamente.' };

    const { data, error, res } = await supabaseFetch(
      `profiles?id=eq.${user.id}`,
      token,
      { method: 'PATCH', body: { spouse_email: email.trim().toLowerCase() } }
    );

    if (error) return { error: error === 'timeout' ? 'Servidor não respondeu. Tente novamente.' : error };
    if (!res?.ok) return { error: data?.message || `Erro ${res?.status}` };

    // Refresh profile — couple_id may have been set by the trigger
    await fetchProfile(user.id);
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, loading,
      signUp, signIn, signOut, updateProfile, refreshProfile, setSpouseEmail,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
