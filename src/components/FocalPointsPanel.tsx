import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { useFocalPoints, FOCAL_LEVEL_CONFIG } from '@/hooks/useFocalPoints';
import { cn } from '@/lib/utils';
import { Crosshair } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function FocalPointsPanel() {
  const { t } = useTranslation();
  const { news } = useNewsFeedContext();
  const focalPoints = useFocalPoints(news);

  return (
    <div className="rounded-lg border border-border bg-card/50 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Crosshair className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-bold uppercase tracking-wider">🎯 {t('focal.title')}</h3>
      </div>

      {focalPoints.length === 0 ? (
        <div className="text-[10px] text-muted-foreground text-center py-3">{t('focal.noPoints')}</div>
      ) : (
        <div className="space-y-1.5">
          {focalPoints.map(fp => {
            const cfg = FOCAL_LEVEL_CONFIG[fp.level];
            return (
              <div key={fp.id} className="rounded bg-muted/30 p-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{fp.name}</span>
                  <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded', cfg.bg, cfg.color)}>
                    {cfg.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                  <span>{fp.newsCount} {t('focal.news')}</span>
                  <span>•</span>
                  <span>{fp.signalCount} {t('focal.signals')}</span>
                </div>
                {fp.topHeadline && (
                  <a
                    href={fp.topHeadline.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-primary hover:underline line-clamp-1 block"
                  >
                    "{fp.topHeadline.title}..."
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
