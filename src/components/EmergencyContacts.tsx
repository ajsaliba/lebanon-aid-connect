import { useBridgedEmergencyContacts } from '@/services/mockBridge';
import { Phone, Building2, Heart, Stethoscope, Shield } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const catIcons = {
  emergency: Shield,
  embassy: Building2,
  ngo: Heart,
  medical: Stethoscope,
};

const catColors = {
  emergency: 'text-danger',
  embassy: 'text-info',
  ngo: 'text-success',
  medical: 'text-warning',
};

export function EmergencyContacts() {
  const { t } = useTranslation();
  const { data: mockEmergencyContacts = [], isLoading } = useBridgedEmergencyContacts();

  if (isLoading) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-2 p-3">
      <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-danger flex items-center gap-2">
        <Phone className="h-3 w-3" /> {t('emergency.contacts')}
      </h2>
      {mockEmergencyContacts.map((contact) => {
        const Icon = catIcons[contact.category];
        return (
          <div key={contact.id} className="p-2 rounded border border-border bg-card/50 text-[11px] flex items-center gap-2">
            <Icon className={`h-4 w-4 shrink-0 ${catColors[contact.category]}`} />
            <div className="flex-1 min-w-0">
              <div className="font-sans font-semibold text-foreground text-xs">{contact.name}</div>
              <div className="text-muted-foreground text-[10px]">{contact.description}</div>
            </div>
            <a
              href={`tel:${contact.phone}`}
              className="shrink-0 text-primary font-bold hover:underline"
            >
              {contact.phone}
            </a>
          </div>
        );
      })}
    </div>
  );
}
