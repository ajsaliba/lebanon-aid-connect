# Operations Shell Migration Notes

## Feature Flags

| Flag | Key | Default |
|---|---|---|
| Operations shell | `VITE_ENABLE_OPERATIONS_SHELL` | **enabled** |
| 3D globe | `VITE_ENABLE_3D_GLOBE` | **enabled** |
| Desktop runtime prep | `VITE_ENABLE_DESKTOP_RUNTIME_PREP` | disabled |

All flags support localStorage overrides via `src/config/featureFlags.ts`.
When the operations shell flag is explicitly disabled the legacy shell loads as a fallback.

## Preserved Functionality

Everything below carried over from the legacy shell unchanged:

- **Header**: notifications, language switcher, source filters, auth dialog, CSV/JSON export, command palette, region switch, fullscreen/sound toggles.
- **Map**: 2D Leaflet engine with 19 layer toggles and time-range filters.
- **Left-side panels**: feed, intel, resources, live streams — internals untouched, wrapped into the panel grid.
- **Right-side aid workflows**: SOS, shelters, housing, donations, aid matching, medical, volunteer, family, jobs — internals untouched, wrapped into the panel grid.
- **Data layer**: Supabase-backed article ingestion, realtime feeds, and localStorage UI preferences.

## New Architecture

- **Variant resolver** (`src/lib/variantSystem.ts`) with four variants — `humanitarian`, `intel`, `operations`, `recovery` — each defining panel defaults, map presets, density, and mobile view.
- **Map-first shell** (`OperationsShell.tsx`) with 2D/3D toggle, panel pinning, drag-resize, and fullscreen.
- **Draggable/resizable panel grid** (`PanelLayoutManager.tsx`) on a 12-column CSS grid with persisted enabled state, order, and spans.
- **Two-tier bootstrap hydration** (`fast` cache → `slow` reconciliation → `ready`).
- **Connectivity banners** for `live`, `cached`, and `unavailable` states.
- **Correlation engine** (`src/lib/correlation/engine.ts`) with domain adapters for military, escalation, economic, and disaster signals.
- **Worker-based ML services** (`src/workers/ml.worker.ts`, `src/lib/ml/workerManager.ts`) for summarize, sentiment, embeddings, semantic search, and risk profiling.
- **Lazy-loaded locale modules** with RTL direction handling (5 full locales, 4 stubs).

## Scaffolded / Fallback Paths

- 3D globe (`MapGlobe3D.tsx`) shares the layer contract with the 2D engine; toggled at runtime via the feature flag.
- ML and correlation run locally with deterministic adapter fallbacks when backend AI services are unavailable.
- Desktop runtime prep (`src/features/runtime/desktopRuntimePrep.ts`) probes for Tauri/Electron via `window.__TAURI__` and falls back to browser capabilities. No native shell (src-tauri) exists yet.
