import { mockReconstructionProjects, mockSkilledWorkers } from '@/data/newFeaturesMockData2';
import { HardHat, Building2, DollarSign, Wrench, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const damageIcon: Record<string, string> = {
  residential: '🏠',
  infrastructure: '🏗️',
  commercial: '🏬',
  school: '🏫',
  hospital: '🏥',
};

const statusColor: Record<string, string> = {
  assessment: 'text-muted-foreground',
  funded: 'text-primary',
  in_progress: 'text-warning',
  completed: 'text-success',
};

const skillIcon: Record<string, string> = {
  engineer: '👷',
  electrician: '⚡',
  builder: '🧱',
  plumber: '🔧',
  welder: '🔥',
};

export function ReconstructionPanel() {
  const { t } = useTranslation();
  const totalNeeded = mockReconstructionProjects.reduce((s, p) => s + p.funding_needed_usd, 0);
  const totalReceived = mockReconstructionProjects.reduce((s, p) => s + p.funding_received_usd, 0);
  const pct = Math.round((totalReceived / totalNeeded) * 100);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <HardHat className="h-3 w-3" /> {t('reconstruction.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('reconstruction.subtitle')}</p>
      </div>

      {/* Funding overview */}
      <div className="p-2 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-medium flex items-center gap-1">
            <DollarSign className="h-2.5 w-2.5 text-success" /> ${(totalReceived / 1e6).toFixed(1)}M / ${(totalNeeded / 1e6).toFixed(1)}M raised
          </span>
          <span className="text-[9px] text-muted-foreground">{pct}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Projects */}
      <div className="p-2 space-y-1.5 border-b border-border">
        <p className="text-[9px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
          <Building2 className="h-2.5 w-2.5" /> Projects
        </p>
        {mockReconstructionProjects.map(p => {
          const fundPct = Math.round((p.funding_received_usd / p.funding_needed_usd) * 100);
          return (
            <div key={p.id} className="border border-border rounded p-1.5 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium">{damageIcon[p.damage_type]} {p.area}</span>
                <span className={cn('text-[7px] font-bold uppercase', statusColor[p.status])}>{p.status.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-2 text-[8px] text-muted-foreground">
                <span>{p.city}</span>
                <span>{p.organization}</span>
                <span>${(p.funding_received_usd / 1e6).toFixed(1)}M/{(p.funding_needed_usd / 1e6).toFixed(1)}M</span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${fundPct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Workers */}
      <div className="p-2 space-y-1">
        <p className="text-[9px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
          <Wrench className="h-2.5 w-2.5" /> Skilled Workers
        </p>
        {mockSkilledWorkers.map(w => (
          <div key={w.id} className="flex items-center justify-between bg-muted/20 rounded p-1.5">
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3 text-muted-foreground" />
              <div>
                <span className="text-[10px] font-medium">{w.name}</span>
                <div className="text-[8px] text-muted-foreground">{skillIcon[w.skill]} {w.skill} · {w.experience_years}y · {w.city}</div>
              </div>
            </div>
            <span className={cn('h-2 w-2 rounded-full', w.available ? 'bg-success' : 'bg-muted-foreground')} />
          </div>
        ))}
      </div>
    </div>
  );
}
