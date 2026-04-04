import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type UserRole = 'viewer' | 'volunteer' | 'coordinator' | 'admin';

export interface UserProfile {
  id: string;
  role: UserRole;
  display_name: string | null;
  region: string | null;
  organization: string | null;
  created_at: string;
}

export const ROLE_COLORS: Record<UserRole, string> = {
  viewer: 'text-muted-foreground',
  volunteer: 'text-success',
  coordinator: 'text-primary',
  admin: 'text-purple-400',
};

export const ROLE_BG: Record<UserRole, string> = {
  viewer: 'bg-muted/50 border-border',
  volunteer: 'bg-success/10 border-success/30',
  coordinator: 'bg-primary/10 border-primary/30',
  admin: 'bg-purple-500/10 border-purple-500/30',
};

function profileFromMeta(user: { id: string; email?: string; created_at: string; user_metadata?: Record<string, unknown> }): UserProfile {
  const meta = user.user_metadata ?? {};
  const validRoles: UserRole[] = ['viewer', 'volunteer', 'coordinator', 'admin'];
  const metaRole = meta.role as string | undefined;
  return {
    id: user.id,
    role: validRoles.includes(metaRole as UserRole) ? (metaRole as UserRole) : 'viewer',
    display_name: (meta.display_name as string | undefined) ?? user.email?.split('@')[0] ?? null,
    region: (meta.region as string | undefined) ?? null,
    organization: (meta.organization as string | undefined) ?? null,
    created_at: user.created_at,
  };
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) {
          // Table exists and row found — prefer DB values but fall back to
          // user_metadata for any fields not yet written to the table.
          const meta = user.user_metadata ?? {};
          const validRoles: UserRole[] = ['viewer', 'volunteer', 'coordinator', 'admin'];
          const dbRole = data.role as string;
          setProfile({
            id: data.id as string,
            role: validRoles.includes(dbRole as UserRole) ? (dbRole as UserRole) : 'viewer',
            display_name: (data.display_name as string | null) ?? (meta.display_name as string | undefined) ?? null,
            region: (data.region as string | null) ?? (meta.region as string | undefined) ?? null,
            organization: (data.organization as string | null) ?? (meta.organization as string | undefined) ?? null,
            created_at: data.created_at as string,
          });
        } else {
          // Table doesn't exist yet or row missing — read everything from
          // user_metadata (set by supabase.auth.updateUser).
          setProfile(profileFromMeta(user));
        }
        setLoading(false);
      });
  }, [user]);

  const canWrite = profile?.role === 'volunteer' || profile?.role === 'coordinator' || profile?.role === 'admin';
  const canCoordinate = profile?.role === 'coordinator' || profile?.role === 'admin';
  const isAdmin = profile?.role === 'admin';

  return { profile, loading, canWrite, canCoordinate, isAdmin };
}
