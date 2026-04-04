import { Activity, GitMerge, Radar, Zap } from 'lucide-react';
import { useMemo } from 'react';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { buildCorrelationCards } from '@/lib/correlation/engine';

export function CorrelationPanel() {
  const { news } = useNewsFeedContext();
  const cards = useMemo(() => buildCorrelationCards(news), [news]);

  return (
    <section className="border border-border/60 rounded-xl bg-card shadow-sm h-full min-h-0 flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-1.5 rounded-md">
            <GitMerge className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wider font-bold text-foreground leading-none">
              Correlation Engine
            </h3>
            <span className="text-[10px] text-muted-foreground font-medium">Multi-Domain Convergence</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-background border border-border px-2 py-1 rounded-full shadow-sm">
          <Zap className="h-3 w-3 text-amber-500 fill-amber-500/20" />
          <span className="text-[10px] font-bold text-foreground">{cards.length} Signals</span>
        </div>
      </header>

      <div className="p-3 space-y-3 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {cards.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Radar className="h-8 w-8 text-muted-foreground/30 mb-2 animate-pulse" />
            <p className="text-xs text-muted-foreground font-medium">
              Scanning for cross-domain convergence...
            </p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              Events will appear here when correlated across 2+ streams.
            </p>
          </div>
        )}

        {cards.map(card => (
          <article key={card.id} className="group relative rounded-lg border border-border/50 bg-background hover:bg-muted/30 hover:border-primary/30 transition-all duration-300 p-3 shadow-sm hover:shadow-md cursor-default">
            {/* Correlation Strength Indicator */}
            <div className="absolute -top-2.5 -right-2.5 shadow-sm">
              <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-background border border-border">
                <svg className="w-8 h-8 -rotate-90">
                  <circle cx="16" cy="16" r="14" fill="transparent" stroke="currentColor" strokeWidth="2" className="text-muted/50" />
                  <circle cx="16" cy="16" r="14" fill="transparent" stroke="currentColor" strokeWidth="2" strokeDasharray="87.96" strokeDashoffset={87.96 - (87.96 * card.confidence)} className={card.confidence > 0.8 ? 'text-destructive' : card.confidence > 0.6 ? 'text-warning' : 'text-primary'} strokeLinecap="round" />
                </svg>
                <span className="absolute text-[9px] font-bold">
                  {(card.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="pr-6">
              <h4 className="text-xs leading-snug font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors">
                {card.title}
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-2.5 line-clamp-2">
                {card.summary}
              </p> 
            </div>

            <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-border/40">
              {card.domains.map(domain => (
                <span key={domain} className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-border/80 bg-muted/50 text-foreground">
                  <Activity className="h-2.5 w-2.5 opacity-70" />
                  {domain}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <footer className="mt-auto bg-muted/10 border-t border-border/50 px-4 py-2 flex items-center gap-2">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </div>
        <p className="text-[10px] text-muted-foreground font-medium">
          Active Analyzers: Military, Escalation, Economics, Disaster Core
        </p>
      </footer>
    </section>
  );
}
