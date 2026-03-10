import { TrendingUp } from 'lucide-react';
import { type TrendingKeyword } from '@/hooks/useTrendingKeywords';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

export function TrendingPanel({ keywords }: { keywords: TrendingKeyword[] }) {
  const { t } = useTranslation();
  if (keywords.length === 0) return null;

  return (
    <div className="border border-border rounded-md bg-card">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <TrendingUp className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-sans font-bold uppercase tracking-wider text-primary">{t('trending.title')}</span>
      </div>
      <div className="p-2 flex flex-wrap gap-1.5">
        {keywords.map(kw => (
          <span
            key={kw.word}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border',
              kw.isNew
                ? 'bg-primary/10 text-primary border-primary/30'
                : kw.surgeRatio >= 5
                  ? 'bg-danger/10 text-danger border-danger/30'
                  : 'bg-warning/10 text-warning border-warning/30'
            )}
          >
            {kw.word}
            <span className="text-[8px] opacity-75">
              {kw.isNew ? t('trending.new') : `${Math.round(kw.surgeRatio)}×`}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
