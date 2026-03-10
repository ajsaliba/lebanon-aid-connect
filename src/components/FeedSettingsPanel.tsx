import { useState, useRef } from 'react';
import { Settings, X, Upload, Download, VolumeX, FileDown, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type FeedSettings, type CardStyle, type PollFrequency, type RetentionDays } from '@/hooks/useFeedSettings';
import { type NewsItem } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { sanitizeFeedText } from '@/lib/sanitizeFeedText';

interface FeedSettingsPanelProps {
  settings: FeedSettings;
  onUpdateSettings: (partial: Partial<FeedSettings>) => void;
  mutedKeywords: Set<string>;
  onAddMuted: (k: string) => void;
  onRemoveMuted: (k: string) => void;
  onExport: () => void;
  onImport: (json: string) => boolean;
  articles: NewsItem[];
  isOpen: boolean;
  onToggle: () => void;
}

const pollOptions: { value: PollFrequency; labelKey: string }[] = [
  { value: 15, labelKey: '15s' },
  { value: 30, labelKey: '30s' },
  { value: 60, labelKey: '60s' },
  { value: 0, labelKey: 'settings.manual' },
];

const cardOptions: { value: CardStyle; labelKey: string }[] = [
  { value: 'standard', labelKey: 'settings.standard' },
  { value: 'headlines', labelKey: 'settings.headlines' },
  { value: 'list', labelKey: 'settings.list' },
];

const categoryOptions = [
  { value: null as string | null, labelKey: 'common.all' },
  { value: 'conflict', labelKey: 'settings.conflict' },
  { value: 'humanitarian', labelKey: 'settings.humanitarian' },
  { value: 'political', labelKey: 'settings.political' },
  { value: 'infrastructure', labelKey: 'settings.infrastructure' },
];

const retentionOptions: { value: RetentionDays; labelKey: string }[] = [
  { value: 0, labelKey: 'settings.forever' },
  { value: 7, labelKey: 'settings.7days' },
  { value: 30, labelKey: 'settings.30days' },
  { value: 90, labelKey: 'settings.90days' },
];

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportAsJSON(articles: NewsItem[]) {
  const data = articles.map(a => ({
    title: sanitizeFeedText(a.title),
    summary: sanitizeFeedText(a.summary),
    source: a.source,
    url: a.url,
    publishedAt: a.publishedAt,
    severity: a.severity,
    category: a.category,
  }));
  downloadFile(JSON.stringify(data, null, 2), `cedarsalert-articles-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
}

function exportAsCSV(articles: NewsItem[]) {
  const headers = ['Title', 'Summary', 'Source', 'URL', 'Published', 'Severity', 'Category'];
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const rows = articles.map(a => [
    escape(sanitizeFeedText(a.title)),
    escape(sanitizeFeedText(a.summary)),
    escape(a.source),
    escape(a.url || ''),
    escape(a.publishedAt),
    escape(a.severity),
    escape(a.category),
  ].join(','));
  downloadFile([headers.join(','), ...rows].join('\n'), `cedarsalert-articles-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
}

export function FeedSettingsPanel({
  settings, onUpdateSettings, mutedKeywords, onAddMuted, onRemoveMuted,
  onExport, onImport, articles, isOpen, onToggle,
}: FeedSettingsPanelProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [muteInput, setMuteInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = onImport(reader.result as string);
      toast({ title: ok ? t('settings.imported') : t('settings.importFailed'), variant: ok ? 'default' : 'destructive' });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="border-b border-border bg-card/50 p-3 space-y-3 text-[11px]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
          <Settings className="h-3 w-3" /> {t('settings.title')}
        </span>
        <button onClick={onToggle}><X className="h-3 w-3 text-muted-foreground" /></button>
      </div>

      {/* Poll frequency */}
      <div className="space-y-1">
        <span className="text-[9px] font-bold uppercase text-muted-foreground">{t('settings.refreshInterval')}</span>
        <div className="flex gap-1">
          {pollOptions.map(o => (
            <Button key={o.value} variant={settings.pollFrequency === o.value ? 'default' : 'ghost'}
              size="sm" className="h-5 px-2 text-[9px]"
              onClick={() => onUpdateSettings({ pollFrequency: o.value })}>{t(o.labelKey)}</Button>
          ))}
        </div>
      </div>

      {/* Default category */}
      <div className="space-y-1">
        <span className="text-[9px] font-bold uppercase text-muted-foreground">{t('settings.startupCategory')}</span>
        <div className="flex gap-1 flex-wrap">
          {categoryOptions.map(o => (
            <Button key={o.labelKey} variant={settings.defaultCategory === o.value ? 'default' : 'ghost'}
              size="sm" className="h-5 px-2 text-[9px]"
              onClick={() => onUpdateSettings({ defaultCategory: o.value })}>{t(o.labelKey)}</Button>
          ))}
        </div>
      </div>

      {/* Default time filter */}
      <div className="space-y-1">
        <span className="text-[9px] font-bold uppercase text-muted-foreground">{t('settings.startupTime')}</span>
        <div className="flex gap-1">
          {['1h', '6h', '24h', '48h', '7d', 'All'].map(tp => (
            <Button key={tp} variant={settings.defaultTimeFilter === tp ? 'default' : 'ghost'}
              size="sm" className="h-5 px-1.5 text-[9px]"
              onClick={() => onUpdateSettings({ defaultTimeFilter: tp })}>{tp}</Button>
          ))}
        </div>
      </div>

      {/* Card style */}
      <div className="space-y-1">
        <span className="text-[9px] font-bold uppercase text-muted-foreground">{t('settings.cardLayout')}</span>
        <div className="flex gap-1">
          {cardOptions.map(o => (
            <Button key={o.value} variant={settings.cardStyle === o.value ? 'default' : 'ghost'}
              size="sm" className="h-5 px-2 text-[9px]"
              onClick={() => onUpdateSettings({ cardStyle: o.value })}>{t(o.labelKey)}</Button>
          ))}
        </div>
      </div>

      {/* Data retention */}
      <div className="space-y-1">
        <span className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
          <Timer className="h-2.5 w-2.5" /> {t('settings.dataRetention')}
        </span>
        <div className="flex gap-1">
          {retentionOptions.map(o => (
            <Button key={o.value} variant={settings.retentionDays === o.value ? 'default' : 'ghost'}
              size="sm" className="h-5 px-2 text-[9px]"
              onClick={() => onUpdateSettings({ retentionDays: o.value })}>{t(o.labelKey)}</Button>
          ))}
        </div>
      </div>

      {/* Muted keywords */}
      <div className="space-y-1">
        <span className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
          <VolumeX className="h-2.5 w-2.5" /> {t('settings.mutedKeywords')}
        </span>
        <div className="flex gap-1">
          <Input value={muteInput} onChange={e => setMuteInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && muteInput.trim()) { onAddMuted(muteInput); setMuteInput(''); } }}
            placeholder={t('settings.addKeyword')} className="h-6 text-[10px] flex-1" />
          <Button size="sm" className="h-6 px-2 text-[9px]" onClick={() => { if (muteInput.trim()) { onAddMuted(muteInput); setMuteInput(''); } }}>
            <VolumeX className="h-3 w-3" />
          </Button>
        </div>
        {mutedKeywords.size > 0 && (
          <div className="flex gap-1 flex-wrap">
            {[...mutedKeywords].map(k => (
              <span key={k} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] border border-destructive/30 bg-destructive/10 text-destructive">
                {k}
                <button onClick={() => onRemoveMuted(k)}><X className="h-2 w-2" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Export articles */}
      <div className="space-y-1">
        <span className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
          <FileDown className="h-2.5 w-2.5" /> {t('settings.exportArticles')} ({articles.length})
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] gap-1"
            onClick={() => { exportAsJSON(articles); toast({ title: t('settings.exportedJSON') }); }}>
            📄 JSON
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] gap-1"
            onClick={() => { exportAsCSV(articles); toast({ title: t('settings.exportedCSV') }); }}>
            📊 CSV
          </Button>
        </div>
      </div>

      {/* Import / Export settings */}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] gap-1" onClick={onExport}>
          <Download className="h-3 w-3" /> {t('settings.exportSettings')}
        </Button>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] gap-1" onClick={() => fileRef.current?.click()}>
          <Upload className="h-3 w-3" /> {t('settings.importSettings')}
        </Button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />
      </div>
    </div>
  );
}
