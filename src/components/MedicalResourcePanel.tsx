import { useState, useMemo } from 'react';
import { useBridgedMedicalFacilities } from '@/services/mockBridge';
import { type MedicalFacility, type FacilityType, type FacilityStatus } from '@/data/extendedMockData';
import { useGeolocation, distanceKm, getDirectionsUrl } from '@/hooks/useGeolocation';
import {
  Stethoscope, Building2, Pill, Droplets, Ambulance, Phone,
  Navigation, Search, AlertTriangle, CheckCircle2, XCircle, Activity
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const typeIcons: Record<FacilityType, typeof Building2> = {
  hospital: Building2,
  clinic: Stethoscope,
  pharmacy: Pill,
  blood_bank: Droplets,
  ambulance_station: Ambulance,
  mobile_unit: Activity,
};

const typeKeys: Record<FacilityType, string> = {
  hospital: 'medical.hospitals', clinic: 'medical.clinics', pharmacy: 'medical.pharmacies',
  blood_bank: 'medical.bloodBanks', ambulance_station: 'medical.ambulances', mobile_unit: 'medical.mobileUnits',
};

const statusColors: Record<FacilityStatus, string> = {
  open: 'bg-success/20 text-success border-success/30',
  overwhelmed: 'bg-warning/20 text-warning border-warning/30',
  damaged: 'bg-danger/20 text-danger border-danger/30',
  closed: 'bg-muted text-muted-foreground border-border',
};

const statusDots: Record<FacilityStatus, string> = {
  open: 'bg-success',
  overwhelmed: 'bg-warning',
  damaged: 'bg-danger',
  closed: 'bg-muted-foreground',
};

export function MedicalResourcePanel() {
  const { data: mockMedicalFacilities = [], isLoading } = useBridgedMedicalFacilities();
  const { position } = useGeolocation();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FacilityType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<FacilityStatus | 'all'>('all');
  const { t } = useTranslation();

  const facilities = useMemo(() => {
    let items = mockMedicalFacilities;
    if (typeFilter !== 'all') items = items.filter(f => f.type === typeFilter);
    if (statusFilter !== 'all') items = items.filter(f => f.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(f => f.name.toLowerCase().includes(q) || f.city.toLowerCase().includes(q));
    }
    if (position) {
      items = [...items].sort((a, b) => distanceKm(position.lat, position.lng, a.lat, a.lng) - distanceKm(position.lat, position.lng, b.lat, b.lng));
    }
    return items;
  }, [mockMedicalFacilities, search, typeFilter, statusFilter, position]);

  const statusCounts = useMemo(() => ({
    open: mockMedicalFacilities.filter(f => f.status === 'open').length,
    overwhelmed: mockMedicalFacilities.filter(f => f.status === 'overwhelmed').length,
    damaged: mockMedicalFacilities.filter(f => f.status === 'damaged').length,
    closed: mockMedicalFacilities.filter(f => f.status === 'closed').length,
  }), [mockMedicalFacilities]);

  if (isLoading) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-2 p-3">
      <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-primary flex items-center gap-2">
        <Stethoscope className="h-3 w-3" /> {t('medical.title')}
      </h2>

      {/* Status Overview */}
      <div className="grid grid-cols-4 gap-1">
        {(Object.entries(statusCounts) as [FacilityStatus, number][]).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
            className={cn(
              'rounded p-1 text-center transition-colors border',
              statusFilter === status ? statusColors[status] : 'border-transparent hover:bg-muted/50'
            )}
          >
            <div className={cn('h-1.5 w-1.5 rounded-full mx-auto mb-0.5', statusDots[status])} />
            <div className="text-xs font-bold">{count}</div>
            <div className="text-[8px] text-muted-foreground capitalize">{t(`medical.${status === 'open' ? 'open' : status === 'overwhelmed' ? 'overwhelmed' : status === 'damaged' ? 'damaged' : 'closed'}`)}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder={t('medical.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-7 h-7 text-xs"
        />
      </div>

      {/* Type Filter */}
      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => setTypeFilter('all')}
          className={cn(
            'px-1.5 py-0.5 text-[9px] rounded border transition-colors',
            typeFilter === 'all' ? 'bg-primary/20 text-primary border-primary/30' : 'text-muted-foreground border-border hover:bg-muted/50'
          )}
        >
          {t('common.all')}
        </button>
        {(Object.entries(typeKeys) as [FacilityType, string][]).map(([type, key]) => {
          const Icon = typeIcons[type];
          return (
            <button
              key={type}
              onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}
              className={cn(
                'px-1.5 py-0.5 text-[9px] rounded border transition-colors flex items-center gap-0.5',
                typeFilter === type ? 'bg-primary/20 text-primary border-primary/30' : 'text-muted-foreground border-border hover:bg-muted/50'
              )}
            >
              <Icon className="h-2.5 w-2.5" /> {t(key)}
            </button>
          );
        })}
      </div>

      {/* Facility List */}
      <div className="space-y-1.5">
        {facilities.map(f => {
          const Icon = typeIcons[f.type];
          const dist = position ? distanceKm(position.lat, position.lng, f.lat, f.lng).toFixed(1) : null;
          const loadPct = f.capacity && f.current_load ? Math.round((f.current_load / f.capacity) * 100) : null;

          return (
            <div key={f.id} className="border border-border rounded p-2 space-y-1">
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Icon className="h-3 w-3 shrink-0 text-primary" />
                  <span className="text-xs font-medium truncate">{f.name}</span>
                </div>
                <Badge variant="outline" className={cn('text-[8px] px-1 py-0 shrink-0', statusColors[f.status])}>
                  <span className={cn('h-1.5 w-1.5 rounded-full inline-block mr-0.5', statusDots[f.status])} />
                  {f.status}
                </Badge>
              </div>

              <div className="text-[9px] text-muted-foreground">{f.city}</div>

              {loadPct !== null && (
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[9px]">
                    <span className="text-muted-foreground">{t('medical.capacity')}</span>
                    <span className={cn(loadPct > 90 ? 'text-danger' : loadPct > 70 ? 'text-warning' : 'text-success')}>
                      {f.current_load}/{f.capacity} ({loadPct}%)
                    </span>
                  </div>
                  <Progress value={loadPct} className="h-1" />
                </div>
              )}

              <div className="flex items-center gap-2 text-[9px]">
                {f.medicine_shortage && (
                  <span className="flex items-center gap-0.5 text-danger">
                    <AlertTriangle className="h-2.5 w-2.5" /> {t('medical.medicineShortage')}
                  </span>
                )}
                {f.blood_available ? (
                  <span className="flex items-center gap-0.5 text-success">
                    <Droplets className="h-2.5 w-2.5" /> {t('medical.bloodAvail')}
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-danger">
                    <Droplets className="h-2.5 w-2.5" /> {t('medical.noBlood')}
                  </span>
                )}
              </div>

              {f.specialties && f.specialties.length > 0 && (
                <div className="flex gap-0.5 flex-wrap">
                  {f.specialties.map(s => (
                    <span key={s} className="text-[8px] px-1 py-0 bg-muted rounded">{s}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[9px] text-muted-foreground">
                  {dist && <span className="text-primary">{dist} km</span>}
                </span>
                <div className="flex gap-1">
                  <a href={`tel:${f.phone}`} className="text-[9px] text-info flex items-center gap-0.5 hover:underline">
                    <Phone className="h-2.5 w-2.5" /> {t('action.call')}
                  </a>
                  <a
                    href={getDirectionsUrl(f.lat, f.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] text-primary flex items-center gap-0.5 hover:underline"
                  >
                    <Navigation className="h-2.5 w-2.5" /> {t('action.navigate')}
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
