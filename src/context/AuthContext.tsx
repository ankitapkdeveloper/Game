'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  total_games_played: number;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (username: string, password: string) => Promise<{ error: string | null }>;
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data ?? null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setUser(session?.user ?? null);
      if (!session?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const userId = session.user.id;
      setProfile(null);
      setLoading(true);

      // Run profile queries after the auth callback returns. Supabase advises
      // against awaiting additional Supabase requests inside this callback.
      setTimeout(() => {
        if (!mounted) return;
        void fetchProfile(userId).finally(() => {
          if (mounted) setLoading(false);
        });
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // The browser client is a singleton; this subscription only needs to be set up once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = async (
    username: string,
    password: string
  ): Promise<{ error: string | null }> => {
    const normalizedUsername = username.trim().toLowerCase();
    const email = `${normalizedUsername}@gamearena.local`;

    // New usernames are normalized to lowercase; the SQL schema adds a unique
    // index on lower(username) to prevent case-variant duplicates and signup races.
    const { data: existing } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', normalizedUsername)
      .maybeSingle();

    if (existing) {
      return { error: 'Username already taken. Please choose another.' };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: normalizedUsername },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { error: 'Username already taken. Please choose another.' };
      }
      return { error: error.message };
    }

    return { error: null };
  };

  const signIn = async (
    username: string,
    password: string
  ): Promise<{ error: string | null }> => {
    const normalizedUsername = username.trim().toLowerCase();
    const email = `${normalizedUsername}@gamearena.local`;

    let { error } = await supabase.auth.signInWithPassword({ email, password });

    // Backward compatibility for accounts created by the original code, which
    // removed underscores when generating their synthetic email addresses.
    if (error && normalizedUsername.includes('_')) {
      const legacyEmail = `${normalizedUsername.replace(/[^a-z0-9]/g, '')}@gamearena.local`;
      if (legacyEmail !== email) {
        const legacyResult = await supabase.auth.signInWithPassword({
          email: legacyEmail,
          password,
        });
        error = legacyResult.error;
      }
    }

    if (error) {
      return { error: 'Invalid username or password.' };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
