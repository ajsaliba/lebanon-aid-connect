import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Database, Clock, MapPin } from 'lucide-react';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { useTranslation } from '@/lib/i18n';

export function StatusBar() {
  const { isLive, lastUpdated, news } = useNewsFeedContext();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { t } = useTranslation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatTime = (date: Date | null) => {
    if (!date) return t('status.never');
    const diff = Date.now() - date.getTime();
    if (diff < 60000) return t('time.justNow');
    if (diff < 3600000) return `${Math.floor(diff / 60000)}${t('time.mAgo')}`;
    return `${Math.floor(diff / 3600000)}${t('time.hAgo')}`;
  };

  return (
    <footer className="border-t border-border bg-card hidden md:flex flex-col shrink-0">
      {!isOnline && (
        <div className="h-5 bg-warning/20 flex items-center justify-center gap-1 text-[9px] text-warning font-bold uppercase tracking-wider">
          <WifiOff className="h-2.5 w-2.5" /> {t('status.offlineBanner')}
        </div>
      )}
      <div className="h-6 flex items-center justify-between px-3 text-[9px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-success' : 'bg-warning'}`} />
            {isLive ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
            {isLive ? t('status.live') : t('status.cached')}
          </span>
          <span className="flex items-center gap-1">
            <Database className="h-2.5 w-2.5" />
            {isLive ? `${news.length} ${t('status.articles')}` : t('status.mockData')}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {t('status.updated')}: {formatTime(lastUpdated)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <MapPin className="h-2.5 w-2.5" />
            {t('status.focus')}
          </span>
          <span>v0.2.0</span>
        </div>
      </div>
    </footer>
  );
}
