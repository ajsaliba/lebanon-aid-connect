import { useState, useMemo } from 'react';
import { mockSafeRoutes, mockHazardPoints, type SafeRoute, type RouteHazard } from '@/data/extendedMockData';
import { useGeolocation, distanceKm } from '@/hooks/useGeolocation';
import {
  Route, Shield, AlertTriangle, Navigation, Footprints, Flag,
  Fuel, Flame, Ban, Search, ChevronDown, ChevronUp, MapPin
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const hazardIcons: Record<RouteHazard, typeof AlertTriangle> = {
  road_damage: AlertTriangle,
  military_activity: Shield,
  checkpoint: Flag,
  fire: Flame,
  blocked: Ban,
  fuel_station: Fuel,
};

const hazardColors: Record<RouteHazard, string> = {
  road_damage: 'text-warning',
  military_activity: 'text-danger',
  checkpoint: 'text-info',
  fire: 'text-danger',
  blocked: 'text-danger',
  fuel_station: 'text-success',
};

const typeConfig: Record<string, { key: string; icon: typeof Route; color: string }> = {
  safest: { key: 'routes.safest', icon: Shield, color: 'text-success' },
  evacuation: { key: 'routes.evacuation', icon: Navigation, color: 'text-warning' },
  walking: { key: 'routes.walking', icon: Footprints, color: 'text-info' },
};

function safetyColor(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-danger';
}

export function SafeRoutePanel() {
  const { t } = useTranslation();
  const { position } = useGeolocation();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

  const routes = useMemo(() => {
    let items = mockSafeRoutes;
    if (typeFilter !== 'all') items = items.filter(r => r.type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.from.label?.toLowerCase().includes(q) ||
        r.to.label?.toLowerCase().includes(q)
      );
    }
    if (position) {
      items = [...items].sort((a, b) =>
        distanceKm(position.lat, position.lng, a.from.lat, a.from.lng) -
        distanceKm(position.lat, position.lng, b.from.lat, b.from.lng)
      );
    }
    return items;
  }, [search, typeFilter, position]);

  return (
    <div className="p-3 space-y-3">
      <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-primary flex items-center gap-2">
        <Route className="h-3 w-3" /> {t('routes.title')}
      </h2>

      {/* Hazard Summary */}
      <div className="bg-danger/5 border border-danger/20 rounded p-2">
        <div className="text-[9px] font-bold text-danger uppercase tracking-wider mb-1">{t('routes.activeHazards')}</div>
        <div className="grid grid-cols-3 gap-1">
          {(['road_damage', 'military_activity', 'fire', 'checkpoint', 'blocked', 'fuel_station'] as RouteHazard[]).map(type => {
            const Icon = hazardIcons[type];
            const count = mockHazardPoints.filter(h => h.type === type).length;
            return (
              <div key={type} className="flex items-center gap-0.5 text-[9px]">
                <Icon className={cn('h-2.5 w-2.5', hazardColors[type])} />
                <span className="text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder={t('routes.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-7 h-7 text-xs"
        />
      </div>

      {/* Type Filter */}
      <div className="flex gap-1">
        <button
          onClick={() => setTypeFilter('all')}
          className={cn(
            'px-2 py-0.5 text-[9px] rounded border transition-colors',
            typeFilter === 'all' ? 'bg-primary/20 text-primary border-primary/30' : 'text-muted-foreground border-border'
          )}
        >
          {t('common.all')}
        </button>
        {Object.entries(typeConfig).map(([type, { key, icon: Icon, color }]) => (
          <button
            key={type}
            onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}
            className={cn(
              'px-2 py-0.5 text-[9px] rounded border transition-colors flex items-center gap-0.5',
              typeFilter === type ? 'bg-primary/20 text-primary border-primary/30' : 'text-muted-foreground border-border'
            )}
          >
            <Icon className={cn('h-2.5 w-2.5', color)} /> {t(key)}
          </button>
        ))}
      </div>

      {/* Route List */}
      <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
        {routes.map(route => {
          const { key: typeKey, icon: TypeIcon, color } = typeConfig[route.type] || typeConfig.safest;
          const isExpanded = expandedRoute === route.id;
          const dist = position ? distanceKm(position.lat, position.lng, route.from.lat, route.from.lng).toFixed(1) : null;

          return (
            <div key={route.id} className="border border-border rounded overflow-hidden">
              <button
                onClick={() => setExpandedRoute(isExpanded ? null : route.id)}
                className="w-full p-2 flex items-start justify-between gap-1 text-left hover:bg-muted/30"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1">
                    <TypeIcon className={cn('h-3 w-3 shrink-0', color)} />
                    <span className="text-xs font-medium truncate">{route.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                    <span>{route.distance_km} km</span>
                    <span>{route.estimated_time_min} min</span>
                    <span className={safetyColor(route.safety_score)}>
                      {t('routes.safety')}: {route.safety_score}%
                    </span>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0" />}
              </button>

              {isExpanded && (
                <div className="px-2 pb-2 space-y-1.5 border-t border-border pt-1.5">
                  <div className="flex items-center gap-1 text-[9px]">
                    <MapPin className="h-2.5 w-2.5 text-success" />
                    <span className="text-muted-foreground">{t('routes.from')}</span>
                    <span>{route.from.label}</span>
                    {dist && <span className="text-primary">({dist} km {t('routes.fromYou')})</span>}
                  </div>
                  <div className="flex items-center gap-1 text-[9px]">
                    <MapPin className="h-2.5 w-2.5 text-danger" />
                    <span className="text-muted-foreground">{t('routes.to')}</span>
                    <span>{route.to.label}</span>
                  </div>

                  {route.waypoints.length > 0 && (
                    <div className="text-[9px]">
                      <span className="text-muted-foreground">{t('routes.via')}: </span>
                      {route.waypoints.map(w => w.label).join(' → ')}
                    </div>
                  )}

                  {route.hazards.length > 0 && (
                    <div className="space-y-0.5">
                      <div className="text-[9px] font-medium text-danger">{t('routes.hazards')}:</div>
                      {route.hazards.map((h, i) => {
                        const HIcon = hazardIcons[h.type];
                        return (
                          <div key={i} className="flex items-center gap-1 text-[9px]">
                            <HIcon className={cn('h-2.5 w-2.5', hazardColors[h.type])} />
                            <span className="text-muted-foreground">{h.description}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <a
                    href={`https://www.google.com/maps/dir/${route.from.lat},${route.from.lng}/${route.waypoints.map(w => `${w.lat},${w.lng}`).join('/')}${route.waypoints.length > 0 ? '/' : ''}${route.to.lat},${route.to.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[9px] text-primary hover:underline"
                  >
                    <Navigation className="h-2.5 w-2.5" /> {t('routes.openMaps')}
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
