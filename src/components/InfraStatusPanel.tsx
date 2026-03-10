import { useState, useMemo } from 'react';
import { mockInfraReports, type InfraReport, type InfraType, type InfraStatus } from '@/data/extendedMockData';
import { useGeolocation, distanceKm } from '@/hooks/useGeolocation';
import {
  Zap, Wifi, Droplets, Fuel, Radio, Search,
  ThumbsUp, CheckCircle2, AlertTriangle, XCircle, Signal
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation, t as translate } from '@/lib/i18n';

const typeIcons: Record<InfraType, typeof Zap> = {
  electricity: Zap,
  generator: Zap,
  internet: Wifi,
  mobile_network: Signal,
  water_supply: Droplets,
  fuel_station: Fuel,
};

const typeKeys: Record<InfraType, string> = {
  electricity: 'infra.electricity', generator: 'infra.generators', internet: 'infra.internet',
  mobile_network: 'infra.mobile', water_supply: 'infra.water', fuel_station: 'infra.fuelStations',
};

const statusColors: Record<InfraStatus, string> = {
  operational: 'text-success',
  partial: 'text-warning',
  outage: 'text-danger',
  unknown: 'text-muted-foreground',
};

const statusIcons: Record<InfraStatus, typeof CheckCircle2> = {
  operational: CheckCircle2,
  partial: AlertTriangle,
  outage: XCircle,
  unknown: Radio,
};

export function InfraStatusPanel() {
  const { t } = useTranslation();
  const { position } = useGeolocation();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<InfraType | 'all'>('all');

  const reports = useMemo(() => {
    let items = mockInfraReports;
    if (typeFilter !== 'all') items = items.filter(r => r.type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(r => r.location.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    }
    if (position) {
      items = [...items].sort((a, b) => distanceKm(position.lat, position.lng, a.lat, a.lng) - distanceKm(position.lat, position.lng, b.lat, b.lng));
    }
    return items;
  }, [search, typeFilter, position]);

  // Summary by type
  const summary = useMemo(() => {
    const types: InfraType[] = ['electricity', 'internet', 'mobile_network', 'water_supply', 'fuel_station', 'generator'];
    return types.map(type => {
      const items = mockInfraReports.filter(r => r.type === type);
      const operational = items.filter(r => r.status === 'operational').length;
      const partial = items.filter(r => r.status === 'partial').length;
      const outage = items.filter(r => r.status === 'outage').length;
      return { type, total: items.length, operational, partial, outage };
    });
  }, []);

  return (
    <div className="p-3 space-y-3">
      <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-primary flex items-center gap-2">
        <Zap className="h-3 w-3" /> {t('infra.title')}
      </h2>

      {/* Overview Grid */}
      <div className="grid grid-cols-3 gap-1">
        {summary.map(s => {
          const Icon = typeIcons[s.type];
          const worstStatus: InfraStatus = s.outage > 0 ? 'outage' : s.partial > 0 ? 'partial' : 'operational';
          return (
            <button
              key={s.type}
              onClick={() => setTypeFilter(typeFilter === s.type ? 'all' : s.type)}
              className={cn(
                'rounded p-1.5 text-center border transition-colors',
                typeFilter === s.type ? 'border-primary/30 bg-primary/10' : 'border-border hover:bg-muted/50'
              )}
            >
              <Icon className={cn('h-3 w-3 mx-auto mb-0.5', statusColors[worstStatus])} />
              <div className="text-[8px] text-muted-foreground">{t(typeKeys[s.type])}</div>
              <div className="flex justify-center gap-0.5 mt-0.5">
                {s.operational > 0 && <span className="h-1 w-1 rounded-full bg-success" />}
                {s.partial > 0 && <span className="h-1 w-1 rounded-full bg-warning" />}
                {s.outage > 0 && <span className="h-1 w-1 rounded-full bg-danger" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder={t('infra.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-7 h-7 text-xs"
        />
      </div>

      {/* Reports */}
      <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
        {reports.map(report => {
          const Icon = typeIcons[report.type];
          const StatusIcon = statusIcons[report.status];
          const dist = position ? distanceKm(position.lat, position.lng, report.lat, report.lng).toFixed(1) : null;
          const timeAgo = getTimeAgo(report.reported_at);

          return (
            <div key={report.id} className="border border-border rounded p-2 space-y-1">
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <Icon className={cn('h-3 w-3', statusColors[report.status])} />
                  <span className="text-xs font-medium">{t(typeKeys[report.type])}</span>
                </div>
                <Badge variant="outline" className={cn('text-[8px] px-1 py-0 flex items-center gap-0.5', statusColors[report.status])}>
                  <StatusIcon className="h-2 w-2" />
                  {t(`infra.${report.status}`)}
                </Badge>
              </div>

              <div className="text-[9px] text-muted-foreground">{report.location}</div>
              <p className="text-[10px] text-muted-foreground leading-tight">{report.description}</p>

              <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  {dist && <span className="text-primary">{dist} km</span>}
                  <span>{timeAgo}</span>
                  {report.verified && <CheckCircle2 className="h-2.5 w-2.5 text-success" />}
                </div>
                <div className="flex items-center gap-0.5">
                  <ThumbsUp className="h-2.5 w-2.5" /> {report.upvotes}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return translate('time.justNow');
  if (hours < 24) return `${hours}${translate('time.hAgo')}`;
  return `${Math.floor(hours / 24)}${translate('time.dAgo')}`;
}
