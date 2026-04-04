import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDamageReports, type DamageReport } from '@/hooks/useDataHooks';
import { Building, HardHat, Search, Filter, Upload, X, ImagePlus, Loader2, Plus, ChevronDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';

type DamageLevel = 'minor' | 'moderate' | 'severe' | 'destroyed';
type ReconstructionStatus = 'not_started' | 'assessment' | 'in_progress' | 'completed';

const levelColors: Record<DamageLevel, string> = {
  destroyed: 'text-danger',
  severe: 'text-warning',
  moderate: 'text-info',
  minor: 'text-success',
};
const levelBg: Record<DamageLevel, string> = {
  destroyed: 'bg-danger/20',
  severe: 'bg-warning/20',
  moderate: 'bg-info/20',
  minor: 'bg-success/20',
};
const statusKeys: Record<ReconstructionStatus, string> = {
  not_started: 'damage.notStarted',
  assessment: 'damage.planning',
  in_progress: 'damage.inProgress',
  completed: 'damage.completed',
};
const statusColor: Record<ReconstructionStatus, string> = {
  not_started: 'text-muted-foreground',
  assessment: 'text-info',
  in_progress: 'text-warning',
  completed: 'text-success',
};

// ── Lightbox ──────────────────────────────────────────────────────────────────
function PhotoLightbox({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-black border-gray-800 p-2">
        <img src={url} alt="Damage photo" className="w-full rounded object-contain max-h-[80vh]" />
      </DialogContent>
    </Dialog>
  );
}

// ── Photo strip ───────────────────────────────────────────────────────────────
function PhotoStrip({ urls }: { urls: string[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  if (!urls || urls.length === 0) return null;
  return (
    <>
      <div className="flex gap-1 overflow-x-auto py-1">
        {urls.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`Photo ${i + 1}`}
            onClick={() => setLightbox(url)}
            className="h-20 w-28 object-cover rounded shrink-0 cursor-pointer hover:opacity-80 transition-opacity border border-border"
          />
        ))}
      </div>
      {lightbox && <PhotoLightbox url={lightbox} onClose={() => setLightbox(null)} />}
    </>
  );
}

// ── Report form (with photo upload) ─────────────────────────────────────────
function ReportForm({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [damageLevel, setDamageLevel] = useState<DamageLevel>('moderate');
  const [buildingType, setBuildingType] = useState('residential');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = useCallback((incoming: File[]) => {
    const images = incoming.filter(f => f.type.startsWith('image/'));
    setFiles(prev => [...prev, ...images]);
    images.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => setPreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;
    setSubmitting(true);

    try {
      // Upload photos to Supabase Storage
      const photoUrls: string[] = [];
      for (const file of files) {
        const ext = file.name.split('.').pop() ?? 'jpg';
        const path = `reports/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('damage-photos')
          .upload(path, file, { upsert: false });
        if (uploadErr) {
          console.warn('Upload failed:', uploadErr.message);
          continue;
        }
        const { data: { publicUrl } } = supabase.storage.from('damage-photos').getPublicUrl(uploadData.path);
        photoUrls.push(publicUrl);
      }

      const { error } = await supabase.from('damage_reports').insert({
        location,
        description: description || null,
        damage_level: damageLevel,
        building_type: buildingType,
        photo_urls: photoUrls.length > 0 ? photoUrls : null,
        reconstruction_status: 'not_started',
        progress_pct: 0,
        reported_by: user?.id ?? null,
      });

      if (error) throw error;

      toast({ title: 'Report submitted', description: 'Damage report saved successfully.' });
      qc.invalidateQueries({ queryKey: ['damage_reports'] });
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-muted-foreground">Location *</label>
          <Input value={location} onChange={e => setLocation(e.target.value)} required placeholder="Street / area name" className="h-7 text-xs mt-0.5" />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground">Building type</label>
          <select
            value={buildingType}
            onChange={e => setBuildingType(e.target.value)}
            className="w-full h-7 bg-muted border border-border rounded px-2 text-xs mt-0.5"
          >
            {['residential', 'commercial', 'hospital', 'school', 'infrastructure', 'other'].map(bt => (
              <option key={bt} value={bt}>{bt}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-[10px] text-muted-foreground">Damage level</label>
        <div className="flex gap-1 mt-0.5">
          {(['minor','moderate','severe','destroyed'] as DamageLevel[]).map(l => (
            <button
              key={l}
              type="button"
              onClick={() => setDamageLevel(l)}
              className={cn(
                'flex-1 py-1 text-[9px] rounded border capitalize transition-colors',
                damageLevel === l
                  ? `${levelBg[l]} ${levelColors[l]} border-current`
                  : 'border-border text-muted-foreground hover:border-muted-foreground'
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] text-muted-foreground">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe the damage..."
          className="w-full mt-0.5 bg-muted border border-border rounded px-2 py-1.5 text-xs min-h-[60px] resize-none focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Photo upload dropzone */}
      <div>
        <label className="text-[10px] text-muted-foreground">Photos</label>
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'mt-0.5 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
            dragOver ? 'border-primary/70 bg-primary/5' : 'border-border hover:border-primary/50'
          )}
        >
          <ImagePlus className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
          <p className="text-[10px] text-muted-foreground">Drop images or click to upload</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => addFiles(Array.from(e.target.files ?? []))}
          />
        </div>

        {/* Thumbnails */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-1 mt-1">
            {previews.map((src, i) => (
              <div key={i} className="relative group">
                <img src={src} alt={`Preview ${i}`} className="w-full aspect-square object-cover rounded border border-border" />
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); removeFile(i); }}
                  className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" size="sm" className="flex-1 h-7 text-xs" disabled={submitting || !location.trim()}>
          {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Submit Report'}
        </Button>
      </div>
    </form>
  );
}

// ── Main Panel ─────────────────────────────────────────────────────────────────
export function DamageReportPanel() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<DamageLevel | 'all'>('all');
  const [showForm, setShowForm] = useState(false);

  const { data: reports = [], isLoading, isError } = useDamageReports();

  const levels: DamageLevel[] = ['destroyed', 'severe', 'moderate', 'minor'];

  const filtered = reports.filter(r => {
    if (levelFilter !== 'all' && r.damage_level !== levelFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.location.toLowerCase().includes(q) || (r.description ?? '').toLowerCase().includes(q);
    }
    return true;
  });

  const stats = {
    total: reports.length,
    destroyed: reports.filter(r => r.damage_level === 'destroyed').length,
    severe: reports.filter(r => r.damage_level === 'severe').length,
    reconstruction: reports.filter(r => r.reconstruction_status === 'in_progress' || r.reconstruction_status === 'completed').length,
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <HardHat className="h-3 w-3" /> {t('damage.title')}
        </h3>
        <button
          onClick={() => setShowForm(prev => !prev)}
          className="text-[9px] px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 flex items-center gap-1 font-mono"
        >
          <Plus className="h-2.5 w-2.5" /> Report
        </button>
      </div>

      {/* Report form */}
      {showForm && (
        <div className="p-2 border-b border-border bg-muted/20">
          <ReportForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Stats */}
      {!showForm && (
        <>
          <div className="p-2 grid grid-cols-4 gap-1">
            <div className="bg-muted/30 rounded p-1 text-center">
              <div className="text-[10px] font-bold">{stats.total}</div>
              <div className="text-[7px] text-muted-foreground">{t('damage.reports')}</div>
            </div>
            <div className="bg-danger/10 rounded p-1 text-center">
              <div className="text-[10px] font-bold text-danger">{stats.destroyed}</div>
              <div className="text-[7px] text-muted-foreground">{t('damage.destroyed')}</div>
            </div>
            <div className="bg-warning/10 rounded p-1 text-center">
              <div className="text-[10px] font-bold text-warning">{stats.severe}</div>
              <div className="text-[7px] text-muted-foreground">{t('damage.severe')}</div>
            </div>
            <div className="bg-success/10 rounded p-1 text-center">
              <div className="text-[10px] font-bold text-success">{stats.reconstruction}</div>
              <div className="text-[7px] text-muted-foreground">{t('damage.rebuilding')}</div>
            </div>
          </div>

          {/* Search & filter */}
          <div className="px-2 pb-1 space-y-1">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder={t('damage.searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-7 text-xs pl-7"
              />
            </div>
            <div className="flex items-center gap-1">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <button
                onClick={() => setLevelFilter('all')}
                className={cn('px-1.5 py-0.5 text-[9px] rounded border transition-colors',
                  levelFilter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/50')}
              >
                {t('common.all')}
              </button>
              {levels.map(l => (
                <button
                  key={l}
                  onClick={() => setLevelFilter(l)}
                  className={cn('px-1.5 py-0.5 text-[9px] rounded border transition-colors capitalize',
                    levelFilter === l ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/50')}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Loading / error */}
          {isLoading && (
            <div className="animate-pulse space-y-2 p-2">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded" />)}
            </div>
          )}
          {isError && (
            <p className="text-red-400 text-xs font-mono px-2 py-1">Failed to load reports</p>
          )}

          {/* Reports */}
          <div className="p-2 space-y-1.5 max-h-[400px] overflow-y-auto">
            {filtered.map(report => (
              <div key={report.id} className="border border-border rounded p-2 space-y-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1">
                    <Building className={cn('h-3 w-3', levelColors[report.damage_level])} />
                    <span className="text-xs font-medium">{report.location}</span>
                  </div>
                  <span className={cn('text-[8px] px-1 py-0 rounded font-bold uppercase', levelBg[report.damage_level], levelColors[report.damage_level])}>
                    {report.damage_level}
                  </span>
                </div>

                {report.description && (
                  <p className="text-[9px] text-muted-foreground">{report.description}</p>
                )}

                {/* Photo strip */}
                {report.photo_urls && report.photo_urls.length > 0 && (
                  <PhotoStrip urls={report.photo_urls} />
                )}

                <div className="space-y-0.5">
                  <div className="flex justify-between text-[8px]">
                    <span className={statusColor[report.reconstruction_status]}>
                      {t(statusKeys[report.reconstruction_status])}
                    </span>
                    <span>{report.progress_pct}%</span>
                  </div>
                  <Progress value={report.progress_pct} className="h-1" />
                </div>

                <div className="flex justify-between text-[8px] text-muted-foreground">
                  <span>{report.building_type}</span>
                  <span>{new Date(report.reported_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}

            {filtered.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Building className="h-6 w-6 text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">No damage reports</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
