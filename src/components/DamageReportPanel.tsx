import { useState } from 'react';
import { mockDamageReports, type DamageLevel, type ReconstructionStatus } from '@/data/extendedMockData';
import { Building, HardHat, Search, Filter } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const levelColors: Record<DamageLevel, string> = {
  destroyed: 'text-danger',
  severe: 'text-warning',
  moderate: 'text-info',
  minor: 'text-success',
};
const levelBg: Record<DamageLevel, string> = {
  destroyed: 'bg-danger/20',
  severe: 'bg-warning/20',
  moderate: 'bg-info/20',
  minor: 'bg-success/20',
};
const statusKeys: Record<ReconstructionStatus, string> = {
  not_started: 'damage.notStarted',
  assessment: 'damage.planning',
  in_progress: 'damage.inProgress',
  completed: 'damage.completed',
};
const statusColor: Record<ReconstructionStatus, string> = {
  not_started: 'text-muted-foreground',
  assessment: 'text-info',
  in_progress: 'text-warning',
  completed: 'text-success',
};

export function DamageReportPanel() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<DamageLevel | 'all'>('all');

  const levels: DamageLevel[] = ['destroyed', 'severe', 'moderate', 'minor'];

  const filtered = mockDamageReports.filter(r => {
    if (levelFilter !== 'all' && r.damage_level !== levelFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.location.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    }
    return true;
  });

  const stats = {
    total: mockDamageReports.length,
    destroyed: mockDamageReports.filter(r => r.damage_level === 'destroyed').length,
    severe: mockDamageReports.filter(r => r.damage_level === 'severe').length,
    reconstruction: mockDamageReports.filter(r => r.reconstruction_status === 'in_progress' || r.reconstruction_status === 'completed').length,
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <HardHat className="h-3 w-3" /> {t('damage.title')}
        </h3>
      </div>

      {/* Stats */}
      <div className="p-2 grid grid-cols-4 gap-1">
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold">{stats.total}</div>
          <div className="text-[7px] text-muted-foreground">{t('damage.reports')}</div>
        </div>
        <div className="bg-danger/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-danger">{stats.destroyed}</div>
          <div className="text-[7px] text-muted-foreground">{t('damage.destroyed')}</div>
        </div>
        <div className="bg-warning/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-warning">{stats.severe}</div>
          <div className="text-[7px] text-muted-foreground">{t('damage.severe')}</div>
        </div>
        <div className="bg-success/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-success">{stats.reconstruction}</div>
          <div className="text-[7px] text-muted-foreground">{t('damage.rebuilding')}</div>
        </div>
      </div>

      {/* Search & filter */}
      <div className="px-2 pb-1 space-y-1">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input placeholder={t('damage.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)}
            className="h-7 text-xs pl-7" />
        </div>
        <div className="flex items-center gap-1">
          <Filter className="h-3 w-3 text-muted-foreground" />
          <button onClick={() => setLevelFilter('all')}
            className={cn('px-1.5 py-0.5 text-[9px] rounded border transition-colors',
              levelFilter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/50')}>{t('common.all')}</button>
          {levels.map(l => (
            <button key={l} onClick={() => setLevelFilter(l)}
              className={cn('px-1.5 py-0.5 text-[9px] rounded border transition-colors capitalize',
                levelFilter === l ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/50')}>{l}</button>
          ))}
        </div>
      </div>

      {/* Reports */}
      <div className="p-2 space-y-1.5 max-h-[400px] overflow-y-auto">
        {filtered.map(report => (
          <div key={report.id} className="border border-border rounded p-2 space-y-1">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1">
                <Building className={cn('h-3 w-3', levelColors[report.damage_level])} />
                <span className="text-xs font-medium">{report.location}</span>
              </div>
              <span className={cn('text-[8px] px-1 py-0 rounded font-bold uppercase', levelBg[report.damage_level], levelColors[report.damage_level])}>
                {report.damage_level}
              </span>
            </div>

            <p className="text-[9px] text-muted-foreground">{report.description}</p>

            <div className="space-y-0.5">
              <div className="flex justify-between text-[8px]">
                <span className={statusColor[report.reconstruction_status]}>
                  {t(statusKeys[report.reconstruction_status])}
                </span>
                <span>{report.progress_pct}%</span>
              </div>
              <Progress value={report.progress_pct} className="h-1" />
            </div>

            <div className="flex justify-between text-[8px] text-muted-foreground">
              <span>{report.building_type}</span>
              <span>{new Date(report.reported_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
