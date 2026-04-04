import { useState } from 'react';
import { AlertTriangle, Shield, Loader2, MailCheck, RefreshCw, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { user, loading, signIn, signUp, resend } = useAuth();
  const { toast } = useToast();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending]   = useState(false);
  const [formError, setFormError]   = useState<string | null>(null);

  // After a successful sign-up that requires email confirmation
  const [confirmSent, setConfirmSent] = useState<string | null>(null);

  // ── Loading splash ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-screen w-screen bg-background grid-bg flex items-center justify-center">
        <div className="scanline-overlay" />
        <div className="flex flex-col items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
          </span>
          <span className="text-primary text-[11px] font-mono uppercase tracking-widest animate-pulse">
            INITIALIZING CEDARS ALERT…
          </span>
        </div>
      </div>
    );
  }

  if (user) return <>{children}</>;

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const switchTab = (toSignUp: boolean) => {
    setIsSignUp(toSignUp);
    setFormError(null);
    setConfirmSent(null);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    if (isSignUp) {
      const { error, emailSent } = await signUp(email, password, displayName);
      setSubmitting(false);

      if (error) {
        setFormError(error.message);
        return;
      }

      if (emailSent) {
        // Email confirmation required — show persistent "check your inbox" screen
        setConfirmSent(email);
        setPassword('');
      }
      // else: confirmation is disabled in Supabase Dashboard → user is immediately
      // signed in via onAuthStateChange, AuthGate unmounts automatically.
    } else {
      const { error } = await signIn(email, password);
      setSubmitting(false);
      if (error) setFormError(error.message);
    }
  };

  // ── Resend confirmation email ────────────────────────────────────────────────
  const handleResend = async () => {
    if (!confirmSent) return;
    setResending(true);
    const { error } = await resend(confirmSent);
    setResending(false);
    if (error) {
      toast({ title: 'Could not resend', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Email resent', description: `A new link was sent to ${confirmSent}` });
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen w-screen bg-background grid-bg flex items-center justify-center p-4">
      <div className="scanline-overlay" />

      <div className="w-full max-w-sm bg-card border border-border rounded-lg overflow-hidden shadow-2xl shadow-black/60">

        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-widest font-mono">
              AUTHENTICATE · CEDARS ALERT
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">LIVE</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(['Sign In', 'Sign Up'] as const).map((label, i) => {
            const active = isSignUp === (i === 1);
            return (
              <button
                key={label}
                type="button"
                onClick={() => switchTab(i === 1)}
                className={cn(
                  'flex-1 py-2.5 text-[11px] font-mono uppercase tracking-wider transition-colors',
                  i > 0 && 'border-l border-border',
                  active
                    ? 'bg-primary/10 text-primary border-b-2 border-primary/60'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Confirmation Screen ── */}
        {confirmSent ? (
          <div className="px-4 py-8 flex flex-col items-center gap-4 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <MailCheck className="h-6 w-6 text-primary" />
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-foreground font-mono uppercase tracking-widest">
                Check Your Inbox
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                We sent a verification link to
              </p>
              <p className="text-[11px] text-primary font-mono break-all font-semibold">
                {confirmSent}
              </p>
            </div>

            <p className="text-[10px] text-muted-foreground font-mono max-w-[260px] leading-relaxed">
              Click the link in the email to activate your account. Also check your spam / junk folder.
            </p>

            <div className="w-full space-y-2 pt-1">
              <Button
                onClick={handleResend}
                disabled={resending}
                variant="outline"
                className="w-full h-8 text-[11px] font-mono uppercase tracking-wider gap-1.5"
              >
                {resending
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <RefreshCw className="h-3 w-3" />}
                Resend Email
              </Button>
              <Button
                onClick={() => switchTab(false)}
                variant="ghost"
                className="w-full h-8 text-[11px] font-mono uppercase tracking-wider text-primary hover:bg-primary/10 border border-primary/30 gap-1.5"
              >
                <LogIn className="h-3 w-3" />
                Back to Sign In
              </Button>
            </div>
          </div>
        ) : (
          /* ── Auth Form ── */
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            {isSignUp && (
              <div className="space-y-1.5">
                <Label htmlFor="displayName" className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your call sign (optional)"
                  className="h-8 text-sm font-mono bg-muted/50"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="auth-email" className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                Email Address
              </Label>
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="operator@domain.com"
                autoComplete="email"
                className="h-8 text-sm font-mono bg-muted/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="auth-password" className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                Password
              </Label>
              <Input
                id="auth-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Min 6 characters"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                className="h-8 text-sm font-mono bg-muted/50"
              />
            </div>

            {formError && (
              <div className="flex items-start gap-2 bg-danger/5 border border-danger/25 rounded px-2.5 py-2">
                <AlertTriangle className="h-3 w-3 text-danger shrink-0 mt-0.5" />
                <p className="text-[11px] text-danger font-mono leading-snug">{formError}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              variant="ghost"
              className="w-full h-9 text-[11px] font-mono uppercase tracking-wider bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 hover:border-primary/50 disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {isSignUp ? 'CREATING ACCOUNT…' : 'AUTHENTICATING…'}
                </span>
              ) : isSignUp ? (
                'CREATE ACCOUNT'
              ) : (
                'SIGN IN'
              )}
            </Button>
          </form>
        )}

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
              Crisis monitoring system — authorized access only.
              All activity is logged.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
