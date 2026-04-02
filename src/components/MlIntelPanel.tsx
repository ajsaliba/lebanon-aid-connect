import { Bot, BrainCircuit, Network, Sparkles, ActivitySquare, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useMemo } from 'react';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { useMlIntel } from '@/hooks/useMlIntel';

export function MlIntelPanel() {
  const { news } = useNewsFeedContext();
  const ml = useMlIntel(news);

  const sentimentConfig = useMemo(() => {
    if (ml.sentimentLabel === 'positive') return { icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    if (ml.sentimentLabel === 'negative') return { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' };
    return { icon: ActivitySquare, color: 'text-warning', bg: 'bg-warning/10' };
  }, [ml.sentimentLabel]);

  const SentimentIcon = sentimentConfig.icon;

  return (
    <section className="border border-border/60 rounded-xl bg-card shadow-sm h-full min-h-0 flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="bg-primary/20 p-1.5 rounded-md">
              <BrainCircuit className="h-4 w-4 text-primary" />
            </div>
            {ml.loading && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
            )}
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wider font-bold text-foreground leading-none">
              Intelligence AI
            </h3>
            <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
              {ml.loading ? 'Processing neural net...' : ml.workerAvailable ? 'Local WebWorker Active' : 'Worker unavailable'}
            </span>
          </div>
        </div>
        
        {!ml.loading && ml.workerAvailable && (
          <div className="bg-primary/10 border border-primary/20 px-2 py-1 rounded-full flex items-center gap-1.5 shadow-inner">
            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
            <span className="text-[10px] font-bold text-primary">Live</span>
          </div>
        )}
      </header>

      <div className="p-3 space-y-3 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        
        {/* Sentiment Overview */}
        <div className={`rounded-lg border border-border/50 p-3 shadow-sm ${sentimentConfig.bg}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <SentimentIcon className={`h-3.5 w-3.5 ${sentimentConfig.color}`} />
              Context Sentiment
            </div>
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sentimentConfig.color} bg-background/50 border border-border/50 shadow-sm`}>
              {ml.sentimentLabel} ({(ml.sentimentScore).toFixed(2)})
            </div>
          </div>
          <div className="w-full bg-background/60 rounded-full h-1.5 border border-border/30 overflow-hidden">
            <div 
              className={`h-1.5 rounded-full ${sentimentConfig.color.replace('text-', 'bg-')}`} 
              style={{ width: `${Math.max(5, Math.min(100, ((ml.sentimentScore + 1) / 2) * 100))}%` }} 
            />
          </div>
        </div>

        <div className="rounded-lg border border-border/50 bg-background/50 p-3 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
            <span>Risk Profile</span>
            <span className="text-[10px] font-mono text-primary">{(ml.riskScore * 100).toFixed(0)}%</span>
          </div>
          {ml.riskChannels.length === 0 ? (
            <p className="text-[10px] text-muted-foreground">No dominant risk channels detected.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {ml.riskChannels.map(channel => (
                <span key={channel} className="text-[9px] uppercase tracking-wide px-2 py-0.5 rounded border border-border bg-muted/40">
                  {channel}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* AI Summary Block */}
        <div className="rounded-lg border border-border/50 bg-background/50 p-3 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Bot className="h-3 w-3 text-primary" />
            Synthesized Overview
          </div>
          {ml.loading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-2 bg-muted rounded w-3/4"></div>
              <div className="h-2 bg-muted rounded w-full"></div>
              <div className="h-2 bg-muted rounded w-5/6"></div>
            </div>
          ) : (
            <p className="text-[11px] leading-relaxed text-foreground/90 pb-1">
              {ml.summary}
            </p>
          )}
        </div>

        {/* Semantic Vector Matches */}
        <div className="rounded-lg border border-border/50 bg-background/50 p-3 shadow-sm flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Network className="h-3 w-3 text-primary" />
              Pattern Matches
            </span>
            <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-[9px] font-mono border border-border/50">
              k-NN Vectors
            </span>
          </div>

          <div className="space-y-1.5 mt-2">
            {ml.semanticMatches.length === 0 ? (
               <div className="text-[10px] text-muted-foreground text-center py-2 h-full italic">
                 Awaiting sufficient data...
               </div>
            ) : (
              ml.semanticMatches.map(match => (
                <div key={match.id} className="group flex items-center justify-between p-1.5 rounded-md hover:bg-muted/40 transition-colors border border-transparent hover:border-border/50 cursor-default">
                  <span className="truncate text-[10px] font-medium text-foreground/80 group-hover:text-foreground">
                    {match.id}
                  </span>  
                  <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded ml-2 shrink-0">
                    {(match.score * 100).toFixed(1)}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
