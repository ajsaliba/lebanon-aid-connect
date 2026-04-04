import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMissingPersons, useUpdateMissingPersonStatus, type PersonStatus, type MissingPerson } from '@/hooks/useDataHooks';
import { useGeolocation, distanceKm } from '@/hooks/useGeolocation';
import {
  Users, Search, MapPin, Phone, Clock, CheckCircle2,
  AlertTriangle, HelpCircle, Shield, ChevronDown, ChevronUp, Plus, Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation, t as translate } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';

const statusConfig: Record<PersonStatus, { color: string; bgColor: string; icon: typeof CheckCircle2; key: string }> = {
  safe: { color: 'text-success', bgColor: 'bg-success/20', icon: CheckCircle2, key: 'family.safe' },
  injured: { color: 'text-warning', bgColor: 'bg-warning/20', icon: AlertTriangle, key: 'family.injured' },
  missing: { color: 'text-danger', bgColor: 'bg-danger/20', icon: HelpCircle, key: 'family.missing' },
  evacuated: { color: 'text-info', bgColor: 'bg-info/20', icon: Shield, key: 'family.evacuated' },
  deceased: { color: 'text-muted-foreground', bgColor: 'bg-muted', icon: HelpCircle, key: 'family.deceased' },
};

// ── Debounce ──────────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Status Update Form (expands below card) ────────────────────────────────────
function StatusUpdateForm({ person, onClose }: { person: MissingPerson; onClose: () => void }) {
  const { toast } = useToast();
  const updateStatus = useUpdateMissingPersonStatus();
  const [status, setStatus] = useState<PersonStatus>(person.status);
  const [notes, setNotes] = useState(person.notes ?? '');
  const MAX_NOTES = 300;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStatus.mutateAsync({ id: person.id, status, notes: notes || undefined });
      toast({ title: 'Status updated', description: `${person.name} marked as ${status}` });
      onClose();
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  return (
    <motion.form
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.15 }}
      onSubmit={handleSubmit}
      className="overflow-hidden"
    >
      <div className="pt-2 pb-1 space-y-2 border-t border-border mt-1">
        <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Update Status</p>
        <div className="flex flex-wrap gap-1">
          {(Object.keys(statusConfig) as PersonStatus[]).map(s => {
            const cfg = statusConfig[s];
            const Icon = cfg.icon;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  'flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[8px] transition-colors capitalize',
                  status === s
                    ? `${cfg.bgColor} ${cfg.color} border-current`
                    : 'border-border text-muted-foreground hover:border-muted-foreground'
                )}
              >
                <Icon className="h-2 w-2" /> {s}
              </button>
            );
          })}
        </div>
        <div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value.slice(0, MAX_NOTES))}
            placeholder="Additional notes..."
            className="w-full bg-muted border border-border rounded px-2 py-1 text-[10px] min-h-[48px] resize-none focus:outline-none focus:border-primary/50"
          />
          <p className="text-[8px] text-muted-foreground text-right">{notes.length}/{MAX_NOTES}</p>
        </div>
        <div className="flex gap-1">
          <Button type="button" variant="outline" size="sm" className="flex-1 h-6 text-[9px]" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" className="flex-1 h-6 text-[9px]" disabled={updateStatus.isPending}>
            {updateStatus.isPending ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : 'Save'}
          </Button>
        </div>
      </div>
    </motion.form>
  );
}

// ── Person card ────────────────────────────────────────────────────────────────
function PersonCard({ person, userPosition }: { person: MissingPerson; userPosition: { lat: number; lng: number } | null }) {
  const { t } = useTranslation();
  const [showUpdate, setShowUpdate] = useState(false);
  const config = statusConfig[person.status] ?? statusConfig.missing;
  const StatusIcon = config.icon;

  const dist = userPosition && person.last_known_lat && person.last_known_lng
    ? distanceKm(userPosition.lat, userPosition.lng, person.last_known_lat, person.last_known_lng).toFixed(1)
    : null;

  const timeAgo = getTimeAgo(person.updated_at);
  const initials = person.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className={cn('border rounded p-2 space-y-1', person.status === 'missing' ? 'border-danger/30' : 'border-border')}>
      <div className="flex items-start gap-2">
        {person.photo_url ? (
          <img src={person.photo_url} alt={person.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
        ) : (
          <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0', config.bgColor, config.color)}>
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-medium truncate">{person.name}</span>
            <Badge variant="outline" className={cn('text-[8px] px-1 py-0 flex items-center gap-0.5 shrink-0', config.color)}>
              <StatusIcon className="h-2 w-2" /> {t(config.key)}
            </Badge>
          </div>
          {(person.age || person.gender) && (
            <div className="text-[9px] text-muted-foreground">
              {[person.age && `${person.age} yrs`, person.gender].filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      </div>

      {person.description && (
        <p className="text-[10px] text-muted-foreground leading-tight">{person.description}</p>
      )}

      {person.last_known_location && (
        <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
          <MapPin className="h-2.5 w-2.5" />
          <span>{t('family.lastSeen')} {person.last_known_location}</span>
          {dist && <span className="text-primary">({dist} km)</span>}
        </div>
      )}

      <div className="flex items-center justify-between text-[9px] text-muted-foreground">
        <span className="flex items-center gap-0.5">
          <Clock className="h-2.5 w-2.5" /> {timeAgo}
        </span>
        <div className="flex items-center gap-1.5">
          {person.contact && (
            <a href={`tel:${person.contact}`} className="flex items-center gap-0.5 text-info hover:underline">
              <Phone className="h-2.5 w-2.5" /> {t('common.contact')}
            </a>
          )}
          <button
            onClick={() => setShowUpdate(prev => !prev)}
            className="flex items-center gap-0.5 text-primary hover:underline"
          >
            {showUpdate ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
            Update
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showUpdate && (
          <StatusUpdateForm key="update" person={person} onClose={() => setShowUpdate(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────────
export function FamilyLocatorPanel() {
  const { t } = useTranslation();
  const { position } = useGeolocation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PersonStatus | 'all'>('all');
  const debouncedSearch = useDebounce(search, 300);

  const { data: allPersons = [], isLoading } = useMissingPersons(debouncedSearch);

  const persons = useMemo(() => {
    let items = statusFilter !== 'all' ? allPersons.filter(p => p.status === statusFilter) : allPersons;
    if (position) {
      items = [...items].sort((a, b) => {
        if (!a.last_known_lat || !a.last_known_lng) return 1;
        if (!b.last_known_lat || !b.last_known_lng) return -1;
        return (
          distanceKm(position.lat, position.lng, a.last_known_lat, a.last_known_lng) -
          distanceKm(position.lat, position.lng, b.last_known_lat, b.last_known_lng)
        );
      });
    }
    return items;
  }, [allPersons, statusFilter, position]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { safe: 0, injured: 0, missing: 0, evacuated: 0 };
    allPersons.forEach(p => { if (p.status in c) c[p.status]++; });
    return c;
  }, [allPersons]);

  return (
    <div className="space-y-2 p-3">
      <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-primary flex items-center gap-2">
        <Users className="h-3 w-3" /> {t('family.title')}
        <span className="ml-auto text-[9px] text-muted-foreground font-mono">{allPersons.length} records</span>
      </h2>

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-1">
        {(['missing','safe','injured','evacuated'] as PersonStatus[]).map(s => {
          const cfg = statusConfig[s];
          const Icon = cfg.icon;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
              className={cn(
                'rounded p-1.5 text-center border transition-colors',
                statusFilter === s ? `${cfg.bgColor} border-current ${cfg.color}` : 'border-border hover:bg-muted/50'
              )}
            >
              <Icon className={cn('h-3 w-3 mx-auto mb-0.5', cfg.color)} />
              <div className="text-sm font-bold">{counts[s] ?? 0}</div>
              <div className="text-[8px] text-muted-foreground">{t(cfg.key)}</div>
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
        {isLoading && (
          <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Person list */}
      <div className="space-y-1.5">
        {persons.length === 0 && !isLoading && (
          <div className="flex flex-col items-center py-6 text-center">
            <Users className="h-6 w-6 text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground">No persons found</p>
            <p className="text-[9px] text-muted-foreground/60 mt-1">
              {search ? 'Try a different search' : 'No records in database yet'}
            </p>
          </div>
        )}
        {persons.map(person => (
          <PersonCard key={person.id} person={person} userPosition={position} />
        ))}
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
