import { useState, useMemo } from 'react';
import { CASCADE_NODES, CASCADE_LINKS, CASCADE_TYPE_CONFIG, simulateCascade, type CascadeNodeType, type CascadeImpact } from '@/config/cascadeGraph';
import { cn } from '@/lib/utils';
import { Network, Zap, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from '@/lib/i18n';

export function InfrastructureCascadePanel() {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<CascadeNodeType>('cable');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');
  const [impact, setImpact] = useState<CascadeImpact | null>(null);

  const nodesOfType = useMemo(() =>
    CASCADE_NODES.filter(n => n.type === selectedType).sort((a, b) => a.name.localeCompare(b.name)),
    [selectedType]
  );

  const stats = useMemo(() => {
    const byType: Record<CascadeNodeType, number> = { cable: 0, pipeline: 0, port: 0, chokepoint: 0 };
    for (const n of CASCADE_NODES) byType[n.type]++;
    return { ...byType, links: CASCADE_LINKS.length, total: CASCADE_NODES.length };
  }, []);

  const handleAnalyze = () => {
    if (!selectedNodeId) return;
    setImpact(simulateCascade(selectedNodeId));
  };

  return (
    <div className="rounded-lg border border-border bg-card/50 p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider">{t('cascade.title')}</h3>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-[9px] text-muted-foreground cursor-help">?</span>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-[10px] max-w-[220px]">
            <p className="font-bold mb-1">{t('cascade.analysisTitle')}</p>
            <p>{t('cascade.analysisDesc')}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Stats bar */}
      <div className="text-[9px] font-mono text-muted-foreground">{stats.total} {t('cascade.nodes')}</div>
      <div className="flex flex-wrap gap-1.5 text-[9px]">
        {(Object.entries(CASCADE_TYPE_CONFIG) as Array<[CascadeNodeType, typeof CASCADE_TYPE_CONFIG[CascadeNodeType]]>).map(([type, cfg]) => (
          <button
            key={type}
            onClick={() => { setSelectedType(type as CascadeNodeType); setSelectedNodeId(''); setImpact(null); }}
            className={cn(
              'px-1.5 py-0.5 rounded transition-colors',
              selectedType === type ? 'bg-primary/20 text-primary font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {cfg.icon} {stats[type as CascadeNodeType]}
          </button>
        ))}
        <span className="text-muted-foreground">📊 {stats.links} {t('cascade.links')}</span>
      </div>

      {/* Type tabs */}
      <div className="flex gap-1">
        {(Object.entries(CASCADE_TYPE_CONFIG) as Array<[CascadeNodeType, typeof CASCADE_TYPE_CONFIG[CascadeNodeType]]>).map(([type, cfg]) => (
          <button
            key={type}
            onClick={() => { setSelectedType(type as CascadeNodeType); setSelectedNodeId(''); setImpact(null); }}
            className={cn(
              'flex-1 text-[9px] py-1 rounded transition-colors',
              selectedType === type ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-muted'
            )}
          >
            {cfg.icon} {cfg.label}
          </button>
        ))}
      </div>

      {/* Node selector */}
      <Select value={selectedNodeId} onValueChange={setSelectedNodeId}>
        <SelectTrigger className="h-7 text-[10px]">
          <SelectValue placeholder={t('cascade.selectPlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          {nodesOfType.map(n => (
            <SelectItem key={n.id} value={n.id} className="text-[10px]">{n.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={handleAnalyze} size="sm" className="w-full h-7 text-[10px]" disabled={!selectedNodeId}>
        {t('cascade.analyzeImpact')}
      </Button>

      {/* Impact results */}
      {impact ? (
        <div className="space-y-2 rounded bg-muted/30 p-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
            <span className="text-xs font-bold">{impact.node.name} {t('cascade.failure')}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <div className="text-muted-foreground">{t('cascade.affectedCountries')}</div>
              <div className="font-bold text-foreground">{impact.affectedCountries.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">{t('cascade.capacityLoss')}</div>
              <div className={cn('font-bold', impact.capacityLoss > 50 ? 'text-danger' : 'text-warning')}>{impact.capacityLoss}%</div>
            </div>
            <div>
              <div className="text-muted-foreground">{t('cascade.cascadeDepth')}</div>
              <div className="font-bold text-foreground">{impact.cascadeDepth}</div>
            </div>
            <div>
              <div className="text-muted-foreground">{t('cascade.redundantRoutes')}</div>
              <div className="font-bold text-success">{impact.redundantRoutes}</div>
            </div>
          </div>
          {impact.affectedNodes.length > 0 && (
            <div className="text-[9px] text-muted-foreground">
              <span className="font-bold">{t('cascade.affected')}:</span>{' '}
              {impact.affectedNodes.map(n => n.name).join(', ')}
            </div>
          )}
          <div className="text-[9px] text-muted-foreground">
            <span className="font-bold">{t('cascade.countries')}:</span>{' '}
            {impact.affectedCountries.join(', ')}
          </div>
        </div>
      ) : (
        <div className="text-[10px] text-muted-foreground text-center py-2">
          {t('cascade.selectInfra')}
        </div>
      )}
    </div>
  );
}
