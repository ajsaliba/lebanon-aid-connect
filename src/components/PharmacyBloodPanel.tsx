import { useBridgedPharmacyStock, useBridgedBloodNeeds } from '@/services/mockBridge';
import { Pill, Droplet, Phone, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const urgencyColors: Record<string, string> = {
  critical: 'bg-danger/20 text-danger',
  high: 'bg-warning/20 text-warning',
  normal: 'bg-info/20 text-info',
};

export function PharmacyBloodPanel() {
  const { data: mockPharmacyStocks = [], isLoading: isLoadingPharmacy } = useBridgedPharmacyStock();
  const { data: mockBloodNeeds = [], isLoading: isLoadingBlood } = useBridgedBloodNeeds();
  const isLoading = isLoadingPharmacy || isLoadingBlood;
  const { t } = useTranslation();

  if (isLoading) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Pharmacy Section */}
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-success flex items-center gap-1.5">
          <Pill className="h-3 w-3" /> {t('pharmacy.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('pharmacy.subtitle')}</p>
      </div>

      <div className="p-2 space-y-1.5">
        {mockPharmacyStocks.map(ph => (
          <div key={ph.id} className="border border-border rounded p-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">{ph.pharmacy_name}</span>
              <span className="text-[8px] text-muted-foreground">{ph.city}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {[
                { k: 'insulin', v: ph.insulin },
                { k: 'antibiotics', v: ph.antibiotics },
                { k: 'painkillers', v: ph.painkillers },
                { k: 'blood_pressure', v: ph.blood_pressure },
                { k: 'first_aid', v: ph.first_aid },
              ].map(item => (
                <span key={item.k} className={cn('text-[7px] px-1 py-0.5 rounded flex items-center gap-0.5',
                  item.v ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger')}>
                  {item.v ? <Check className="h-2 w-2" /> : <X className="h-2 w-2" />}
                  {item.k.replace('_', ' ')}
                </span>
              ))}
            </div>
            <div className="text-[8px] text-primary flex items-center gap-1">
              <Phone className="h-2.5 w-2.5" /> {ph.phone}
            </div>
          </div>
        ))}
      </div>

      {/* Blood Donation Section */}
      <div className="p-2 border-t border-border">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-danger flex items-center gap-1 mb-1.5">
          <Droplet className="h-3 w-3" /> {t('pharmacy.bloodNeeds')}
        </h4>
        <div className="space-y-1">
          {mockBloodNeeds.map(bn => (
            <div key={bn.id} className="border border-border rounded p-2 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-medium">{bn.hospital}</div>
                <div className="text-[8px] text-muted-foreground">{bn.city}</div>
              </div>
              <div className="text-right space-y-0.5">
                <span className="text-sm font-bold text-danger">{bn.blood_type}</span>
                <div className="flex items-center gap-1">
                  <span className={cn('text-[7px] px-1 py-0.5 rounded font-bold uppercase', urgencyColors[bn.urgency])}>{bn.urgency}</span>
                  <span className="text-[8px] text-muted-foreground">{bn.units_needed} units</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
