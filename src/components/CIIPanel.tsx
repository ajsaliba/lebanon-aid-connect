import { useMemo } from 'react';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { computeCII, CII_LEVEL_CONFIG, type CIIScore } from '@/config/countryInstability';
import { Shield, TrendingUp, Minus, TrendingDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function CIIPanel() {
  const { news } = useNewsFeedContext();
  const scores = useMemo(() => computeCII(news), [news]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Shield className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-sans font-bold uppercase tracking-wider text-primary">Country Instability Index</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-[9px] text-muted-foreground cursor-help ml-auto">?</span>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-[240px] text-[10px] space-y-1">
            <p className="font-bold">Methodology</p>
            <p>• <b>U</b>nrest: civil disorder & protests</p>
            <p>• <b>C</b>onflict: armed conflict intensity</p>
            <p>• <b>S</b>ecurity: military activity</p>
            <p>• <b>I</b>nformation: news velocity</p>
            <p className="text-muted-foreground italic">U:C:S:I values show component scores.</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="space-y-0.5">
        {scores.map(s => (
          <CIIRow key={s.country.id} score={s} />
        ))}
      </div>
    </div>
  );
}

function CIIRow({ score }: { score: CIIScore }) {
  const cfg = CII_LEVEL_CONFIG[score.level];
  const { components } = score;

  const trendIcon = score.trend === 'rising'
    ? <TrendingUp className="h-2.5 w-2.5 text-danger" />
    : score.trend === 'falling'
    ? <TrendingDown className="h-2.5 w-2.5 text-success" />
    : <Minus className="h-2.5 w-2.5 text-muted-foreground" />;

  const levelEmoji = score.level === 'critical' ? '🟠'
    : score.level === 'elevated' ? '🟡'
    : score.level === 'watch' ? '🟢'
    : '⚪';

  return (
    <div className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-muted/50 text-[11px]">
      <span className="text-[10px] shrink-0">{levelEmoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-foreground">{score.country.name}</span>
          <span className="font-bold text-[11px]" style={{ color: cfg.color }}>{score.score}</span>
          {trendIcon}
        </div>
        <div className="text-[9px] text-muted-foreground font-mono mt-0.5">
          U:{components.unrest} C:{components.conflict} S:{components.security} I:{components.information}
        </div>
      </div>
      <span className="text-[9px] text-muted-foreground shrink-0">{score.articleCount} articles</span>
    </div>
  );
}
