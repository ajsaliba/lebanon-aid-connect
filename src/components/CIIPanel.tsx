import { useMemo } from 'react';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { computeCII, CII_LEVEL_CONFIG, type CIIScore } from '@/config/countryInstability';
import { Shield } from 'lucide-react';

export function CIIPanel() {
  const { news } = useNewsFeedContext();
  const scores = useMemo(() => computeCII(news), [news]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Shield className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-sans font-bold uppercase tracking-wider text-primary">Country Instability Index</span>
      </div>

      <div className="space-y-1">
        {scores.map(s => (
          <CIIRow key={s.country.id} score={s} />
        ))}
      </div>
    </div>
  );
}

function CIIRow({ score }: { score: CIIScore }) {
  const cfg = CII_LEVEL_CONFIG[score.level];

  return (
    <div className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-muted/50 text-[11px]">
      <span className="w-5 text-center font-bold" style={{ color: cfg.color }}>{score.score}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-foreground">{score.country.name}</span>
          <span className="text-[9px] uppercase font-bold px-1 rounded" style={{ color: cfg.color, background: `${cfg.color}20` }}>
            {cfg.label}
          </span>
        </div>
        <div className="w-full h-1 bg-muted rounded-full mt-0.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${score.score}%`, background: cfg.color }}
          />
        </div>
      </div>
      <span className="text-[9px] text-muted-foreground shrink-0">{score.articleCount} articles</span>
    </div>
  );
}
