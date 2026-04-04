import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, ROLE_COLORS, ROLE_BG, type UserRole } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LogOut, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'viewer',      label: 'Viewer'      },
  { value: 'volunteer',   label: 'Volunteer'   },
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'admin',       label: 'Admin'       },
];

export function AuthDialog() {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { toast } = useToast();

  const [profileOpen, setProfileOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [displayName,  setDisplayName]  = useState('');
  const [region,       setRegion]       = useState('');
  const [organization, setOrganization] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('viewer');

  // Seed form whenever dialog opens (or profile finishes loading)
  useEffect(() => {
    if (profileOpen && profile) {
      setDisplayName(profile.display_name ?? '');
      setRegion(profile.region ?? '');
      setOrganization(profile.organization ?? '');
      setSelectedRole(profile.role);
    }
  }, [profileOpen, profile]);

  if (!user) return null;

  const resolvedName =
    profile?.display_name ??
    (user.user_metadata?.display_name as string | undefined) ??
    user.email?.split('@')[0] ??
    'User';

  const initials = resolvedName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const role    = profile?.role ?? 'viewer';
  const roleColor = ROLE_COLORS[role];
  const roleBg    = ROLE_BG[role];

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const trimmed = {
      display_name: displayName.trim() || null,
      region:       region.trim()      || null,
      organization: organization.trim()|| null,
      role:         selectedRole,
    };

    // Primary: store in user_metadata via Supabase Auth — always works,
    // no custom table required. onAuthStateChange fires after this, which
    // causes useProfile to re-read and pick up the new values.
    const { error: authErr } = await supabase.auth.updateUser({ data: trimmed });

    if (authErr) {
      setSaving(false);
      toast({ title: 'Failed to save', description: authErr.message, variant: 'destructive' });
      return;
    }

    // Secondary: persist to profiles table if it exists (best-effort).
    // Errors here are silently ignored so the UX always succeeds.
    await supabase
      .from('profiles')
      .upsert({ id: user.id, ...trimmed }, { onConflict: 'id' })
      .then(() => {/* ignore */});

    setSaving(false);
    toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
    setProfileOpen(false);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex items-center gap-2">
        {/* Role badge */}
        {!profileLoading && (
          <span className={cn(
            'hidden sm:inline-flex px-1.5 py-0.5 rounded border text-[9px] font-mono uppercase tracking-wider',
            roleColor, roleBg
          )}>
            {role}
          </span>
        )}

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="h-7 w-7 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center justify-center text-[10px] font-bold font-mono hover:bg-primary/20 transition-colors"
              aria-label="User menu"
            >
              {initials || <User className="h-3 w-3" />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 text-xs">
            <div className="px-2 py-1.5">
              <p className="font-semibold text-xs truncate">{resolvedName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs gap-1.5 cursor-pointer"
              onClick={() => setProfileOpen(true)}
            >
              <User className="h-3 w-3" /> Edit Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs gap-1.5 text-red-400 focus:text-red-400 cursor-pointer"
              onClick={() => signOut()}
            >
              <LogOut className="h-3 w-3" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Profile dialog ── */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2 text-primary font-mono uppercase tracking-wider">
              <User className="h-4 w-4" /> Edit Profile
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3 pt-1">

            {/* Role selector */}
            <div className="space-y-1.5">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                Role
              </Label>
              <div className="grid grid-cols-4 gap-1">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setSelectedRole(r.value)}
                    className={cn(
                      'py-1.5 rounded border text-[9px] font-mono uppercase tracking-wider transition-colors',
                      selectedRole === r.value
                        ? cn(ROLE_COLORS[r.value], ROLE_BG[r.value])
                        : 'text-muted-foreground border-border hover:bg-muted/50'
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-name" className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                Display Name
              </Label>
              <Input
                id="profile-name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your call sign"
                className="h-8 text-xs font-mono bg-muted/50"
              />
            </div>

            {/* Region */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-region" className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                Region
              </Label>
              <Input
                id="profile-region"
                value={region}
                onChange={e => setRegion(e.target.value)}
                placeholder="e.g. Beirut, South Lebanon"
                className="h-8 text-xs font-mono bg-muted/50"
              />
            </div>

            {/* Organization */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-org" className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                Organization
              </Label>
              <Input
                id="profile-org"
                value={organization}
                onChange={e => setOrganization(e.target.value)}
                placeholder="e.g. Red Cross, UNHCR"
                className="h-8 text-xs font-mono bg-muted/50"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs font-mono"
                onClick={() => setProfileOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                variant="ghost"
                className="flex-1 h-8 text-xs font-mono bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
