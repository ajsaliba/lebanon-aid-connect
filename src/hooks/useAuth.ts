import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AuthError, User } from '@supabase/supabase-js';

export interface SignUpResult {
  error: { message: string } | null;
  /** true  → confirmation email was dispatched, user must verify before logging in  */
  emailSent: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync immediately, then keep in sync via realtime listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    displayName?: string,
  ): Promise<SignUpResult> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Must match an entry in Supabase Dashboard → Auth → URL Configuration → Redirect URLs
        emailRedirectTo: `${window.location.origin}/`,
        data: displayName ? { display_name: displayName } : undefined,
      },
    });

    if (error) return { error, emailSent: false };

    // Supabase returns a user object with an EMPTY identities array when the
    // email is already registered (security feature — no error is returned).
    if (data.user?.identities !== undefined && data.user.identities.length === 0) {
      return {
        error: { message: 'An account with this email already exists. Please sign in instead.' },
        emailSent: false,
      };
    }

    // session non-null  → email confirmation is disabled, user is already logged in
    // session null      → confirmation email was sent, user must click the link
    const emailSent = !!data.user && data.session === null;
    return { error: null, emailSent };
  }, []);

  const resend = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { user, loading, signIn, signUp, resend, signOut };
}
