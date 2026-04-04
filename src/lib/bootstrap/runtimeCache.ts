import type { NewsItem } from '@/data/mockData';
import type { AppVariant } from '@/lib/variantSystem';
import type { MapLayerContract, MapViewportState } from '@/features/map/mapLayerContract';

const BOOTSTRAP_CACHE_KEY = 'cedarsalert_bootstrap_runtime_v3';

export interface BootstrapNewsSection {
  savedAt: string;
  lastUpdated: string | null;
  news: NewsItem[];
}

export interface BootstrapShellSection {
  savedAt: string;
  variant: AppVariant;
  mapMode: '2d' | '3d';
  mapViewport: MapViewportState;
  variantContracts: Partial<Record<AppVariant, MapLayerContract>>;
}

interface BootstrapPayload {
  version: 3;
  news?: BootstrapNewsSection;
  shell?: BootstrapShellSection;
}

interface ParsedBootstrap {
  payload: BootstrapPayload;
}

function readPayload(): ParsedBootstrap | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(BOOTSTRAP_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as BootstrapPayload;
    if (!parsed || parsed.version !== 3) return null;

    return { payload: parsed };
  } catch {
    return null;
  }
}

function writePayload(updater: (prev: BootstrapPayload) => BootstrapPayload) {
  if (typeof window === 'undefined') return;

  try {
    const existing = readPayload()?.payload ?? { version: 3 };
    const next = updater(existing);
    localStorage.setItem(BOOTSTRAP_CACHE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage errors.
  }
}

export function readNewsBootstrap(maxAgeMs: number) {
  const payload = readPayload()?.payload;
  const section = payload?.news;
  if (!section || !Array.isArray(section.news)) return null;

  const savedAtMs = new Date(section.savedAt).getTime();
  if (!Number.isFinite(savedAtMs)) return null;

  const ageMs = Date.now() - savedAtMs;
  if (ageMs > maxAgeMs) return null;

  return {
    news: section.news,
    lastUpdated: section.lastUpdated ? new Date(section.lastUpdated) : null,
    ageMs,
  };
}

export function writeNewsBootstrap(news: NewsItem[], lastUpdated: Date | null) {
  const section: BootstrapNewsSection = {
    savedAt: new Date().toISOString(),
    lastUpdated: lastUpdated?.toISOString() ?? null,
    news,
  };

  writePayload(prev => ({
    ...prev,
    version: 3,
    news: section,
  }));
}

export function readShellBootstrap(maxAgeMs: number) {
  const payload = readPayload()?.payload;
  const section = payload?.shell;
  if (!section) return null;

  const savedAtMs = new Date(section.savedAt).getTime();
  if (!Number.isFinite(savedAtMs)) return null;

  const ageMs = Date.now() - savedAtMs;
  if (ageMs > maxAgeMs) return null;

  return {
    shell: section,
    ageMs,
  };
}

export function writeShellBootstrap(shell: Omit<BootstrapShellSection, 'savedAt'>) {
  const section: BootstrapShellSection = {
    ...shell,
    savedAt: new Date().toISOString(),
  };

  writePayload(prev => ({
    ...prev,
    version: 3,
    shell: section,
  }));
}
