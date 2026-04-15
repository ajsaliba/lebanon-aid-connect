import { useBridgedEmergencyPlans } from '@/services/mockBridge';
import { Shield, MapPin, Route, Phone, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const routeStatusColor: Record<string, string> = {
  clear: 'text-success',
  risky: 'text-warning',
  blocked: 'text-destructive',
};

export function EmergencyPlanPanel() {
  const { t } = useTranslation();
  const { data: mockEmergencyPlans = [], isLoading } = useBridgedEmergencyPlans();
  const plan = mockEmergencyPlans[0];

  if (isLoading) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;
  if (!plan) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">No emergency plans available.</div>;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Shield className="h-3 w-3" /> {t('emergencyPlan.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('emergencyPlan.subtitle')}</p>
      </div>

      <div className="p-2 space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold">{plan.family_name}</span>
          <span className="text-[8px] text-muted-foreground flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" /> Updated {new Date(plan.last_updated).toLocaleDateString()}
          </span>
        </div>

        {/* Meeting Points */}
        <div className="space-y-1">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
            <MapPin className="h-2.5 w-2.5" /> {t('emergencyPlan.meetingPoints')}
          </p>
          {plan.meeting_points.map((mp, i) => (
            <div key={i} className="bg-muted/30 rounded p-1.5 flex items-center gap-1.5">
              <span className={cn('h-4 w-4 rounded-full flex items-center justify-center text-[8px] font-bold', i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                {i + 1}
              </span>
              <span className="text-[10px]">{mp.label}</span>
            </div>
          ))}
        </div>

        {/* Evacuation Routes */}
        <div className="space-y-1">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
            <Route className="h-2.5 w-2.5" /> {t('emergencyPlan.evacRoutes')}
          </p>
          {plan.evacuation_routes.map((r, i) => (
            <div key={i} className="border border-border rounded p-1.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-medium">{r.name}</span>
                <div className="text-[8px] text-muted-foreground">{r.from} → {r.to} · {r.distance_km} km</div>
              </div>
              <span className={cn('text-[8px] font-bold uppercase', routeStatusColor[r.status])}>{r.status}</span>
            </div>
          ))}
        </div>

        {/* Emergency Contacts */}
        <div className="space-y-1">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
            <Phone className="h-2.5 w-2.5" /> {t('emergencyPlan.contacts')}
          </p>
          {plan.contacts.map((c, i) => (
            <div key={i} className="flex items-center justify-between bg-muted/20 rounded p-1.5">
              <div>
                <span className="text-[10px] font-medium">{c.name}</span>
                <span className="text-[8px] text-muted-foreground ml-1">({c.relation})</span>
              </div>
              <span className="text-[9px] font-mono text-primary">{c.phone}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
