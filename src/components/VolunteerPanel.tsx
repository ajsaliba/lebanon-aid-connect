import { useState, useMemo } from 'react';
import { useBridgedVolunteers } from '@/services/mockBridge';
import type { Volunteer, VolunteerRole, VolunteerAvailability } from '@/data/extendedMockData';
import { useGeolocation, distanceKm } from '@/hooks/useGeolocation';
import {
  Users, Stethoscope, Truck, Wrench, Languages, Shield, Package,
  Search, Phone, MapPin, CheckCircle2, Clock, XCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const roleIcons: Record<VolunteerRole, typeof Users> = {
  doctor: Stethoscope, nurse: Stethoscope, driver: Truck, engineer: Wrench,
  translator: Languages, rescue: Shield, aid_distributor: Package,
};

const roleKeys: Record<VolunteerRole, string> = {
  doctor: 'volunteer.doctors', nurse: 'volunteer.nurses', driver: 'volunteer.drivers', engineer: 'volunteer.engineers',
  translator: 'volunteer.translators', rescue: 'volunteer.rescue', aid_distributor: 'volunteer.aidDistributors',
};

const availabilityConfig: Record<VolunteerAvailability, { color: string; icon: typeof CheckCircle2; key: string }> = {
  available: { color: 'text-success', icon: CheckCircle2, key: 'common.available' },
  on_mission: { color: 'text-warning', icon: Clock, key: 'volunteer.onMission' },
  unavailable: { color: 'text-muted-foreground', icon: XCircle, key: 'volunteer.unavailable' },
};

export function VolunteerPanel() {
  const { t } = useTranslation();
  const { data: mockVolunteers = [], isLoading } = useBridgedVolunteers();
  const { position } = useGeolocation();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<VolunteerRole | 'all'>('all');
  const [availFilter, setAvailFilter] = useState<VolunteerAvailability | 'all'>('all');

  const volunteers = useMemo(() => {
    let items = mockVolunteers;
    if (roleFilter !== 'all') items = items.filter(v => v.role === roleFilter);
    if (availFilter !== 'all') items = items.filter(v => v.availability === availFilter);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        v.skills.some(s => s.toLowerCase().includes(q))
      );
    }
    if (position) {
      items = [...items].sort((a, b) => distanceKm(position.lat, position.lng, a.lat, a.lng) - distanceKm(position.lat, position.lng, b.lat, b.lng));
    }
    return items;
  }, [mockVolunteers, search, roleFilter, availFilter, position]);

  const availableCounts = useMemo(() => ({
    total: mockVolunteers.length,
    available: mockVolunteers.filter(v => v.availability === 'available').length,
    on_mission: mockVolunteers.filter(v => v.availability === 'on_mission').length,
  }), [mockVolunteers]);

  if (isLoading) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-2 p-3">
      <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-primary flex items-center gap-2">
        <Users className="h-3 w-3" /> {t('volunteer.title')}
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="bg-muted/50 rounded p-1.5 text-center">
          <div className="text-sm font-bold">{availableCounts.total}</div>
          <div className="text-[9px] text-muted-foreground">{t('volunteer.total')}</div>
        </div>
        <div className="bg-success/10 rounded p-1.5 text-center">
          <div className="text-sm font-bold text-success">{availableCounts.available}</div>
          <div className="text-[9px] text-muted-foreground">{t('common.available')}</div>
        </div>
        <div className="bg-warning/10 rounded p-1.5 text-center">
          <div className="text-sm font-bold text-warning">{availableCounts.on_mission}</div>
          <div className="text-[9px] text-muted-foreground">{t('volunteer.onMission')}</div>
        </div>
      </div>

      {/* Availability Filter */}
      <div className="flex gap-1">
        {(['all', 'available', 'on_mission', 'unavailable'] as const).map(a => (
          <button
            key={a}
            onClick={() => setAvailFilter(a)}
            className={cn(
              'flex-1 py-0.5 text-[9px] rounded border transition-colors capitalize',
              availFilter === a
                ? a === 'all' ? 'bg-primary/20 text-primary border-primary/30'
                  : `${availabilityConfig[a as VolunteerAvailability].color} border-current bg-current/10`
                : 'text-muted-foreground border-border'
            )}
          >
            {a === 'all' ? t('common.all') : t(availabilityConfig[a as VolunteerAvailability].key)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder={t('volunteer.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-7 h-7 text-xs"
        />
      </div>

      {/* Role Filter */}
      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => setRoleFilter('all')}
          className={cn(
            'px-1.5 py-0.5 text-[9px] rounded border transition-colors',
            roleFilter === 'all' ? 'bg-primary/20 text-primary border-primary/30' : 'text-muted-foreground border-border'
          )}
        >
          {t('volunteer.allRoles')}
        </button>
        {(Object.entries(roleKeys) as [VolunteerRole, string][]).map(([role, key]) => {
          const Icon = roleIcons[role];
          return (
            <button
              key={role}
              onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}
              className={cn(
                'px-1.5 py-0.5 text-[9px] rounded border transition-colors flex items-center gap-0.5',
                roleFilter === role ? 'bg-primary/20 text-primary border-primary/30' : 'text-muted-foreground border-border'
              )}
            >
              <Icon className="h-2.5 w-2.5" /> {t(key)}
            </button>
          );
        })}
      </div>

      {/* Volunteer List */}
      <div className="space-y-1.5">
        {volunteers.map(v => {
          const RoleIcon = roleIcons[v.role];
          const avail = availabilityConfig[v.availability];
          const AvailIcon = avail.icon;
          const dist = position ? distanceKm(position.lat, position.lng, v.lat, v.lng).toFixed(1) : null;

          return (
            <div key={v.id} className="border border-border rounded p-2 space-y-1">
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <RoleIcon className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-medium">{v.name}</div>
                    <div className="text-[9px] text-muted-foreground capitalize">{t(roleKeys[v.role])}</div>
                  </div>
                </div>
                <Badge variant="outline" className={cn('text-[8px] px-1 py-0 flex items-center gap-0.5', avail.color)}>
                  <AvailIcon className="h-2 w-2" /> {t(avail.key)}
                </Badge>
              </div>

              <div className="flex gap-0.5 flex-wrap">
                {v.skills.map(s => (
                  <span key={s} className="text-[8px] px-1 py-0 bg-muted rounded">{s}</span>
                ))}
              </div>

              <div className="flex gap-0.5 flex-wrap">
                {v.languages.map(l => (
                  <span key={l} className="text-[8px] px-1 py-0 bg-info/10 text-info rounded">{l}</span>
                ))}
              </div>

              <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-2.5 w-2.5" /> {v.location}
                  {dist && <span className="text-primary">({dist} km)</span>}
                </span>
                <a href={`tel:${v.phone}`} className="flex items-center gap-0.5 text-info hover:underline">
                  <Phone className="h-2.5 w-2.5" /> {t('action.call')}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
