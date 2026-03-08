import { useState, useRef } from 'react';
import { Settings, X, Upload, Download, VolumeX, FileDown, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type FeedSettings, type CardStyle, type PollFrequency, type RetentionDays } from '@/hooks/useFeedSettings';
import { type NewsItem } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
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

const pollOptions: { value: PollFrequency; label: string }[] = [
  { value: 15, label: '15s' },
  { value: 30, label: '30s' },
  { value: 60, label: '60s' },
  { value: 0, label: 'Manual' },
];

const cardOptions: { value: CardStyle; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'headlines', label: 'Headlines' },
  { value: 'list', label: 'List' },
];

const categoryOptions = [
  { value: null as string | null, label: 'All' },
  { value: 'conflict', label: 'Conflict' },
  { value: 'humanitarian', label: 'Humanitarian' },
  { value: 'political', label: 'Political' },
  { value: 'infrastructure', label: 'Infrastructure' },
];

const timeOptions = ['1h', '6h', '24h', '48h', '7d', 'All'];

const retentionOptions: { value: RetentionDays; label: string }[] = [
  { value: 0, label: 'Forever' },
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
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
  const [muteInput, setMuteInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = onImport(reader.result as string);
      toast({ title: ok ? 'Settings imported' : 'Import failed', variant: ok ? 'default' : 'destructive' });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="border-b border-border bg-card/50 p-3 space-y-3 text-[11px]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
          <Settings className="h-3 w-3" /> Feed Settings
        </span>
        <button onClick={onToggle}><X className="h-3 w-3 text-muted-foreground" /></button>
      </div>

      {/* Poll frequency */}
      <div className="space-y-1">
        <span className="text-[9px] font-bold uppercase text-muted-foreground">Refresh Interval</span>
        <div className="flex gap-1">
          {pollOptions.map(o => (
            <Button key={o.value} variant={settings.pollFrequency === o.value ? 'default' : 'ghost'}
              size="sm" className="h-5 px-2 text-[9px]"
              onClick={() => onUpdateSettings({ pollFrequency: o.value })}>{o.label}</Button>
          ))}
        </div>
      </div>

      {/* Default category */}
      <div className="space-y-1">
        <span className="text-[9px] font-bold uppercase text-muted-foreground">Startup Category</span>
        <div className="flex gap-1 flex-wrap">
          {categoryOptions.map(o => (
            <Button key={o.label} variant={settings.defaultCategory === o.value ? 'default' : 'ghost'}
              size="sm" className="h-5 px-2 text-[9px]"
              onClick={() => onUpdateSettings({ defaultCategory: o.value })}>{o.label}</Button>
          ))}
        </div>
      </div>

      {/* Default time filter */}
      <div className="space-y-1">
        <span className="text-[9px] font-bold uppercase text-muted-foreground">Startup Time</span>
        <div className="flex gap-1">
          {timeOptions.map(t => (
            <Button key={t} variant={settings.defaultTimeFilter === t ? 'default' : 'ghost'}
              size="sm" className="h-5 px-1.5 text-[9px]"
              onClick={() => onUpdateSettings({ defaultTimeFilter: t })}>{t}</Button>
          ))}
        </div>
      </div>

      {/* Card style */}
      <div className="space-y-1">
        <span className="text-[9px] font-bold uppercase text-muted-foreground">Card Layout</span>
        <div className="flex gap-1">
          {cardOptions.map(o => (
            <Button key={o.value} variant={settings.cardStyle === o.value ? 'default' : 'ghost'}
              size="sm" className="h-5 px-2 text-[9px]"
              onClick={() => onUpdateSettings({ cardStyle: o.value })}>{o.label}</Button>
          ))}
        </div>
      </div>

      {/* Data retention */}
      <div className="space-y-1">
        <span className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
          <Timer className="h-2.5 w-2.5" /> Data Retention
        </span>
        <div className="flex gap-1">
          {retentionOptions.map(o => (
            <Button key={o.value} variant={settings.retentionDays === o.value ? 'default' : 'ghost'}
              size="sm" className="h-5 px-2 text-[9px]"
              onClick={() => onUpdateSettings({ retentionDays: o.value })}>{o.label}</Button>
          ))}
        </div>
      </div>

      {/* Muted keywords */}
      <div className="space-y-1">
        <span className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
          <VolumeX className="h-2.5 w-2.5" /> Muted Keywords
        </span>
        <div className="flex gap-1">
          <Input value={muteInput} onChange={e => setMuteInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && muteInput.trim()) { onAddMuted(muteInput); setMuteInput(''); } }}
            placeholder="Add keyword to mute..." className="h-6 text-[10px] flex-1" />
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
          <FileDown className="h-2.5 w-2.5" /> Export Articles ({articles.length})
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] gap-1"
            onClick={() => { exportAsJSON(articles); toast({ title: 'Exported as JSON' }); }}>
            📄 JSON
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] gap-1"
            onClick={() => { exportAsCSV(articles); toast({ title: 'Exported as CSV' }); }}>
            📊 CSV
          </Button>
        </div>
      </div>

      {/* Import / Export settings */}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] gap-1" onClick={onExport}>
          <Download className="h-3 w-3" /> Export Settings
        </Button>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] gap-1" onClick={() => fileRef.current?.click()}>
          <Upload className="h-3 w-3" /> Import Settings
        </Button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />
      </div>
    </div>
  );
}
