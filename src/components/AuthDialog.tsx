import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LogIn, LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';

export function AuthDialog() {
  const { user, signIn, signUp, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password);
    setLoading(false);

    if (error) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } else {
      if (isSignUp) {
        toast({ title: t('auth.checkEmail'), description: t('auth.confirmationSent') });
      }
      setOpen(false);
      setEmail('');
      setPassword('');
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{user.email}</span>
        <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1" onClick={signOut}>
          <LogOut className="h-3 w-3" /> {t('auth.logout')}
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1">
          <LogIn className="h-3 w-3" /> {t('auth.login')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {isSignUp ? t('auth.createAccount') : t('auth.signIn')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">{t('auth.email')}</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="h-8 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs">{t('auth.password')}</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="h-8 text-sm" />
          </div>
          <Button type="submit" className="w-full h-8 text-sm" disabled={loading}>
            {loading ? t('auth.pleaseWait') : isSignUp ? t('auth.signUp') : t('auth.signIn')}
          </Button>
          <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-xs text-muted-foreground hover:text-foreground w-full text-center">
            {isSignUp ? t('auth.haveAccount') : t('auth.noAccount')}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
