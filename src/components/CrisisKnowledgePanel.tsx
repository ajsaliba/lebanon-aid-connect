import { useState } from 'react';
import { useBridgedKnowledgeArticles } from '@/services/mockBridge';
import { BookOpen, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const categoryColors: Record<string, string> = {
  first_aid: 'text-danger',
  evacuation: 'text-warning',
  shelter_building: 'text-info',
  preparedness: 'text-primary',
};

const categoryIcons: Record<string, string> = {
  first_aid: '🩹',
  evacuation: '🚪',
  shelter_building: '🏗️',
  preparedness: '🎒',
};

const categoryLabels: Record<string, string> = {
  first_aid: 'First Aid',
  evacuation: 'Evacuation',
  shelter_building: 'Shelter',
  preparedness: 'Preparedness',
};

export function CrisisKnowledgePanel() {
  const { t } = useTranslation();
  const { data: mockKnowledgeArticles = [], isLoading } = useBridgedKnowledgeArticles();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  if (isLoading) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  const filtered = mockKnowledgeArticles.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
  });

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <BookOpen className="h-3 w-3" /> {t('knowledge.center')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('knowledge.subtitle')}</p>
      </div>

      {/* Category chips */}
      <div className="p-2 flex flex-wrap gap-1">
        {Object.entries(categoryLabels).map(([key, label]) => {
          const count = mockKnowledgeArticles.filter(a => a.category === key).length;
          return (
            <button key={key} onClick={() => setSearch(key)}
              className="px-1.5 py-0.5 text-[9px] rounded border border-border hover:bg-muted/50 transition-colors flex items-center gap-0.5">
              {categoryIcons[key]} {label} <span className="text-muted-foreground">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="px-2 pb-1">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input placeholder={t('knowledge.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)}
            className="h-7 text-xs pl-7" />
        </div>
      </div>

      {/* Articles */}
      <div className="p-2 space-y-1.5 max-h-[400px] overflow-y-auto">
        {filtered.map(article => (
          <div key={article.id} className="border border-border rounded overflow-hidden">
            <button onClick={() => setExpanded(expanded === article.id ? null : article.id)}
              className="w-full p-2 text-left flex items-start justify-between gap-1 hover:bg-muted/30 transition-colors">
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-1">
                  <span className={cn('text-[8px]', categoryColors[article.category])}>
                    {categoryIcons[article.category]} {categoryLabels[article.category]}
                  </span>
                </div>
                <div className="text-xs font-medium">{article.title}</div>
              </div>
              {expanded === article.id
                ? <ChevronUp className="h-3 w-3 text-muted-foreground mt-1" />
                : <ChevronDown className="h-3 w-3 text-muted-foreground mt-1" />}
            </button>

            {expanded === article.id && (
              <div className="px-2 pb-2 space-y-1.5 border-t border-border bg-muted/10">
                <p className="text-[9px] text-muted-foreground pt-1.5">{article.summary}</p>

                {article.steps && article.steps.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[9px] font-bold text-primary">{t('knowledge.steps')}:</div>
                    <ol className="space-y-0.5 list-decimal list-inside">
                      {article.steps.map((step, i) => (
                        <li key={i} className="text-[9px] text-muted-foreground">{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
