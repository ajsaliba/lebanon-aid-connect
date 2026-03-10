import { mockDIYTutorials } from '@/data/newFeaturesMockData';
import { Wrench, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const difficultyColors: Record<string, string> = {
  easy: 'bg-success/20 text-success',
  medium: 'bg-warning/20 text-warning',
  hard: 'bg-danger/20 text-danger',
};

export function DIYToolsPanel() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-warning flex items-center gap-1.5">
          <Wrench className="h-3 w-3" /> {t('diy.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('diy.subtitle')}</p>
      </div>

      <div className="p-2 space-y-1.5">
        {mockDIYTutorials.map(tut => (
          <div key={tut.id} className="border border-border rounded overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === tut.id ? null : tut.id)}
              className="w-full p-2 flex items-center justify-between hover:bg-muted/20 transition-colors text-left"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{tut.icon}</span>
                <span className="text-xs font-medium">{tut.title}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={cn('text-[7px] px-1 py-0.5 rounded font-bold uppercase', difficultyColors[tut.difficulty])}>{tut.difficulty}</span>
                <span className="text-[7px] text-muted-foreground flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" />{tut.time_minutes}min
                </span>
                {expanded === tut.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </div>
            </button>

            {expanded === tut.id && (
              <div className="p-2 border-t border-border bg-muted/10 space-y-2">
                <div>
                  <div className="text-[8px] font-bold uppercase text-muted-foreground mb-0.5">{t('diy.materials')}</div>
                  <ul className="text-[8px] text-muted-foreground space-y-0.5">
                    {tut.materials.map((m, i) => <li key={i} className="flex items-start gap-1">• {m}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="text-[8px] font-bold uppercase text-muted-foreground mb-0.5">{t('diy.steps')}</div>
                  <ol className="text-[8px] text-muted-foreground space-y-0.5">
                    {tut.steps.map((s, i) => <li key={i} className="flex items-start gap-1"><span className="font-bold text-primary">{i + 1}.</span> {s}</li>)}
                  </ol>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
