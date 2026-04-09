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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile from Supabase — auto-creates if missing (self-healing)
  const fetchProfile = async (userId: string) => {
    console.log('[fetchProfile] Fetching for userId:', userId);
    const { data, error, status } = await supabase
      .from('profiles')
      .select('id, display_name, couple_id, spouse_email')
      .eq('id', userId)
      .single();
    console.log('[fetchProfile] Result — status:', status, 'data:', data, 'error:', error);

    if (data) {
      setProfile(data);
      return;
    }

    // Profile doesn't exist — auto-create it (handle_new_user trigger may have failed)
    console.log('[fetchProfile] Profile missing! Auto-creating...');
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({ id: userId, display_name: null });

    if (insertError) {
      console.error('[fetchProfile] Auto-create failed:', insertError.message);
      // Maybe RLS blocks insert, or it already exists — try fetching again
      const { data: retryData } = await supabase
        .from('profiles')
        .select('id, display_name, couple_id, spouse_email')
        .eq('id', userId)
        .single();
      setProfile(retryData);
      return;
    }

    console.log('[fetchProfile] Auto-created profile. Fetching again...');
    const { data: newData } = await supabase
      .from('profiles')
      .select('id, display_name, couple_id, spouse_email')
      .eq('id', userId)
      .single();
    setProfile(newData);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  // Listen for auth changes
  useEffect(() => {
    // Safety timeout — never block the app for more than 3 seconds
    const timeout = setTimeout(() => setLoading(false), 3000);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    }).catch(() => {
      clearTimeout(timeout);
      setLoading(false);
    });

    // Listen for auth changes
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

    // Realtime: auto-detect pairing when spouse signs up
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
            // Profile was updated (e.g., couple_id set by trigger)
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
    await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    await fetchProfile(user.id);
  };

  // Set spouse email — triggers auto-pairing via DB trigger
  const setSpouseEmail = async (email: string): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Não autenticado' };

    console.log('[setSpouseEmail] Updating spouse_email to:', email.trim().toLowerCase());

    try {
      const { error, status } = await supabase
        .from('profiles')
        .update({ spouse_email: email.trim().toLowerCase() })
        .eq('id', user.id);

      console.log('[setSpouseEmail] Update response — status:', status, 'error:', error);

      if (error) return { error: error.message };

      // Refresh profile — couple_id may have been set by the trigger
      console.log('[setSpouseEmail] Refreshing profile...');
      await fetchProfile(user.id);
      console.log('[setSpouseEmail] Profile refreshed. Done.');
      return { error: null };
    } catch (err) {
      console.error('[setSpouseEmail] Exception:', err);
      return { error: 'Erro de conexão com o servidor.' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      refreshProfile,
      setSpouseEmail,
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
