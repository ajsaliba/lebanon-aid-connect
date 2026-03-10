import { useState, useMemo } from 'react';
import { mockMissingPersons, type MissingPerson, type PersonStatus } from '@/data/extendedMockData';
import { useGeolocation, distanceKm } from '@/hooks/useGeolocation';
import {
  Users, Search, MapPin, Phone, Clock, CheckCircle2,
  AlertTriangle, HelpCircle, Shield
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation, t as translate } from '@/lib/i18n';

const statusConfig: Record<PersonStatus, { color: string; bgColor: string; icon: typeof CheckCircle2; key: string }> = {
  safe: { color: 'text-success', bgColor: 'bg-success/20', icon: CheckCircle2, key: 'family.safe' },
  injured: { color: 'text-warning', bgColor: 'bg-warning/20', icon: AlertTriangle, key: 'family.injured' },
  missing: { color: 'text-danger', bgColor: 'bg-danger/20', icon: HelpCircle, key: 'family.missing' },
  evacuated: { color: 'text-info', bgColor: 'bg-info/20', icon: Shield, key: 'family.evacuated' },
};

export function FamilyLocatorPanel() {
  const { t } = useTranslation();
  const { position } = useGeolocation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PersonStatus | 'all'>('all');

  const persons = useMemo(() => {
    let items = mockMissingPersons;
    if (statusFilter !== 'all') items = items.filter(p => p.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.last_known_location.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    if (position) {
      items = [...items].sort((a, b) =>
        distanceKm(position.lat, position.lng, a.last_known_lat, a.last_known_lng) -
        distanceKm(position.lat, position.lng, b.last_known_lat, b.last_known_lng)
      );
    }
    return items;
  }, [search, statusFilter, position]);

  const counts = useMemo(() => ({
    safe: mockMissingPersons.filter(p => p.status === 'safe').length,
    injured: mockMissingPersons.filter(p => p.status === 'injured').length,
    missing: mockMissingPersons.filter(p => p.status === 'missing').length,
    evacuated: mockMissingPersons.filter(p => p.status === 'evacuated').length,
  }), []);

  return (
    <div className="space-y-2 p-3">
      <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-primary flex items-center gap-2">
        <Users className="h-3 w-3" /> {t('family.title')}
      </h2>

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-1">
        {(Object.entries(counts) as [PersonStatus, number][]).map(([status, count]) => {
          const config = statusConfig[status];
          const StatusIcon = config.icon;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              className={cn(
                'rounded p-1.5 text-center border transition-colors',
                statusFilter === status ? `${config.bgColor} border-current ${config.color}` : 'border-border hover:bg-muted/50'
              )}
            >
              <StatusIcon className={cn('h-3 w-3 mx-auto mb-0.5', config.color)} />
              <div className="text-sm font-bold">{count}</div>
              <div className="text-[8px] text-muted-foreground">{t(config.key)}</div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder={t('family.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-7 h-7 text-xs"
        />
      </div>

      {/* Person List */}
      <div className="space-y-1.5">
        {persons.map(person => {
          const config = statusConfig[person.status];
          const StatusIcon = config.icon;
          const dist = position ? distanceKm(position.lat, position.lng, person.last_known_lat, person.last_known_lng).toFixed(1) : null;
          const timeAgo = getTimeAgo(person.updated_at);

          return (
            <div key={person.id} className={cn('border rounded p-2 space-y-1', person.status === 'missing' ? 'border-danger/30' : 'border-border')}>
              <div className="flex items-start gap-2">
                {/* Avatar placeholder */}
                <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0', config.bgColor, config.color)}>
                  {person.photo_placeholder}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-medium truncate">{person.name}</span>
                    <Badge variant="outline" className={cn('text-[8px] px-1 py-0 flex items-center gap-0.5 shrink-0', config.color)}>
                      <StatusIcon className="h-2 w-2" /> {t(config.key)}
                    </Badge>
                  </div>

                  <div className="text-[9px] text-muted-foreground">
                    {person.age} {t('family.yrs')}, {person.gender}
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground leading-tight">{person.description}</p>

              <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                <MapPin className="h-2.5 w-2.5" />
                <span>{t('family.lastSeen')} {person.last_known_location}</span>
                {dist && <span className="text-primary">({dist} km)</span>}
              </div>

              <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" /> {timeAgo}
                </span>
                <a href={`tel:${person.contact}`} className="flex items-center gap-0.5 text-info hover:underline">
                  <Phone className="h-2.5 w-2.5" /> {t('common.contact')}
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Status Section */}
      <div className="border border-primary/30 rounded p-2 bg-primary/5">
        <div className="text-[9px] font-bold text-primary uppercase tracking-wider mb-1">{t('family.reportSectionTitle')}</div>
        <p className="text-[9px] text-muted-foreground mb-1.5">{t('family.reportSectionDesc')}</p>
        <div className="grid grid-cols-2 gap-1">
          {(['safe', 'injured', 'evacuated', 'missing'] as PersonStatus[]).map(status => {
            const config = statusConfig[status];
            const StatusIcon = config.icon;
            return (
              <button
                key={status}
                className={cn(
                  'flex items-center justify-center gap-1 py-1.5 rounded border text-[9px] transition-colors',
                  config.bgColor, config.color, 'border-current/20 hover:opacity-80'
                )}
              >
                <StatusIcon className="h-2.5 w-2.5" /> {t(`family.im${status.charAt(0).toUpperCase() + status.slice(1)}`)}
              </button>
            );
          })}
        </div>
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
