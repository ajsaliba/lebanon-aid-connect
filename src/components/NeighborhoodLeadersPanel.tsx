import { useBridgedNeighborhoodLeaders, useBridgedCommunityTasks } from '@/services/mockBridge';
import { Crown, Users, Phone, ClipboardList, UserCheck, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const roleColor: Record<string, string> = {
  coordinator: 'text-primary',
  medical_lead: 'text-red-400',
  logistics_lead: 'text-green-400',
  security_lead: 'text-orange-400',
};

const roleLabel: Record<string, string> = {
  coordinator: 'Coordinator',
  medical_lead: 'Medical Lead',
  logistics_lead: 'Logistics Lead',
  security_lead: 'Security Lead',
};

const taskCategoryIcon: Record<string, string> = {
  supply_transport: '📦',
  repair: '🔧',
  medical: '🏥',
  evacuation: '🚗',
  cooking: '🍳',
  childcare: '👶',
};

const urgencyColor: Record<string, string> = {
  critical: 'text-destructive',
  high: 'text-warning',
  normal: 'text-muted-foreground',
};

export function NeighborhoodLeadersPanel() {
  const { data: mockNeighborhoodLeaders = [], isLoading: isLoadingLeaders } = useBridgedNeighborhoodLeaders();
  const { data: mockCommunityTasks = [], isLoading: isLoadingTasks } = useBridgedCommunityTasks();
  const { t } = useTranslation();

  if (isLoadingLeaders || isLoadingTasks) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  const openTasks = mockCommunityTasks.filter(t => t.status === 'open').length;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
          <Crown className="h-3 w-3" /> {t('neighborhoodLeaders.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('neighborhoodLeaders.subtitle')}</p>
      </div>

      {/* Leaders */}
      <div className="p-2 space-y-1 border-b border-border">
        <p className="text-[9px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
          <Users className="h-2.5 w-2.5" /> Emergency Leaders
        </p>
        {mockNeighborhoodLeaders.map(l => (
          <div key={l.id} className="border border-border rounded p-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <UserCheck className={cn('h-3 w-3', roleColor[l.role])} />
                <span className="text-[10px] font-medium">{l.name}</span>
                {l.verified && <span className="text-[7px] bg-primary/20 text-primary rounded px-1">✓</span>}
              </div>
              <span className={cn('text-[8px] font-medium', roleColor[l.role])}>{roleLabel[l.role]}</span>
            </div>
            <div className="flex flex-wrap gap-2 text-[8px] text-muted-foreground mt-0.5">
              <span>{l.neighborhood}, {l.city}</span>
              <span>~{l.people_covered} people</span>
              <span className="flex items-center gap-0.5"><Phone className="h-2 w-2" />{l.phone}</span>
            </div>
            <div className="flex gap-1 mt-0.5">
              {l.skills.map(s => (
                <span key={s} className="text-[7px] bg-muted rounded px-1 py-0.5">{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Community Tasks */}
      <div className="p-2 space-y-1">
        <p className="text-[9px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
          <ClipboardList className="h-2.5 w-2.5" /> Task Board ({openTasks} open)
        </p>
        {mockCommunityTasks.map(task => (
          <div key={task.id} className={cn('border rounded p-1.5',
            task.status === 'done' ? 'border-muted bg-muted/10' : 'border-border'
          )}>
            <div className="flex items-center justify-between">
              <span className={cn('text-[10px] font-medium', task.status === 'done' && 'line-through text-muted-foreground')}>
                {taskCategoryIcon[task.category]} {task.title}
              </span>
              <span className={cn('text-[7px] font-bold uppercase', urgencyColor[task.urgency])}>{task.urgency}</span>
            </div>
            <div className="flex items-center gap-2 text-[8px] text-muted-foreground mt-0.5">
              <span>{task.location}</span>
              <span>by {task.posted_by}</span>
              <span className={task.volunteers_signed >= task.volunteers_needed ? 'text-success' : 'text-warning'}>
                {task.volunteers_signed}/{task.volunteers_needed} volunteers
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
