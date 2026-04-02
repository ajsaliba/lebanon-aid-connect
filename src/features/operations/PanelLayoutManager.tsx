import { useCallback, useEffect, useMemo, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import {
  Columns2,
  GripVertical,
  LayoutGrid,
  Rows2,
  Settings2,
} from 'lucide-react';
import { LeftSidebar } from '@/components/LeftSidebar';
import { RightPanel } from '@/components/RightPanel';
import { LiveStreams } from '@/components/LiveStreams';
import { ConnectivityPanel } from '@/components/ConnectivityPanel';
import { CorrelationPanel } from '@/components/CorrelationPanel';
import { MlIntelPanel } from '@/components/MlIntelPanel';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AppVariant } from '@/lib/variantSystem';
import { getVariantDefaults } from '@/lib/variantSystem';

interface PanelDefinition {
  id: string;
  title: string;
  description: string;
  defaultColSpan: number;
  defaultRowSpan: number;
  render: () => ReactNode;
}

interface PanelLayoutItem {
  id: string;
  enabled: boolean;
  order: number;
  colSpan: number;
  rowSpan: number;
}

const LAYOUT_STORAGE_PREFIX = 'cedarsalert_ops_layout_v2_';
const MAX_COL_SPAN = 12;
const MIN_COL_SPAN = 3;
const MAX_ROW_SPAN = 10;
const MIN_ROW_SPAN = 2;

const PANEL_DEFINITIONS: PanelDefinition[] = [
  {
    id: 'feed',
    title: 'Feed',
    description: 'Live article stream and search.',
    defaultColSpan: 6,
    defaultRowSpan: 5,
    render: () => <LeftSidebar isOpen mobileForceTab="feed" />,
  },
  {
    id: 'intel',
    title: 'Intel',
    description: 'Intel stack with risk and trend panels.',
    defaultColSpan: 6,
    defaultRowSpan: 6,
    render: () => <LeftSidebar isOpen mobileForceTab="intel" />,
  },
  {
    id: 'resources',
    title: 'Resources',
    description: 'Humanitarian tools and resource board.',
    defaultColSpan: 6,
    defaultRowSpan: 6,
    render: () => <LeftSidebar isOpen mobileForceTab="resources" />,
  },
  {
    id: 'streams',
    title: 'Streams',
    description: 'Live monitoring streams.',
    defaultColSpan: 4,
    defaultRowSpan: 4,
    render: () => <LiveStreams />,
  },
  {
    id: 'aid',
    title: 'Aid Workflows',
    description: 'SOS, shelters, housing, medical, family, jobs.',
    defaultColSpan: 8,
    defaultRowSpan: 7,
    render: () => <RightPanel isOpen onToggle={() => {}} fullWidth />,
  },
  {
    id: 'correlation',
    title: 'Correlation',
    description: 'Cross-domain convergence analysis.',
    defaultColSpan: 4,
    defaultRowSpan: 3,
    render: () => <CorrelationPanel />,
  },
  {
    id: 'ml-intel',
    title: 'ML Intel',
    description: 'Worker-backed summary/sentiment/search.',
    defaultColSpan: 4,
    defaultRowSpan: 3,
    render: () => <MlIntelPanel />,
  },
  {
    id: 'connectivity',
    title: 'Connectivity',
    description: 'Communication and network reachability.',
    defaultColSpan: 4,
    defaultRowSpan: 3,
    render: () => <ConnectivityPanel />,
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeOrder(items: PanelLayoutItem[]): PanelLayoutItem[] {
  return [...items]
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({ ...item, order: index }));
}

function buildDefaultLayout(variant: AppVariant): PanelLayoutItem[] {
  const defaults = getVariantDefaults(variant);
  const enabled = new Set(defaults.panelIds);

  const prioritizedIds = [
    ...defaults.panelIds,
    ...PANEL_DEFINITIONS.map(panel => panel.id).filter(id => !enabled.has(id)),
  ];

  return prioritizedIds.map((id, index) => {
    const def = PANEL_DEFINITIONS.find(panel => panel.id === id)!;
    return {
      id,
      enabled: enabled.has(id),
      order: index,
      colSpan: def.defaultColSpan,
      rowSpan: def.defaultRowSpan,
    };
  });
}

function readLayout(variant: AppVariant): PanelLayoutItem[] {
  if (typeof window === 'undefined') return buildDefaultLayout(variant);

  const storageKey = `${LAYOUT_STORAGE_PREFIX}${variant}`;
  const defaults = buildDefaultLayout(variant);

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as PanelLayoutItem[];
    if (!Array.isArray(parsed)) return defaults;

    const byId = new Map(parsed.map(item => [item.id, item]));
    const merged = defaults.map((item, index) => {
      const existing = byId.get(item.id);
      if (!existing) return { ...item, order: index };

      return {
        id: item.id,
        enabled: typeof existing.enabled === 'boolean' ? existing.enabled : item.enabled,
        order: typeof existing.order === 'number' ? existing.order : index,
        colSpan: clamp(
          typeof existing.colSpan === 'number' ? existing.colSpan : item.colSpan,
          MIN_COL_SPAN,
          MAX_COL_SPAN,
        ),
        rowSpan: clamp(
          typeof existing.rowSpan === 'number' ? existing.rowSpan : item.rowSpan,
          MIN_ROW_SPAN,
          MAX_ROW_SPAN,
        ),
      };
    });

    return normalizeOrder(merged);
  } catch {
    return defaults;
  }
}

function persistLayout(variant: AppVariant, layout: PanelLayoutItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LAYOUT_STORAGE_PREFIX}${variant}`, JSON.stringify(layout));
  } catch {
    // Ignore storage errors.
  }
}

interface PanelLayoutManagerProps {
  variant: AppVariant;
}

export function PanelLayoutManager({ variant }: PanelLayoutManagerProps) {
  const [layout, setLayout] = useState<PanelLayoutItem[]>(() => readLayout(variant));
  const [draggingPanelId, setDraggingPanelId] = useState<string | null>(null);

  useEffect(() => {
    setLayout(readLayout(variant));
  }, [variant]);

  useEffect(() => {
    persistLayout(variant, layout);
  }, [layout, variant]);

  const panelById = useMemo(() => {
    const map = new Map<string, PanelDefinition>();
    for (const definition of PANEL_DEFINITIONS) {
      map.set(definition.id, definition);
    }
    return map;
  }, []);

  const orderedLayout = useMemo(
    () => [...layout].sort((a, b) => a.order - b.order),
    [layout],
  );

  const visiblePanels = useMemo(
    () => orderedLayout.filter(item => item.enabled),
    [orderedLayout],
  );

  const togglePanel = useCallback((id: string, enabled: boolean) => {
    setLayout(prev => {
      const next = prev.map(item => {
        if (item.id !== id) return item;
        return {
          ...item,
          enabled,
          order: enabled ? prev.length : item.order,
        };
      });
      return normalizeOrder(next);
    });
  }, []);

  const reorderPanels = useCallback((fromId: string, toId: string) => {
    setLayout(prev => {
      const enabled = [...prev].filter(item => item.enabled).sort((a, b) => a.order - b.order);
      const fromIndex = enabled.findIndex(item => item.id === fromId);
      const toIndex = enabled.findIndex(item => item.id === toId);

      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return prev;

      const reordered = [...enabled];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);

      const orderById = new Map(reordered.map((item, index) => [item.id, index]));

      const next = prev.map(item => {
        if (!item.enabled) return item;
        return {
          ...item,
          order: orderById.get(item.id) ?? item.order,
        };
      });

      return normalizeOrder(next);
    });
  }, []);

  const updateSpan = useCallback((id: string, deltaCols: number, deltaRows: number) => {
    setLayout(prev => prev.map(item => {
      if (item.id !== id) return item;
      return {
        ...item,
        colSpan: clamp(item.colSpan + deltaCols, MIN_COL_SPAN, MAX_COL_SPAN),
        rowSpan: clamp(item.rowSpan + deltaRows, MIN_ROW_SPAN, MAX_ROW_SPAN),
      };
    }));
  }, []);

  const startPointerResize = useCallback((id: string, mode: 'col' | 'row' | 'both') => (event: ReactPointerEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;
    const current = layout.find(item => item.id === id);
    if (!current) return;

    const startCols = current.colSpan;
    const startRows = current.rowSpan;

    const handleMove = (pointerEvent: PointerEvent) => {
      const deltaX = pointerEvent.clientX - startX;
      const deltaY = pointerEvent.clientY - startY;
      const colDelta = Math.round(deltaX / 80);
      const rowDelta = Math.round(deltaY / 70);

      setLayout(prev => prev.map(item => {
        if (item.id !== id) return item;

        return {
          ...item,
          colSpan: clamp(
            mode === 'row' ? startCols : startCols + colDelta,
            MIN_COL_SPAN,
            MAX_COL_SPAN,
          ),
          rowSpan: clamp(
            mode === 'col' ? startRows : startRows + rowDelta,
            MIN_ROW_SPAN,
            MAX_ROW_SPAN,
          ),
        };
      }));
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, [layout]);

  return (
    <section className="h-full min-h-0 flex flex-col bg-card/40 rounded-md border border-border overflow-hidden">
      <header className="shrink-0 h-10 border-b border-border px-3 flex items-center justify-between bg-card/70">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-primary" />
          <span className="text-[11px] uppercase tracking-wider text-primary font-bold">Operational Panel Grid</span>
          <span className="text-[10px] text-muted-foreground">{visiblePanels.length} active</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1.5">
              <Settings2 className="h-3.5 w-3.5" /> Panels
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Enable / Disable Panels</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PANEL_DEFINITIONS.map(definition => {
              const state = layout.find(item => item.id === definition.id);
              return (
                <DropdownMenuCheckboxItem
                  key={definition.id}
                  checked={state?.enabled ?? false}
                  onCheckedChange={checked => togglePanel(definition.id, !!checked)}
                >
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs">{definition.title}</span>
                    <span className="text-[10px] text-muted-foreground">{definition.description}</span>
                  </div>
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex-1 min-h-0 overflow-auto p-3">
        <div className="grid grid-cols-12 auto-rows-[105px] gap-3">
          {visiblePanels.map(item => {
            const definition = panelById.get(item.id);
            if (!definition) return null;

            return (
              <article
                key={item.id}
                draggable
                onDragStart={() => setDraggingPanelId(item.id)}
                onDragEnd={() => setDraggingPanelId(null)}
                onDragOver={event => event.preventDefault()}
                onDrop={() => {
                  if (!draggingPanelId || draggingPanelId === item.id) return;
                  reorderPanels(draggingPanelId, item.id);
                  setDraggingPanelId(null);
                }}
                className="group rounded-md border border-border bg-card min-h-0 flex flex-col overflow-hidden"
                style={{
                  gridColumn: `span ${item.colSpan} / span ${item.colSpan}`,
                  gridRow: `span ${item.rowSpan} / span ${item.rowSpan}`,
                }}
              >
                <header className="h-8 shrink-0 border-b border-border px-2 flex items-center justify-between bg-muted/35">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <button className="h-5 w-5 rounded hover:bg-muted flex items-center justify-center cursor-grab active:cursor-grabbing" aria-label={`Drag ${definition.title}`}>
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <span className="text-[10px] uppercase tracking-wide font-bold text-foreground truncate">
                      {definition.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => updateSpan(item.id, -1, 0)}
                      aria-label={`Decrease width for ${definition.title}`}
                    >
                      <Columns2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => updateSpan(item.id, 0, -1)}
                      aria-label={`Decrease height for ${definition.title}`}
                    >
                      <Rows2 className="h-3 w-3" />
                    </Button>
                  </div>
                </header>

                <div className="relative flex-1 min-h-0 overflow-hidden">
                  <div className="h-full min-h-0 [&>*]:h-full">{definition.render()}</div>

                  <button
                    onPointerDown={startPointerResize(item.id, 'col')}
                    className="absolute top-0 right-0 h-full w-2 cursor-col-resize opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Resize width for ${definition.title}`}
                  />
                  <button
                    onPointerDown={startPointerResize(item.id, 'row')}
                    className="absolute bottom-0 left-0 w-full h-2 cursor-row-resize opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Resize height for ${definition.title}`}
                  />
                  <button
                    onPointerDown={startPointerResize(item.id, 'both')}
                    className="absolute right-0 bottom-0 h-3 w-3 rounded-tl border border-border bg-muted/80 cursor-nwse-resize"
                    aria-label={`Resize ${definition.title}`}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
