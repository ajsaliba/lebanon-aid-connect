# Operations Shell Migration Notes

## Rollout Control

- The new shell is gated behind `VITE_ENABLE_OPERATIONS_SHELL`.
- Legacy shell remains the default fallback when the flag is off.
- 3D globe remains gated behind `VITE_ENABLE_3D_GLOBE`.
- Desktop runtime preparation remains gated behind `VITE_ENABLE_DESKTOP_RUNTIME_PREP`.

## Preserved Functionality

- Existing header interactions remain in place: notifications, language, source filters, auth, export, command palette, region switch, fullscreen.
- Existing map layer and time filters remain in the 2D map engine.
- Existing left-side feeds/intel/resources/streams internals are unchanged and are wrapped into grid panels.
- Existing right-side aid workflows remain unchanged and are wrapped into the panel grid.
- Existing Supabase-backed data ingestion and realtime feed flows remain active.

## New Architecture Added

- Variant resolver with per-variant panel defaults and map presets.
- Map-first shell with 2D/3D switch, pinning, resize, and fullscreen controls.
- Draggable/resizable panel grid with persisted enabled state, order, and spans.
- Two-tier bootstrap hydration (`fast` cache, `slow` reconciliation, `ready` state).
- Connectivity and freshness states (`live`, `cached`, `unavailable`) with explicit UX banners.
- Correlation engine with domain adapters for military, escalation, economic, and disaster signals.
- Worker-based ML services for summary, sentiment, embeddings, and semantic search.
- Lazy-loaded locale modules and stronger RTL direction handling.

## Scaffolded / Fallback Paths

- 3D map mode uses a feature-flagged preview adapter with a shared layer contract while the native globe engine remains phase-gated.
- ML and correlation run locally with deterministic adapter fallbacks when backend AI services are unavailable.
- Desktop runtime prep includes typed adapters and browser fallback so no backend/runtime dependency blocks rollout.
