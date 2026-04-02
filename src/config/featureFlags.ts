export type FeatureFlagKey = 'operationsShell' | 'map3dGlobe' | 'desktopRuntimePrep';

export interface FeatureFlagConfig {
  key: FeatureFlagKey;
  envVar: string;
  defaultEnabled: boolean;
}

const FEATURE_FLAGS: FeatureFlagConfig[] = [
  { key: 'operationsShell', envVar: 'VITE_ENABLE_OPERATIONS_SHELL', defaultEnabled: true },
  { key: 'map3dGlobe', envVar: 'VITE_ENABLE_3D_GLOBE', defaultEnabled: true },
  { key: 'desktopRuntimePrep', envVar: 'VITE_ENABLE_DESKTOP_RUNTIME_PREP', defaultEnabled: false },
];

const STORAGE_KEY_PREFIX = 'cedarsalert_flag_';

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;
  return value === '1' || value.toLowerCase() === 'true';
}

function getBaseFlagValue(config: FeatureFlagConfig): boolean {
  const envValue = import.meta.env[config.envVar] as string | undefined;
  return parseBoolean(envValue, config.defaultEnabled);
}

function getLocalOverride(key: FeatureFlagKey): boolean | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);
    if (stored === 'true') return true;
    if (stored === 'false') return false;
  } catch {
    // Ignore storage exceptions.
  }

  return null;
}

export function setFeatureFlagOverride(key: FeatureFlagKey, value: boolean | null) {
  if (typeof window === 'undefined') return;

  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${key}`;
    if (value === null) {
      localStorage.removeItem(storageKey);
      return;
    }
    localStorage.setItem(storageKey, String(value));
  } catch {
    // Ignore storage exceptions.
  }
}

export function isFeatureEnabled(key: FeatureFlagKey): boolean {
  const config = FEATURE_FLAGS.find(flag => flag.key === key);
  if (!config) return false;

  const localOverride = getLocalOverride(key);
  if (localOverride !== null) return localOverride;

  return getBaseFlagValue(config);
}

export function getFeatureFlagsSnapshot(): Record<FeatureFlagKey, boolean> {
  return FEATURE_FLAGS.reduce((acc, config) => {
    acc[config.key] = isFeatureEnabled(config.key);
    return acc;
  }, {} as Record<FeatureFlagKey, boolean>);
}
