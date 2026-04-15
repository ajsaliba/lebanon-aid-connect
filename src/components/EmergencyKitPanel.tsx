import { useState } from 'react';
import { useBridgedEmergencyKitItems } from '@/services/mockBridge';
import type { KitItem } from '@/data/newFeaturesMockData2';
import { Package, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const categoryLabels: Record<KitItem['category'], string> = {
  water: '💧 Water',
  light: '🔦 Light',
  power: '⚡ Power',
  medical: '🩹 Medical',
  documents: '📄 Documents',
  food: '🥫 Food',
  tools: '🔧 Tools',
  hygiene: '🧴 Hygiene',
};

export function EmergencyKitPanel() {
  const { t } = useTranslation();
  const { data: mockKitItems = [], isLoading } = useBridgedEmergencyKitItems();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const totalEssential = mockKitItems.filter(k => k.essential).length;
  const checkedEssential = mockKitItems.filter(k => k.essential && checked.has(k.id)).length;
  const pct = mockKitItems.length > 0 ? Math.round((checked.size / mockKitItems.length) * 100) : 0;
  const categories = [...new Set(mockKitItems.map(k => k.category))];

  if (isLoading) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
          <Package className="h-3 w-3" /> {t('emergencyKit.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('emergencyKit.subtitle')}</p>
      </div>

      {/* Progress bar */}
      <div className="p-2 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-medium">{checked.size}/{mockKitItems.length} items packed</span>
          <span className="text-[9px] text-muted-foreground">{checkedEssential}/{totalEssential} essentials</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="p-2 space-y-2">
        {categories.map(cat => (
          <div key={cat} className="space-y-0.5">
            <p className="text-[9px] font-bold text-muted-foreground">{categoryLabels[cat]}</p>
            {mockKitItems.filter(k => k.category === cat).map(item => (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className="w-full flex items-center gap-1.5 rounded p-1 hover:bg-muted/40 transition-colors text-left"
              >
                {checked.has(item.id)
                  ? <CheckCircle2 className="h-3 w-3 text-success flex-shrink-0" />
                  : <Circle className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                <span className={cn('text-[10px] flex-1', checked.has(item.id) && 'line-through text-muted-foreground')}>
                  {item.icon} {item.name}
                </span>
                <span className="text-[8px] text-muted-foreground">{item.quantity}</span>
                {item.essential && <span className="text-[7px] text-destructive font-bold">*</span>}
              </button>
            ))}
          </div>
        ))}

        <p className="text-[7px] text-muted-foreground text-center mt-1">* = essential item</p>
      </div>
    </div>
  );
}
