import {
  DEFAULT_MAP_LAYER_STATE,
  type MapLayerContract,
  type MapLayerToggleState,
} from '@/features/map/mapLayerContract';

export type AppVariant = 'humanitarian' | 'intel' | 'operations' | 'recovery';

export interface VariantDefaults {
  panelIds: string[];
  mapPreset: MapLayerContract;
}

export interface VariantDefinition {
  id: AppVariant;
  label: string;
  description: string;
  defaults: VariantDefaults;
}

const VARIANT_STORAGE_KEY = 'cedarsalert_variant';

const HOSTNAME_VARIANT_MAP: Array<{ match: RegExp; variant: AppVariant }> = [
  { match: /intel/i, variant: 'intel' },
  { match: /ops|monitor/i, variant: 'operations' },
  { match: /recover|relief/i, variant: 'recovery' },
  { match: /aid|help|human/i, variant: 'humanitarian' },
];

const createPreset = (overrides: Partial<MapLayerToggleState>): MapLayerContract => ({
  layers: { ...DEFAULT_MAP_LAYER_STATE, ...overrides },
  timeFilter: '24h',
});

export const VARIANTS: Record<AppVariant, VariantDefinition> = {
  humanitarian: {
    id: 'humanitarian',
    label: 'Humanitarian',
    description: 'Aid delivery, shelters, SOS, and community support.',
    defaults: {
      panelIds: ['aid', 'feed', 'resources', 'connectivity', 'correlation'],
      mapPreset: createPreset({
        shelters: true,
        housing: true,
        sos: true,
        airstrikes: false,
      }),
    },
  },
  intel: {
    id: 'intel',
    label: 'Intel',
    description: 'Situational intelligence, signals, and escalation tracking.',
    defaults: {
      panelIds: ['intel', 'feed', 'streams', 'correlation', 'connectivity'],
      mapPreset: createPreset({
        hotspots: true,
        airstrikes: true,
        infrastructure: true,
        shelters: false,
        housing: false,
      }),
    },
  },
  operations: {
    id: 'operations',
    label: 'Operations',
    description: 'Balanced command view across intel and response.',
    defaults: {
      panelIds: ['feed', 'intel', 'aid', 'resources', 'correlation', 'connectivity'],
      mapPreset: createPreset({
        hotspots: true,
        airstrikes: true,
        shelters: true,
        infrastructure: true,
      }),
    },
  },
  recovery: {
    id: 'recovery',
    label: 'Recovery',
    description: 'Long-tail rebuilding, logistics, and continuity.',
    defaults: {
      panelIds: ['resources', 'aid', 'feed', 'connectivity', 'correlation'],
      mapPreset: createPreset({
        shelters: true,
        housing: true,
        airstrikes: false,
        daynight: true,
      }),
    },
  },
};

export function getVariantDefinitions(): VariantDefinition[] {
  return Object.values(VARIANTS);
}

function normalizeVariant(value: string | null | undefined): AppVariant | null {
  if (value === 'humanitarian' || value === 'intel' || value === 'operations' || value === 'recovery') {
    return value;
  }
  return null;
}

function readStoredVariant(): AppVariant | null {
  if (typeof window === 'undefined') return null;
  try {
    return normalizeVariant(localStorage.getItem(VARIANT_STORAGE_KEY));
  } catch {
    return null;
  }
}

function resolveFromHostname(hostname: string): AppVariant | null {
  for (const rule of HOSTNAME_VARIANT_MAP) {
    if (rule.match.test(hostname)) return rule.variant;
  }
  return null;
}

export function resolveVariant(explicit?: AppVariant | null): AppVariant {
  const preferred = explicit ?? readStoredVariant();
  if (preferred) return preferred;

  const envVariant = normalizeVariant(import.meta.env.VITE_APP_VARIANT as string | undefined);
  if (envVariant) return envVariant;

  if (typeof window !== 'undefined') {
    const hostVariant = resolveFromHostname(window.location.hostname);
    if (hostVariant) return hostVariant;
  }

  return 'operations';
}

export function setVariantPreference(variant: AppVariant) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VARIANT_STORAGE_KEY, variant);
  } catch {
    // Ignore storage exceptions.
  }
}

export function getVariantDefaults(variant: AppVariant): VariantDefaults {
  return VARIANTS[variant].defaults;
}
