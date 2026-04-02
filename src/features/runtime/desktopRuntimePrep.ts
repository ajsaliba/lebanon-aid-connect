export type DesktopRuntimeKind = 'browser' | 'tauri' | 'electron';

export interface DesktopRuntimeCapabilities {
  fileSystem: boolean;
  notifications: boolean;
  backgroundTasks: boolean;
}

export interface DesktopRuntimeInfo {
  kind: DesktopRuntimeKind;
  available: boolean;
  capabilities: DesktopRuntimeCapabilities;
}

export interface DesktopRuntimeAdapter {
  probe: () => Promise<DesktopRuntimeInfo>;
}

const browserFallback: DesktopRuntimeAdapter = {
  async probe() {
    return {
      kind: 'browser',
      available: false,
      capabilities: {
        fileSystem: false,
        notifications: typeof Notification !== 'undefined',
        backgroundTasks: 'serviceWorker' in navigator,
      },
    };
  },
};

const tauriAdapter: DesktopRuntimeAdapter = {
  async probe() {
    const available = typeof window !== 'undefined' && '__TAURI__' in window;
    return {
      kind: 'tauri',
      available,
      capabilities: {
        fileSystem: available,
        notifications: true,
        backgroundTasks: available,
      },
    };
  },
};

const electronAdapter: DesktopRuntimeAdapter = {
  async probe() {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
    const available = userAgent.includes('electron');
    return {
      kind: 'electron',
      available,
      capabilities: {
        fileSystem: available,
        notifications: true,
        backgroundTasks: available,
      },
    };
  },
};

export async function prepareDesktopRuntime(): Promise<DesktopRuntimeInfo> {
  const adapters = [tauriAdapter, electronAdapter, browserFallback];

  for (const adapter of adapters) {
    const result = await adapter.probe();
    if (result.available || result.kind === 'browser') return result;
  }

  return browserFallback.probe();
}
