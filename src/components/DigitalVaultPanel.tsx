import { mockVaultDocuments } from '@/data/newFeaturesMockData2';
import { Lock, FileText, Shield, Upload, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const typeLabel: Record<string, string> = {
  passport: 'Passport',
  id_card: 'ID Card',
  birth_cert: 'Birth Certificate',
  medical_record: 'Medical Record',
  property_deed: 'Property Deed',
  insurance: 'Insurance',
  diploma: 'Diploma',
};

export function DigitalVaultPanel() {
  const { t } = useTranslation();
  const backed = mockVaultDocuments.filter(d => d.backed_up).length;
  const encrypted = mockVaultDocuments.filter(d => d.encrypted).length;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
          <Lock className="h-3 w-3" /> {t('digitalVault.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('digitalVault.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="p-2 grid grid-cols-3 gap-1 border-b border-border">
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-primary">{mockVaultDocuments.length}</div>
          <div className="text-[7px] text-muted-foreground">Documents</div>
        </div>
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-success">{encrypted}</div>
          <div className="text-[7px] text-muted-foreground">Encrypted</div>
        </div>
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className={cn('text-[10px] font-bold', backed === mockVaultDocuments.length ? 'text-success' : 'text-warning')}>{backed}/{mockVaultDocuments.length}</div>
          <div className="text-[7px] text-muted-foreground">Backed up</div>
        </div>
      </div>

      <div className="p-2 space-y-1">
        {mockVaultDocuments.map(doc => (
          <div key={doc.id} className="border border-border rounded p-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm">{doc.icon}</span>
              <div className="min-w-0">
                <p className="text-[10px] font-medium truncate">{doc.name}</p>
                <div className="flex gap-2 text-[8px] text-muted-foreground">
                  <span>{typeLabel[doc.type]}</span>
                  <span>{doc.family_member}</span>
                  <span>{doc.uploaded_at}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {doc.encrypted && <Shield className="h-3 w-3 text-success" />}
              {doc.backed_up ? (
                <CheckCircle2 className="h-3 w-3 text-success" />
              ) : (
                <Upload className="h-3 w-3 text-warning" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-border">
        <button className="w-full bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-medium rounded p-1.5 flex items-center justify-center gap-1 transition-colors">
          <FileText className="h-3 w-3" /> Upload New Document
        </button>
      </div>
    </div>
  );
}
