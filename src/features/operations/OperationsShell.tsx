import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CircleDot,
  Cpu,
  Globe,
  LayoutPanelTop,
  Maximize2,
  Minimize2,
  Pin,
  PinOff,
  RectangleHorizontal,
  Shrink,
} from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { AlertTicker } from '@/components/AlertTicker';
import { CrisisMap } from '@/components/CrisisMap';
import { StatusBar } from '@/components/StatusBar';
import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { usePersistedState } from '@/hooks/usePersistedState';
import { PanelLayoutManager } from '@/features/operations/PanelLayoutManager';
import { MapGlobe3D } from '@/features/map/MapGlobe3D';
import {
  DEFAULT_MAP_CONTRACT,
  DEFAULT_MAP_VIEWPORT,
  normalizeMapLayerState,
  type MapLayerContract,
  type MapViewportState,
} from '@/features/map/mapLayerContract';
import {
  type AppVariant,
  getVariantDefaults,
  getVariantDefinitions,
  getVariantRuntimeConfig,
  resolveVariant,
  setVariantPreference,
} from '@/lib/variantSystem';
import { isFeatureEnabled } from '@/config/featureFlags';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { prepareDesktopRuntime, type DesktopRuntimeInfo } from '@/features/runtime/desktopRuntimePrep';
import { readShellBootstrap, writeShellBootstrap } from '@/lib/bootstrap/runtimeCache';

type MapMode = '2d' | '3d';
type MobileOpsView = 'map' | 'panels';

type VariantMapContracts = Partial<Record<AppVariant, MapLayerContract>>;

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    media.addEventListener('change', onChange);
    onChange();
    return () => media.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export function OperationsShell() {
  const bootstrapShellSeed = useMemo(() => readShellBootstrap(12 * 60 * 60 * 1000)?.shell ?? null, []);

  const [variant, setVariant] = usePersistedState<AppVariant>('cedarsalert_variant_runtime', bootstrapShellSeed?.variant ?? resolveVariant());
  const [activeRegion, setActiveRegion] = usePersistedState<string>('cedarsalert_region', 'global');
  const [mapMode, setMapMode] = usePersistedState<MapMode>('cedarsalert_ops_map_mode', bootstrapShellSeed?.mapMode ?? '2d');
  const [mapPinned, setMapPinned] = usePersistedState<boolean>('cedarsalert_ops_map_pinned', false);
  const [mapSize, setMapSize] = usePersistedState<number>('cedarsalert_ops_map_size', 56);
  const [gridVisible, setGridVisible] = usePersistedState<boolean>('cedarsalert_ops_grid_visible', true);
  const [mobileView, setMobileView] = usePersistedState<MobileOpsView>('cedarsalert_ops_mobile_view', 'map');
  const [variantMapContracts, setVariantMapContracts] = usePersistedState<VariantMapContracts>(
    'cedarsalert_ops_map_contracts',
    bootstrapShellSeed?.variantContracts ?? {},
  );
  const [mapViewport, setMapViewport] = usePersistedState<MapViewportState>('cedarsalert_ops_map_viewport', bootstrapShellSeed?.mapViewport ?? DEFAULT_MAP_VIEWPORT);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [runtimeInfo, setRuntimeInfo] = useState<DesktopRuntimeInfo | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const globeFlagEnabled = isFeatureEnabled('map3dGlobe');
  const desktopRuntimeFlagEnabled = isFeatureEnabled('desktopRuntimePrep');

  const sideBySideLayout = useMediaQuery('(min-width: 1700px)');
  const isMobileLayout = useMediaQuery('(max-width: 1023px)');
  const { error, connectivityState, cacheAgeMs } = useNewsFeedContext();

  const variantDefinitions = useMemo(() => getVariantDefinitions(), []);

  useEffect(() => {
    setVariantPreference(variant);
  }, [variant]);

  useEffect(() => {
    setVariantMapContracts(prev => {
      if (prev[variant]) return prev;
      return {
        ...prev,
        [variant]: getVariantDefaults(variant).mapPreset,
      };
    });
  }, [setVariantMapContracts, variant]);

  useEffect(() => {
    const hasVariantState = !!variantMapContracts[variant];
    if (hasVariantState) return;

    const runtimeDefaults = getVariantRuntimeConfig(variant);
    setMapMode(runtimeDefaults.defaultMapMode);
    setMobileView(runtimeDefaults.mobileDefaultView);
  }, [setMapMode, setMobileView, variant, variantMapContracts]);

  useEffect(() => {
    if (mapMode === '3d' && !globeFlagEnabled) {
      setMapMode('2d');
    }
  }, [globeFlagEnabled, mapMode, setMapMode]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsMapFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    if (!desktopRuntimeFlagEnabled) return;
    let mounted = true;

    prepareDesktopRuntime()
      .then(info => {
        if (!mounted) return;
        setRuntimeInfo(info);
      })
      .catch(() => {
        if (!mounted) return;
        setRuntimeInfo({
          kind: 'browser',
          available: false,
          capabilities: {
            fileSystem: false,
            notifications: false,
            backgroundTasks: false,
          },
        });
      });

    return () => {
      mounted = false;
    };
  }, [desktopRuntimeFlagEnabled]);

  useEffect(() => {
    writeShellBootstrap({
      variant,
      mapMode,
      mapViewport,
      variantContracts: variantMapContracts,
    });
  }, [variant, mapMode, mapViewport, variantMapContracts]);

  const activeMapContract = useMemo(() => {
    const stored = variantMapContracts[variant] ?? getVariantDefaults(variant).mapPreset ?? DEFAULT_MAP_CONTRACT;
    return {
      ...stored,
      layers: normalizeMapLayerState(stored.layers),
    };
  }, [variant, variantMapContracts]);

  const handleMapContractChange = useCallback((nextContract: MapLayerContract) => {
    setVariantMapContracts(prev => {
      const current = prev[variant];
      if (current && JSON.stringify(current) === JSON.stringify(nextContract)) {
        return prev;
      }

      return {
        ...prev,
        [variant]: nextContract,
      };
    });
  }, [setVariantMapContracts, variant]);

  const freshnessLabel = useMemo(() => {
    if (cacheAgeMs === null) return 'n/a';
    if (cacheAgeMs < 60000) return 'fresh';
    if (cacheAgeMs < 3600000) return `${Math.floor(cacheAgeMs / 60000)}m`;
    return `${Math.floor(cacheAgeMs / 3600000)}h`;
  }, [cacheAgeMs]);

  const toggleMapFullscreen = () => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }

    container.requestFullscreen().catch(() => {});
  };

  const renderMapEngine = () => {
    if (mapMode === '3d' && globeFlagEnabled) {
      return (
        <MapGlobe3D
          contract={activeMapContract}
          initialViewport={mapViewport}
          onViewportChange={setMapViewport}
        />
      );
    }
    return (
      <CrisisMap
        key={`map-${variant}`}
        initialContract={activeMapContract}
        initialViewport={mapViewport}
        onContractChange={handleMapContractChange}
        onViewportChange={setMapViewport}
      />
    );
  };

  const mapArea = (
    <section className="h-full min-h-0 flex flex-col rounded-md border border-border overflow-hidden bg-card">
      <header className="h-10 border-b border-border px-3 flex items-center justify-between bg-card/90">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider font-bold text-primary">Map Command</span>
          <span
            className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border border-border ${
              connectivityState === 'live'
                ? 'text-success bg-success/10'
                : connectivityState === 'cached'
                  ? 'text-warning bg-warning/10'
                  : 'text-danger bg-danger/10'
            }`}
          >
            {connectivityState}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase">freshness {freshnessLabel}</span>
          <div className="flex items-center rounded border border-border overflow-hidden">
            <button
              onClick={() => setMapMode('2d')}
              className={`h-7 px-2 text-[10px] font-semibold ${mapMode === '2d' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted/70'}`}
              aria-label="Switch to 2D map"
            >
              2D
            </button>
            <button
              onClick={() => setMapMode('3d')}
              className={`h-7 px-2 text-[10px] font-semibold border-l border-border ${mapMode === '3d' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted/70'}`}
              aria-label="Switch to 3D map"
            >
              <span className="inline-flex items-center gap-1">
                <Globe className="h-3 w-3" /> 3D
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setMapPinned(prev => !prev)}
            aria-label={mapPinned ? 'Unpin map section' : 'Pin map section'}
          >
            {mapPinned ? <Pin className="h-3.5 w-3.5 text-primary" /> : <PinOff className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setMapSize(prev => Math.max(30, prev - 5))}
            aria-label="Shrink map section"
          >
            <Shrink className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setMapSize(prev => Math.min(78, prev + 5))}
            aria-label="Expand map section"
          >
            <RectangleHorizontal className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={toggleMapFullscreen}
            aria-label={isMapFullscreen ? 'Exit map fullscreen' : 'Open map fullscreen'}
          >
            {isMapFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setGridVisible(prev => !prev)}
            aria-label={gridVisible ? 'Hide panel grid' : 'Show panel grid'}
          >
            <LayoutPanelTop className="h-3.5 w-3.5" />
          </Button>
          {desktopRuntimeFlagEnabled && (
            <span
              className={`h-7 px-2 rounded border border-border text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1 ${
                runtimeInfo?.available ? 'text-success bg-success/10' : 'text-muted-foreground bg-muted/20'
              }`}
              aria-label="Desktop runtime preparation status"
            >
              <Cpu className="h-3.5 w-3.5" />
              {runtimeInfo?.available ? runtimeInfo.kind : 'browser'}
            </span>
          )}
        </div>
      </header>

      <div ref={mapContainerRef} className="flex-1 min-h-0">
        {renderMapEngine()}
      </div>
    </section>
  );

  const panelArea = (
    <section className="h-full min-h-0">
      <PanelLayoutManager variant={variant} />
    </section>
  );

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden grid-bg ops-shell">
      <div className="scanline-overlay" />

      <TopBar
        onToggleSidebar={() => setGridVisible(prev => !prev)}
        activeRegion={activeRegion}
        onRegionChange={setActiveRegion}
        variant={variant}
        variantOptions={variantDefinitions.map(def => ({ id: def.id, label: def.label }))}
        onVariantChange={(nextVariant) => {
          setVariant(nextVariant);
        }}
      />

      <AlertTicker />

      {connectivityState !== 'live' && (
        <div
          className={`h-7 px-3 border-b flex items-center justify-between text-[10px] uppercase tracking-wider font-bold ${
            connectivityState === 'cached'
              ? 'border-warning/30 bg-warning/10 text-warning'
              : 'border-danger/30 bg-danger/10 text-danger'
          }`}
        >
          <span>{connectivityState === 'cached' ? 'Using cached payload' : 'Live feed unavailable'}</span>
          <span>{typeof navigator !== 'undefined' && navigator.onLine ? 'online degraded' : 'offline'}</span>
        </div>
      )}

      {!!error && connectivityState !== 'live' && (
        <div className="h-7 px-3 border-b border-border bg-muted/40 text-[10px] text-muted-foreground flex items-center gap-1.5">
          <CircleDot className="h-3 w-3" />
          {error}
        </div>
      )}

      <main className="flex-1 min-h-0 p-2 md:p-3">
        {isMobileLayout ? (
          <div className="h-full min-h-0 flex flex-col gap-2">
            <div className="h-full min-h-0 overflow-hidden">
              {mobileView === 'map' || !gridVisible ? mapArea : panelArea}
            </div>
            {gridVisible && (
              <nav className="h-11 rounded-md border border-border bg-card/90 grid grid-cols-2 overflow-hidden">
                <button
                  onClick={() => setMobileView('map')}
                  className={`text-[11px] uppercase tracking-wider font-bold ${mobileView === 'map' ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}
                >
                  Map
                </button>
                <button
                  onClick={() => setMobileView('panels')}
                  className={`text-[11px] uppercase tracking-wider font-bold ${mobileView === 'panels' ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}
                >
                  Panels
                </button>
              </nav>
            )}
          </div>
        ) : gridVisible ? (
          mapPinned ? (
            <div className={`h-full min-h-0 flex ${sideBySideLayout ? 'flex-row gap-2' : 'flex-col gap-2'}`}>
              <div className={`${sideBySideLayout ? 'w-[60%]' : ''}`} style={sideBySideLayout ? undefined : { height: `${mapSize}%` }}>
                {mapArea}
              </div>
              <div className={`${sideBySideLayout ? 'w-[40%]' : ''} flex-1 min-h-0`}>
                {panelArea}
              </div>
            </div>
          ) : (
            <ResizablePanelGroup direction={sideBySideLayout ? 'horizontal' : 'vertical'} className="h-full rounded-md overflow-hidden">
              <ResizablePanel
                defaultSize={mapSize}
                minSize={sideBySideLayout ? 35 : 25}
                maxSize={sideBySideLayout ? 80 : 80}
                onResize={nextSize => setMapSize(Math.round(nextSize))}
              >
                <div className="h-full min-h-0">{mapArea}</div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={100 - mapSize} minSize={20}>
                <div className="h-full min-h-0">{panelArea}</div>
              </ResizablePanel>
            </ResizablePanelGroup>
          )
        ) : (
          <div className="h-full min-h-0">{mapArea}</div>
        )}
      </main>

      <StatusBar />
    </div>
  );
}
