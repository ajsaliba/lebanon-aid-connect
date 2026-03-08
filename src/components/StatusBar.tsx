import { Wifi, WifiOff, Database, Clock, MapPin } from 'lucide-react';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';

export function StatusBar() {
  const { isLive, lastUpdated, news } = useNewsFeedContext();

  const formatTime = (date: Date | null) => {
    if (!date) return 'never';
    const diff = Date.now() - date.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  return (
    <footer className="h-6 border-t border-border bg-card hidden md:flex items-center justify-between px-3 text-[9px] text-muted-foreground shrink-0">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-success' : 'bg-warning'}`} />
          {isLive ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
          {isLive ? 'Live' : 'Cached'}
        </span>
        <span className="flex items-center gap-1">
          <Database className="h-2.5 w-2.5" />
          {isLive ? `${news.length} articles` : 'Mock data'}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" />
          Updated: {formatTime(lastUpdated)}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <MapPin className="h-2.5 w-2.5" />
          Focus: Middle East
        </span>
        <span>v0.2.0</span>
      </div>
    </footer>
  );
}
