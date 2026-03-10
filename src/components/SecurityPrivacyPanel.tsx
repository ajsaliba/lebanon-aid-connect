import { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Fingerprint, Bell, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface SecuritySetting {
  id: string;
  labelKey: string;
  descKey: string;
  icon: React.ReactNode;
  enabled: boolean;
}

const initialSettings: SecuritySetting[] = [
  { id: 'anonymous', labelKey: 'security.anonymousReporting', descKey: 'security.anonymousDesc', icon: <Eye className="h-3.5 w-3.5" />, enabled: true },
  { id: 'location_blur', labelKey: 'security.locationBlur', descKey: 'security.locationBlurDesc', icon: <EyeOff className="h-3.5 w-3.5" />, enabled: false },
  { id: 'e2e', labelKey: 'security.e2e', descKey: 'security.e2eDesc', icon: <Lock className="h-3.5 w-3.5" />, enabled: true },
  { id: 'biometric', labelKey: 'security.biometric', descKey: 'security.biometricDesc', icon: <Fingerprint className="h-3.5 w-3.5" />, enabled: false },
  { id: 'silent', labelKey: 'security.silent', descKey: 'security.silentDesc', icon: <Bell className="h-3.5 w-3.5" />, enabled: false },
  { id: 'offline_data', labelKey: 'security.offlineWipe', descKey: 'security.offlineWipeDesc', icon: <WifiOff className="h-3.5 w-3.5" />, enabled: false },
];

export function SecurityPrivacyPanel() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(initialSettings);

  const toggle = (id: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const enabledCount = settings.filter(s => s.enabled).length;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Shield className="h-3 w-3" /> {t('security.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">
          {enabledCount}/{settings.length} {t('security.subtitle')}
        </p>
      </div>

      {/* Security score */}
      <div className="p-2">
        <div className="bg-muted/30 rounded p-2 text-center space-y-1">
          <div className={cn('text-lg font-bold', enabledCount >= 4 ? 'text-success' : enabledCount >= 2 ? 'text-warning' : 'text-danger')}>
            {Math.round((enabledCount / settings.length) * 100)}%
          </div>
          <div className="text-[9px] text-muted-foreground">{t('security.score')}</div>
          <div className="flex justify-center gap-0.5">
            {settings.map(s => (
              <div key={s.id} className={cn('h-1 w-4 rounded-full', s.enabled ? 'bg-success' : 'bg-muted')} />
            ))}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="p-2 space-y-1">
        {settings.map(setting => (
          <button key={setting.id} onClick={() => toggle(setting.id)}
            className="w-full border border-border rounded p-2 flex items-center gap-2 hover:bg-muted/20 transition-colors text-left">
            <span className={cn(setting.enabled ? 'text-success' : 'text-muted-foreground')}>{setting.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium">{t(setting.labelKey)}</div>
              <div className="text-[8px] text-muted-foreground">{t(setting.descKey)}</div>
            </div>
            <div className={cn('h-4 w-7 rounded-full p-0.5 transition-colors',
              setting.enabled ? 'bg-success' : 'bg-muted')}>
              <div className={cn('h-3 w-3 rounded-full bg-white transition-transform',
                setting.enabled ? 'translate-x-3' : 'translate-x-0')} />
            </div>
          </button>
        ))}
      </div>

      {/* Info */}
      <div className="p-2 border-t border-border">
        <p className="text-[8px] text-muted-foreground text-center">
          {t('security.footer')}
        </p>
      </div>
    </div>
  );
}
