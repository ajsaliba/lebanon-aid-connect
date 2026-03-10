import { useState, useEffect, useRef } from 'react';
import { liveStreams } from '@/data/mockData';
import { Video, ChevronDown, ChevronUp, Radio, Camera, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIdleDetection } from '@/hooks/useIdleDetection';
import { useTranslation } from '@/lib/i18n';

type Category = 'news' | 'camera';

export function LiveStreams() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [activeStream, setActiveStream] = useState(liveStreams[0]);
  const [category, setCategory] = useState<Category>('news');
  const [manualPause, setManualPause] = useState(false);
  const { shouldPause } = useIdleDetection(5 * 60 * 1000);

  const filtered = liveStreams.filter(s => s.category === category);

  // Effective pause: manual or idle/tab-hidden
  const isPaused = manualPause || (shouldPause && expanded);

  return (
    <div className="border-t border-border">
      <button
        className="w-full flex items-center justify-between p-2 hover:bg-muted/50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Video className="h-3 w-3 text-danger" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">{t('live.title')}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse-danger" />
          {shouldPause && expanded && !manualPause && (
            <span className="text-[9px] text-muted-foreground">({t('live.autoPaused')})</span>
          )}
        </div>
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
      </button>

      {expanded && (
        <div className="p-2 space-y-2">
          {/* Category tabs + pause toggle */}
          <div className="flex gap-1 flex-wrap items-center">
            {([
              { key: 'news' as const, labelKey: 'live.news', icon: Radio },
              { key: 'camera' as const, labelKey: 'live.cameras', icon: Camera },
            ]).map(tab => (
              <Button
                key={tab.key}
                variant={category === tab.key ? 'default' : 'ghost'}
                size="sm"
                className="h-6 px-2 text-[10px] gap-1"
                onClick={() => { setCategory(tab.key); setActiveStream(liveStreams.find(s => s.category === tab.key) || liveStreams[0]); }}
              >
                <tab.icon className="h-3 w-3" /> {t(tab.labelKey)}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className={cn('h-6 px-2 text-[10px] gap-1 ml-auto', manualPause && 'text-warning')}
              onClick={() => setManualPause(!manualPause)}
            >
              <Pause className="h-3 w-3" /> {manualPause ? t('live.resume') : t('live.pause')}
            </Button>
          </div>

          {/* Stream buttons */}
          <div className="flex gap-1 flex-wrap">
            {filtered.map((stream) => (
              <Button
                key={stream.id}
                variant={activeStream.id === stream.id ? 'default' : 'ghost'}
                size="sm"
                className={cn('h-6 px-2 text-[10px]', activeStream.id === stream.id && 'ring-1 ring-primary')}
                onClick={() => setActiveStream(stream)}
              >
                {stream.channel}
                {!stream.live && <span className="ml-1 text-muted-foreground">({t('live.off')})</span>}
              </Button>
            ))}
          </div>

          {/* Video player */}
          {activeStream.live && !isPaused ? (
            <>
              <div className="aspect-[16/9] bg-muted rounded overflow-hidden w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${activeStream.embedId}?autoplay=1&mute=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={activeStream.name}
                />
              </div>
              <p className="text-[10px] text-muted-foreground truncate">{activeStream.name}</p>
            </>
          ) : (
            <div className="aspect-[16/9] bg-muted rounded overflow-hidden w-full flex flex-col items-center justify-center gap-1">
              {isPaused ? (
                <>
                  <Pause className="h-6 w-6 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground">
                    {manualPause ? t('live.manuallyPaused') : t('live.autoPausedIdle')}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{t('live.resumeHint')}</p>
                </>
              ) : (
                <>
                  <Video className="h-6 w-6 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground">{t('live.noStream')}</p>
                  <p className="text-[10px] text-muted-foreground">{activeStream.channel}</p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
