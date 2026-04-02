import { GitMerge, Radar } from 'lucide-react';
import { useMemo } from 'react';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { buildCorrelationCards } from '@/lib/correlation/engine';

export function CorrelationPanel() {
  const { news } = useNewsFeedContext();
  const cards = useMemo(() => buildCorrelationCards(news), [news]);

  return (
    <section className="border border-border rounded-md bg-card h-full min-h-0 flex flex-col">
      <header className="flex items-center justify-between px-3 py-2 border-b border-border">
        <h3 className="text-[11px] uppercase tracking-wider font-bold text-primary flex items-center gap-1.5">
          <GitMerge className="h-3.5 w-3.5" />
          Correlation Engine
        </h3>
        <span className="text-[10px] text-muted-foreground">{cards.length} cards</span>
      </header>

      <div className="p-2 space-y-2 overflow-auto">
        {cards.length === 0 && (
          <p className="text-[11px] text-muted-foreground px-1 py-2">
            Waiting for cross-domain convergence.
          </p>
        )}

        {cards.map(card => (
          <article key={card.id} className="rounded border border-border p-2 bg-muted/20 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] leading-tight font-semibold text-foreground">{card.title}</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold shrink-0">
                {(card.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">{card.summary}</p>
            <div className="flex flex-wrap gap-1">
              {card.domains.map(domain => (
                <span key={domain} className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded border border-border">
                  {domain}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <footer className="mt-auto border-t border-border px-3 py-1.5 text-[10px] text-muted-foreground flex items-center gap-1.5">
        <Radar className="h-3 w-3" />
        Military, escalation, economic, and disaster adapters active.
      </footer>
    </section>
  );
}
