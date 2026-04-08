# WorldMonitor Parity — Task List

Features present in `koala73/worldmonitor` that are not yet fully live in Cedars-Alert.
The WorldMonitor submodule is checked in at `/World Monitor` but currently uninitialized.

**Status key:** DONE = merged and working, PARTIAL = scaffolded or partly wired, TODO = not started.

**Naming convention:** camelCase for TypeScript app/domain models and APIs; snake_case only for SQL columns and ingestion telemetry fields.

---

## Current State Summary

- **93 panel components** exist. Of these, **46 still import static mock data** directly (`extendedMockData`, `newFeaturesMockData`, `newFeaturesMockData2`, `worldMonitorMockData`, `mockData`).
- **24 React Query call sites** and several live-data hooks (`useNewsFeedContext`, `useMlIntel`, `useIntelSignals`, etc.) already serve real data to a subset of panels.
- The **correlation engine**, **ML worker**, **variant resolver**, and **operations shell** are implemented and active.
- The map layer contract covers **19 layers**; the 3D globe renders via `MapGlobe3D.tsx`.
- **9 Supabase edge functions** handle classification, GDELT fetch, geocoding, aid matching, RSS, alerts, sentiment, translation, and world briefs.
- i18n ships **5 full locales** (AR, EN, DE, ES, FR) and **4 stubs** (IT, PT, RU, TR).

---

## What Must Change (Inventory)

### Frontend

- Replace the 46 direct mock-data imports with domain hooks/services.
- Add live-data hooks in `src/hooks` for humanitarian, finance, infrastructure, and intelligence streams that are still missing.
- Extend map layer contract and rendering for any additional WorldMonitor layers beyond the current 19.
- Add data-freshness, feed-health, and degraded-mode warnings to panels that lack them.

### Data and Backend

- Add normalized Supabase schemas for: facilities, displacement/refugee flows, routes/hazards, market quotes, macro indicators, chokepoints, outages, strategic assets, protests, feed-health telemetry.
- Add ingestion pipelines (scheduled + on-demand) for external humanitarian, financial, infrastructure, and intelligence sources.
- Add/extend edge functions for: quote aggregation, indicator/risk computation, route safety scoring, corroborated event fusion, data freshness reporting.
- Implement deduplication, validation, and confidence scoring at ingestion time.

### Platform / Runtime

- Complete desktop runtime from probe-only to packaged Tauri app (no `src-tauri` directory exists yet).
- Expand i18n from 5 full + 4 stub locales to broader coverage with translation QA checks.

### Quality and Operations

- Add contract tests for new domain APIs and ingestion transformations.
- Add strict input/output validation at all third-party feed boundaries.
- Add source-health telemetry and alerting (heartbeat, staleness, failure-rate).
- Remove mock datasets from production panel data paths; keep them only as test fixtures.

---

## Humanitarian

### 1. Live displacement / refugee intelligence — TODO

Replace static displacement/refugee datasets with live humanitarian feeds.

- Add server-side ingestion for displacement/IDP/refugee sources (OCHA/UNHCR-compatible).
- Persist normalized flows in Supabase with region/time indexes.
- Refactor `DisplacementPanel` and `RefugeeFlowPanel` to query live tables via React Query.
- Add freshness metadata and degraded-state UI when upstreams fail.

### 2. Humanitarian facilities with live status — TODO

Replace mock medical/shelter/food-water/fuel facilities with live status pipelines.

- Create normalized facility schemas (type, status, capacity, lastUpdated, sourceConfidence).
- Add ingest endpoints with deduplication by geohash/name similarity.
- Update `MedicalResourcePanel`, `PharmacyBloodPanel`, `ShelterPanel`, `FoodWaterPanel`, `FuelStationPanel` to consume live data.
- Add source attribution and conflict-resolution rules for overlapping reports.

### 3. Dynamic route safety scoring — TODO

Convert `SafeRoutePanel` from static routes to risk-aware routing.

- Build routing backend using road graph + hazard overlays (conflict, closures, weather, infrastructure outages).
- Score candidate paths by exposure risk + travel feasibility.
- Expose an edge function returning top routes with rationale.
- Update map rendering to display route confidence and stale-data warnings.

### 4. Operational early warning — TODO

Replace static `EarlyWarningPanel` events with event-stream detection.

- Introduce multi-source event ingestion (news + sensor/crowd reports).
- Add event correlation rules (time/space/source confidence).
- Store confidence tiers and status transitions (unconfirmed → confirmed → resolved).
- Render timeline and alert severity from live stream.

### 5. Humanitarian accountability / delivery proof chain — TODO

Upgrade aid accountability from static entries to auditable delivery lifecycle.

- Add signed delivery records (request → match → dispatch → delivered).
- Attach media proof and geotime stamps in Supabase Storage.
- Add reviewer workflows and exception states (failed, disputed, partial).
- Update `AidAccountabilityPanel` and `AidMatchPanel` to show verifiable chain-of-custody.

---

## Financial

### 6. Market watchlist and multi-asset live quotes — TODO

Add customizable market watchlist (equities, indices, commodities, crypto).

- Add symbol watchlist settings (localStorage + optional profile sync).
- Implement server-side quote fetchers with provider fallback and cache TTL.
- Build normalized quote API (price, change, volume, timestamp, provider).
- Replace static `EconomicToolsPanel` data with live market cards.

### 7. Market Radar composite signal engine — TODO

Implement 7-signal macro risk model (BUY/CASH verdict).

- Build indicator service for liquidity/flow/regime/trend/hashrate/mining-cost/sentiment.
- Persist intermediate metrics and confidence for explainability.
- Add deterministic scoring thresholds with unknown-signal handling.
- Create radar panel UI with per-signal status and final verdict.

### 8. Stablecoin peg monitoring — TODO

Add real-time stablecoin peg/depeg monitoring (USDT/USDC/DAI/etc.).

- Fetch spot prices from allowlisted crypto APIs with schema validation, rate limiting, and server-side secret handling.
- Compute deviation bands and panel-level health status.
- Add alerting for threshold breaches and persistent incident history.
- Expose map/panel badges for active depeg events.

### 9. BTC ETF flow estimation — TODO

Implement ETF flow estimation panel from public market signals.

- Ingest ETF OHLCV for tracked symbols.
- Compute directional flow proxy (price delta + relative volume model).
- Cache results and publish trend deltas.
- Add panel table + sparklines + methodology disclosure.

### 10. Oil and energy analytics — TODO

Replace static energy datasets with real EIA/FRED-style feeds.

- Ingest WTI/Brent, production, inventory, macro indicators.
- Store time-series optimized for chart queries.
- Add trend classifiers (rising/falling/stable).
- Refactor `EnergyPanel` to live queries with source timestamps.

### 11. Central bank and trade policy intelligence — TODO

Add global policy-rate / trade-restriction panels.

- Add services for policy rates, FX proxies, credit metrics, trade restrictions.
- Implement per-source circuit breakers and independent caches.
- Add panel tabs, sort/filter, and staleness indicators.
- Surface feed health in a global intelligence-gaps widget.

### 12. Gulf FDI / strategic investment mapping — TODO

Add investment intelligence dataset and geospatial visualization.

- Create canonical investment schema (entity, sector, value, status, location, year).
- Ingest curated dataset with source references.
- Render map bubbles by investment size/status.
- Add filtering by sector/entity/country with map-to-table navigation.

---

## Infrastructure and Logistics

### 13. Shipping and chokepoint disruption intelligence — TODO

Add AIS/chokepoint monitoring.

- Add maritime feed ingestion (AIS + navigational warnings).
- Compute chokepoint disruption scores and confidence.
- Render maritime layer and chokepoint panel with alert levels.
- Integrate into infrastructure cascade scoring.

### 14. Undersea cable and pipeline map layers — TODO

Add strategic infrastructure layers.

- Import canonical geospatial datasets for cables/pipelines.
- Normalize geometry + metadata for tiled rendering.
- Add toggles, legends, and impact summaries.
- Connect outages/incidents to affected regions in the right panel.

### 15. Trade routes and waterway overlays — TODO

Add strategic trade-route overlay and chokepoint arcs.

- Build route segment datastore with chokepoint intersections.
- Render directional arcs with congestion/risk color coding.
- Add routing summaries by commodity/route class.
- Link route risk into supply chain forecasting.

### 16. Internet outage and telecom disruption intelligence — TODO

Move `ConnectivityPanel` from static data to live outage monitoring.

- Integrate network outage providers and normalize severity.
- Add temporal aggregation for incident trends.
- Update panel/map layers with live outage polygons/points.
- Add source reliability weights for conflicting reports.

### 17. Aviation operations intelligence — TODO

Add airport delay/closure and aviation risk panel.

- Ingest airport operational feeds (delays, ground stops, closures).
- Build airport status model with severity thresholds.
- Add aviation panel tabs and map markers.
- Correlate disruptions with conflict/weather signals.

---

## Intelligence and Security

### 18. Expand map intelligence layers — PARTIAL

The map layer contract already defines 19 layers. Remaining work:

- Audit WorldMonitor layer set for any layers not yet covered.
- Add ingestion + normalization for each missing layer.
- Implement per-layer time filtering and clustering rules.
- Add desktop/mobile default layer presets by mission type.

### 19. APT / cyber actor layer — TODO

Add cyber threat actor geospatial intelligence.

- Create actor schema (group, sponsor, TTP tags, region, confidence).
- Ingest curated actor metadata + active campaign events.
- Render map markers and actor detail panel.
- Tie actor events into strategic risk and correlation engines.

### 20. Military / nuclear / space strategic asset layers — TODO

Add strategic military infrastructure layers.

- Define schemas for bases, nuclear sites, launch facilities.
- Add source provenance and verification status.
- Render layered markers with category-specific symbology.
- Link strategic assets to scenario alerts and country risk.

### 21. Country brief generation — PARTIAL

The ML worker (`src/workers/ml.worker.ts`) and `useMlIntel` hook already run summarization and risk profiling locally. Remaining work:

- Build structured prompt/summary pipeline over normalized news + indicators.
- Enforce citation extraction and confidence scoring in output schema.
- Cache generated briefs by country/time bucket.
- Add guardrails for stale/missing-source fallback.

### 22. Multi-source protest / social unrest corroboration — TODO

Upgrade `ProtestsPanel` from mock stream to corroborated live event model.

- Ingest unrest events from multiple upstreams.
- Fuse events by geospatial/time overlap and severity normalization.
- Add corroboration score and source count per event.
- Render severity-based clustering and timeline filters.

---

## Platform / Architecture

### 23. Replace mock-data architecture with production data contracts — PARTIAL

The correlation engine and several hooks already serve live data. 46 panels still import mocks directly. Remaining work:

- Introduce service layer per domain (humanitarian, markets, infra, intel).
- Migrate remaining 46 panels to React Query hooks backed by edge functions.
- Keep mock adapters only for test/dev fixtures.
- Add contract tests for all domain APIs.

### 24. Variant system — PARTIAL

A variant resolver exists in `src/lib/variantSystem.ts` with four variants (`humanitarian`, `intel`, `operations`, `recovery`), each defining panel defaults, map presets, density, and mobile view. Remaining work:

- Wire `VITE_VARIANT` build-time switch if distinct deployment artifacts are needed.
- Add variant-specific build/dev scripts in `package.json`.
- Ensure routing/SEO/branding separation per variant.
- Evaluate whether WorldMonitor's variant set (tech/finance/commodity/happy) maps onto or extends the current four.

### 25. Flat WebGL map engine alongside globe view — TODO

Implement dual-engine map support (3D globe + flat WebGL map).

- Introduce deck.gl + MapLibre rendering path.
- Create shared layer adapters so each data layer renders in both engines.
- Add engine toggle with persisted preference.
- Benchmark layer performance under high marker counts.

### 26. Desktop runtime completion — PARTIAL

Desktop probe exists (`src/features/runtime/desktopRuntimePrep.ts`) with Tauri/Electron detection and browser fallback. Remaining work:

- Add `src-tauri` project and secure IPC command surface.
- Implement desktop-side data/cache services and update channel.
- Add desktop build scripts and signing pipeline.
- Add desktop integration tests for runtime APIs.

### 27. Internationalization expansion — PARTIAL

9 locale files ship today; 5 are fully translated (AR, EN, DE, ES, FR) and 4 are stubs (IT, PT, RU, TR). Remaining work:

- Complete stub locales with full translations.
- Add ICU-compatible message keys where missing.
- Add translation validation and missing-key CI checks.
- Add language-specific feed/source preferences.
- Add font fallbacks per script group.

### 28. Data freshness / health / intelligence-gap framework — TODO

Add centralized source health tracking and stale-feed warnings.

- Add feed heartbeat registry columns (`last_success`, `last_attempt`, `error_count`, `time_to_live`) in Supabase.
- Map to camelCase app models (`lastSuccess`, `lastAttempt`, `errorCount`, `timeToLive`).
- Add panel-level health badges and global gap summary.
- Add alerting for prolonged staleness.
- Ensure all ingestion pipelines publish health telemetry.

---

## Suggested Delivery Order

1. **Foundation:** 23 (mock removal), 28 (health framework), 18 (map layers)
2. **Humanitarian live data:** 1, 2, 3, 4, 5
3. **Financial intelligence:** 6, 7, 8, 9, 10, 11, 12
4. **Infrastructure / logistics:** 13, 14, 15, 16, 17
5. **Intelligence / security:** 19, 20, 21, 22
6. **Platform parity:** 24, 25, 26, 27
