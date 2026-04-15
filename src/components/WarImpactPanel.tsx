import { useMemo } from 'react';
import { useBridgedImpactStats, useBridgedImpactTimeSeries } from '@/services/mockBridge';
import { BarChart3, TrendingUp, TrendingDown, Minus, Users, Building2, Heart, Truck, Zap, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTranslation } from '@/lib/i18n';

const statIcons: Record<string, typeof Users> = {
  'Displaced Persons': Users,
  'Buildings Damaged': Building2,
  'Casualty Estimates': Heart,
  'Aid Deliveries': Truck,
  'Electricity Coverage': Zap,
  'Active Shelters': Home,
};

const statLabelKeys: Record<string, string> = {
  'Displaced Persons': 'impact.displacedPersons',
  'Buildings Damaged': 'impact.buildingsDamaged',
  'Casualty Estimates': 'impact.casualtyEstimates',
  'Aid Deliveries': 'impact.aidDeliveries',
  'Electricity Coverage': 'impact.electricityCoverage',
  'Active Shelters': 'impact.activeShelters',
};

const trendIcons = { up: TrendingUp, down: TrendingDown, stable: Minus };

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

export function WarImpactPanel() {
  const { t } = useTranslation();
  const { data: mockImpactStats = [], isLoading: isLoadingStats } = useBridgedImpactStats();
  const { data: mockImpactTimeSeries = [], isLoading: isLoadingTimeSeries } = useBridgedImpactTimeSeries();

  const chartData = useMemo(() =>
    mockImpactTimeSeries.map(d => ({
      date: d.date.slice(5), // MM-DD
      displaced: d.displaced / 1000,
      damage: d.infrastructure_damage,
      casualties: d.casualties,
      aid: d.aid_delivered,
    })),
  [mockImpactTimeSeries]);

  if (isLoadingStats || isLoadingTimeSeries) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <BarChart3 className="h-3 w-3" /> {t('impact.title')}
        </h3>
      </div>

      <div className="p-2 space-y-2">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-1">
          {mockImpactStats.map(stat => {
            const Icon = statIcons[stat.label] || BarChart3;
            const TrendIcon = trendIcons[stat.trend];
            const trendColor = stat.trend === 'up'
              ? (stat.label.includes('Aid') || stat.label.includes('Shelter') ? 'text-success' : 'text-danger')
              : stat.trend === 'down'
                ? (stat.label.includes('Electric') ? 'text-danger' : 'text-success')
                : 'text-muted-foreground';

            return (
              <div key={stat.label} className="bg-muted/30 rounded p-1.5 text-center">
                <Icon className="h-3 w-3 mx-auto text-primary mb-0.5" />
                <div className="text-xs font-bold">{formatNumber(stat.value)}{stat.unit === '%' ? '%' : ''}</div>
                <div className="text-[7px] text-muted-foreground leading-tight">{t(statLabelKeys[stat.label] || stat.label)}</div>
                <div className={cn('text-[8px] flex items-center justify-center gap-0.5 mt-0.5', trendColor)}>
                  <TrendIcon className="h-2 w-2" />
                  {Math.abs(stat.change)}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Chart */}
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  fontSize: '10px',
                  borderRadius: '4px',
                }}
              />
              <Area type="monotone" dataKey="displaced" name={t('impact.displaced')} stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={1.5} />
              <Area type="monotone" dataKey="damage" name={t('impact.damage')} stroke="hsl(var(--danger))" fill="hsl(var(--danger))" fillOpacity={0.1} strokeWidth={1} />
              <Area type="monotone" dataKey="aid" name={t('impact.aidDeliveries')} stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.1} strokeWidth={1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-3 text-[8px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-1.5 w-3 bg-primary rounded-full" /> {t('impact.legendDisplaced')}</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-3 bg-danger rounded-full" /> {t('impact.legendDamage')}</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-3 bg-success rounded-full" /> {t('impact.legendAid')}</span>
        </div>
      </div>
    </div>
  );
}
