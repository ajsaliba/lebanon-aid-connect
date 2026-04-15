import { useBridgedFieldHospitalGuides, useBridgedMedicalEquipment } from '@/services/mockBridge';
import { Stethoscope, BookOpen, Package, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

export function FieldHospitalPanel() {
  const { t } = useTranslation();
  const { data: mockFieldHospitalGuides = [], isLoading: isLoadingGuides } = useBridgedFieldHospitalGuides();
  const { data: mockMedicalEquipment = [], isLoading: isLoadingEquipment } = useBridgedMedicalEquipment();
  const availableEquip = mockMedicalEquipment.filter(e => e.available).length;

  if (isLoadingGuides || isLoadingEquipment) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
          <Stethoscope className="h-3 w-3" /> {t('fieldHospital.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('fieldHospital.subtitle')}</p>
      </div>

      {/* Guides */}
      <div className="p-2 space-y-1.5 border-b border-border">
        <p className="text-[9px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
          <BookOpen className="h-2.5 w-2.5" /> Setup Guides
        </p>
        {mockFieldHospitalGuides.map(guide => (
          <details key={guide.id} className="border border-border rounded overflow-hidden group">
            <summary className="p-1.5 cursor-pointer hover:bg-muted/30 flex items-center gap-1.5 text-[10px] font-medium">
              <span>{guide.icon}</span> {guide.title}
            </summary>
            <div className="p-1.5 bg-muted/10 space-y-0.5">
              {guide.steps.map((step, i) => (
                <div key={i} className="flex gap-1.5 text-[9px]">
                  <span className="text-muted-foreground font-mono w-3">{i + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>

      {/* Equipment sharing */}
      <div className="p-2 space-y-1">
        <p className="text-[9px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
          <Package className="h-2.5 w-2.5" /> Equipment Sharing ({availableEquip}/{mockMedicalEquipment.length} available)
        </p>
        {mockMedicalEquipment.map(eq => (
          <div key={eq.id} className={cn('border rounded p-1.5 flex items-center justify-between',
            eq.available ? 'border-border' : 'border-muted bg-muted/10'
          )}>
            <div>
              <span className="text-[10px] font-medium">{eq.name}</span>
              <div className="flex gap-2 text-[8px] text-muted-foreground">
                <span>{eq.location}, {eq.city}</span>
                <span>Qty: {eq.quantity}</span>
                <span className={cn(eq.condition === 'good' ? 'text-success' : eq.condition === 'fair' ? 'text-warning' : 'text-destructive')}>
                  {eq.condition}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {eq.available && (
                <span className="text-[8px] text-muted-foreground flex items-center gap-0.5">
                  <Phone className="h-2 w-2" />
                </span>
              )}
              <span className={cn('h-2 w-2 rounded-full', eq.available ? 'bg-success' : 'bg-muted-foreground')} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
