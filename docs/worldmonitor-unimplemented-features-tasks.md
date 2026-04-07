# Cedars-Alert → WorldMonitor Unimplemented Features Task List

This task list captures features that exist in `koala73/worldmonitor` but are not fully implemented in Cedars-Alert (currently mock/stubbed or missing).

Evidence in Cedars-Alert:
- Many panels are powered by static mock datasets (`src/data/extendedMockData.ts`, `src/data/newFeaturesMockData.ts`, `src/data/newFeaturesMockData2.ts`, `src/data/worldMonitorMockData.ts`).
- Multiple panel components import mock data directly instead of live upstreams.
- Current platform scope lacks multi-variant deployment, flat WebGL map engine, and production finance intelligence stack present in worldmonitor.

Naming convention note:
- Use **camelCase** for TypeScript app/domain models and APIs.
- Use **snake_case** only for SQL/storage columns and ingestion telemetry fields.

## What must be changed/implemented (explicit inventory)

### Frontend (must change)
- Replace direct mock-data imports in panels under `src/components` with domain hooks/services.
- Add new live-data hooks in `src/hooks` for humanitarian, finance, infrastructure, and intelligence streams.
- Extend map layer contracts and rendering paths:
  - `src/features/map/mapLayerContract.ts`
  - `src/components/CrisisMap.tsx`
  - `src/features/map/MapGlobe3D.tsx`
- Add/upgrade UI for data freshness, feed health, and degraded-mode warnings across key panels.

### Data and backend (must implement)
- Add normalized Supabase schemas for:
  - facilities, displacement/refugee flows, routes/hazards, market quotes, macro indicators, chokepoints, outages, strategic assets, protests, feed health telemetry.
- Add ingestion pipelines (scheduled and on-demand) for external humanitarian/financial/infrastructure/intelligence sources.
- Add/extend edge functions in `supabase/functions` for:
  - quote aggregation
  - indicator/risk computation
  - route safety scoring
  - corroborated event fusion
  - data freshness/status reporting
- Implement deduplication, validation, and confidence scoring at ingestion time.

### Platform/runtime (must implement)
- Add true deployment variant support (`tech`, `finance`, `commodity`, `happy`) via runtime/build config and variant manifests.
- Implement dual map engine support (3D globe + flat WebGL map).
- Complete desktop runtime from probe-only to full packaged runtime (Tauri project, secure IPC, desktop build pipeline).
- Expand i18n from current 9-language set to broader multilingual parity and add translation QA checks.

### Quality, security, and operations (must implement)
- Add contract tests for new domain APIs and ingestion transformations.
- Add strict input/output validation and sanitization for all third-party feed boundaries.
- Add source health telemetry and alerting (heartbeat, staleness, failure-rate monitoring).
- Keep mock datasets only as test fixtures; remove them from production panel data paths.

---

## Humanitarian

### 1) Live displacement/refugee intelligence (replace mock displacement panels)
- **What needs to be done:** Replace static displacement/refugee datasets with live humanitarian feeds comparable to worldmonitor’s displacement tracking.
- **How to implement:**
  - Add server-side ingestion jobs for displacement/IDP/refugee feeds (OCHA/UNHCR-compatible sources).
  - Persist normalized flows in Supabase with region/time indexes.
  - Refactor `DisplacementPanel` and `RefugeeFlowPanel` to query live tables via React Query.
  - Add freshness metadata and degraded-state UI when upstreams fail.

### 2) Humanitarian facilities with live operational status
- **What needs to be done:** Replace mock medical/shelter/food-water/fuel facilities with live status pipelines.
- **How to implement:**
  - Create normalized facility schemas (type, status, capacity, lastUpdated, sourceConfidence) and enforce camelCase for app/domain models.
  - Add ingest endpoints + deduplication by geohash/name similarity.
  - Update `MedicalResourcePanel`, `PharmacyBloodPanel`, `ShelterPanel`, `FoodWaterPanel`, `FuelStationPanel` to consume live data.
  - Add source attribution and conflict-resolution rules for overlapping reports.

### 3) Real humanitarian route safety scoring
- **What needs to be done:** Convert `SafeRoutePanel` from static routes to dynamic risk-aware routing.
- **How to implement:**
  - Build routing backend using road graph + hazard overlays (conflict, closures, weather, infrastructure outages).
  - Score candidate paths by exposure risk + travel feasibility.
  - Expose an edge function returning top routes with rationale.
  - Update map rendering to display route confidence and stale-data warnings.

### 4) Operational humanitarian early warning
- **What needs to be done:** Replace static `EarlyWarningPanel` events with event-stream detection and corroboration.
- **How to implement:**
  - Introduce multi-source event ingestion (news + sensor/crowd reports).
  - Add event correlation rules (time/space/source confidence).
  - Store confidence tiers and status transitions (unconfirmed/confirmed/resolved).
  - Render timeline and alert severity from live stream.

### 5) Humanitarian accountability + delivery proof chain
- **What needs to be done:** Upgrade aid accountability from static entries to auditable delivery lifecycle.
- **How to implement:**
  - Add signed delivery records (request → match → dispatch → delivered).
  - Attach media proof and geotime stamps in Supabase Storage.
  - Add reviewer workflows and exception states (failed, disputed, partial).
  - Update `AidAccountabilityPanel` and `AidMatchPanel` to show verifiable chain-of-custody.

---

## Financial

### 6) Market watchlist and multi-asset live quotes
- **What needs to be done:** Add worldmonitor-style customizable market watchlist (equities, indices, commodities, crypto).
- **How to implement:**
  - Add symbol watchlist settings (persisted in localStorage + optional profile sync).
  - Implement server-side quote fetchers with provider fallback and cache TTL.
  - Build normalized quote API (price, change, volume, timestamp, provider).
  - Replace static `EconomicToolsPanel` data with live market cards.

### 7) Market Radar composite signal engine
- **What needs to be done:** Implement worldmonitor-style 7-signal macro risk model (BUY/CASH verdict).
- **How to implement:**
  - Build indicator service for liquidity/flow/regime/trend/hashrate/mining-cost/sentiment.
  - Persist intermediate metrics and confidence for explainability.
  - Add deterministic scoring thresholds with unknown-signal handling.
  - Create radar panel UI with per-signal status and final verdict.

### 8) Stablecoin peg monitoring
- **What needs to be done:** Add real-time stablecoin peg/depeg monitoring (USDT/USDC/DAI/etc.).
- **How to implement:**
  - Fetch spot prices from supported crypto APIs with strict validation:
    - allowlisted/sanitized coin IDs
    - response schema validation
    - malformed payload rejection
    - injection-safe query handling
    - rate limiting
    - server-side secret handling
  - Compute deviation bands and panel-level health status.
  - Add alerting for threshold breaches and persistent incident history.
  - Expose map/panel badges for active depeg events.

### 9) BTC ETF flow estimation
- **What needs to be done:** Implement ETF flow estimation panel from public market signals.
- **How to implement:**
  - Ingest ETF OHLCV for tracked symbols.
  - Compute directional flow proxy (price delta + relative volume model).
  - Cache results and publish trend deltas.
  - Add panel table + sparklines + methodology disclosure.

### 10) Oil & energy analytics with real upstreams
- **What needs to be done:** Replace static energy datasets with real EIA/FRED-style feeds.
- **How to implement:**
  - Build ingestion for WTI/Brent, production, inventory, macro indicators.
  - Store time-series in dedicated tables optimized for chart queries.
  - Add trend classifiers (rising/falling/stable thresholds).
  - Refactor `EnergyPanel` to live queries with source timestamps.

### 11) BIS central bank + trade policy intelligence (WTO/Treasury-like)
- **What needs to be done:** Add global policy-rate/trade-restriction panels that worldmonitor already provides.
- **How to implement:**
  - Add services for policy rates, FX competitiveness proxies, credit metrics, and trade restrictions.
  - Implement per-source circuit breakers + independent caches.
  - Add panel tabs, sort/filter, and staleness indicators.
  - Track feed health in a global “intelligence gaps” status widget.

### 12) Gulf FDI / strategic investment mapping
- **What needs to be done:** Add investment intelligence dataset and geospatial visualization.
- **How to implement:**
  - Create canonical investment schema (entity, sector, value, status, location, year).
  - Ingest curated dataset and maintain source references.
  - Render map bubbles by investment size/status.
  - Add filtering by sector/entity/country with map-to-table navigation.

---

## Infrastructure & Logistics

### 13) Global shipping and chokepoint disruption intelligence
- **What needs to be done:** Add worldmonitor-class AIS/chokepoint monitoring (currently absent).
- **How to implement:**
  - Add maritime feed ingestion (AIS + navigational warnings).
  - Compute chokepoint disruption scores and confidence.
  - Render maritime layer and chokepoint panel with alert levels.
  - Integrate outputs into infrastructure cascade scoring.

### 14) Undersea cable + pipeline map layers
- **What needs to be done:** Add missing strategic infrastructure layers.
- **How to implement:**
  - Import canonical geospatial datasets for cables/pipelines.
  - Normalize geometry + metadata for fast tiled rendering.
  - Add toggles, legends, and impact summaries.
  - Connect outages/incidents to affected regions in the right panel.

### 15) Trade routes and waterway overlays
- **What needs to be done:** Add worldmonitor-style strategic trade-route overlay and chokepoint arcs.
- **How to implement:**
  - Build route segment datastore with chokepoint intersections.
  - Render directional arcs with congestion/risk color coding.
  - Add routing summaries by commodity/route class.
  - Link route risk into supply chain forecasting.

### 16) Internet outage + telecom disruption intelligence
- **What needs to be done:** Move `ConnectivityPanel` from static data to live outage monitoring.
- **How to implement:**
  - Integrate network outage providers and normalize outage severity.
  - Add temporal aggregation for incident trends.
  - Update panel/map layers with live outage polygons/points.
  - Add source reliability weights for conflicting outage reports.

### 17) Aviation operations intelligence
- **What needs to be done:** Add worldmonitor-style airport delay/closure and aviation risk panel.
- **How to implement:**
  - Ingest airport operational feeds (delays, ground stops, closure notices).
  - Build airport status model with severity thresholds.
  - Add aviation panel tabs and map markers.
  - Correlate disruptions with conflict/weather signals.

---

## Intelligence & Security

### 18) Expand map intelligence layers to worldmonitor parity
- **What needs to be done:** Raise map layer coverage from current limited set to worldmonitor-level breadth.
- **How to implement:**
  - Extend map-layer contract and UI grouping for additional strategic layers.
  - Add ingestion + normalization for each new layer.
  - Implement per-layer time filtering and clustering rules.
  - Add desktop/mobile default layer presets by mission type.

### 19) APT/cyber actor layer and attribution feed
- **What needs to be done:** Add missing cyber threat actor geospatial intelligence.
- **How to implement:**
  - Create actor schema (group, sponsor, TTP tags, region, confidence).
  - Ingest curated actor metadata + active campaign events.
  - Render map markers and actor detail panel.
  - Tie actor events into strategic risk and correlation engines.

### 20) Military/nuclear/space strategic asset layers
- **What needs to be done:** Add strategic military infrastructure layers present in worldmonitor.
- **How to implement:**
  - Define standardized schemas for bases, nuclear sites, launch facilities.
  - Add source provenance and verification status.
  - Render layered markers with category-specific symbology.
  - Link strategic assets to scenario alerts and country risk.

### 21) Country brief generation with explainable AI outputs
- **What needs to be done:** Add worldmonitor-style AI country briefs with confidence and source attribution.
- **How to implement:**
  - Build prompt/summary pipeline over normalized news + structured indicators.
  - Enforce citation extraction and confidence scoring in output schema.
  - Cache generated briefs by country/time bucket.
  - Add guardrails for stale/missing-source fallback behavior.

### 22) Multi-source protest/social unrest corroboration
- **What needs to be done:** Upgrade `ProtestsPanel` from mock stream to corroborated live event model.
- **How to implement:**
  - Ingest unrest events from multiple upstreams.
  - Fuse events by geospatial/time overlap and severity normalization.
  - Add corroboration score and source count to each event.
  - Render severity-based clustering and timeline filters.

---

## Platform / Architecture

### 23) Replace mock-data architecture with production data contracts
- **What needs to be done:** Remove widespread direct mock imports from panel components.
- **How to implement:**
  - Introduce service layer per domain (humanitarian, markets, infra, intel).
  - Migrate components to React Query hooks backed by edge functions.
  - Keep mock adapters only for test/dev fixtures.
  - Add contract tests for all domain APIs.

### 24) Add worldmonitor-style variant system (tech/finance/commodity/happy)
- **What needs to be done:** Extend current shell variants to deployment/runtime variants.
- **How to implement:**
  - Add `VITE_VARIANT` runtime switch and variant manifests.
  - Define per-variant panel defaults, layer defaults, and data scopes.
  - Add variant-specific build/dev scripts in `package.json`.
  - Ensure routing/SEO/branding separation for each variant.

### 25) Add flat WebGL map engine alongside globe view
- **What needs to be done:** Implement dual-engine map support (3D globe + flat WebGL map).
- **How to implement:**
  - Introduce deck.gl + MapLibre rendering path.
  - Create shared layer adapters so each data layer renders in both engines.
  - Add engine toggle with persisted preference.
  - Benchmark and optimize layer performance under high marker counts.

### 26) Desktop runtime completion (real Tauri app, not probe-only)
- **What needs to be done:** Complete desktop packaging/runtime capabilities beyond current environment probe.
- **How to implement:**
  - Add `src-tauri` project and secure IPC command surface.
  - Implement desktop-side data/cache services and update channel.
  - Add desktop build scripts and signing pipeline.
  - Add desktop-specific integration tests for runtime APIs.

### 27) Internationalization expansion to worldmonitor coverage
- **What needs to be done:** Expand from current 9-language set to broad multilingual coverage with quality controls.
- **How to implement:**
  - Add locale packs + ICU-compatible message keys.
  - Add translation validation and missing-key CI checks.
  - Add language-specific feed/source preferences.
  - Add RTL and font fallbacks per script group.

### 28) Data freshness, health, and intelligence-gap framework
- **What needs to be done:** Add centralized source health tracking and stale-feed warnings.
- **How to implement:**
  - Add feed heartbeat registry storage table columns (`last_success`, `last_attempt`, `error_count`, `time_to_live`).
  - Add camelCase appModel mappings for heartbeat fields (`lastSuccess`, `lastAttempt`, `errorCount`, `timeToLive`).
  - Add panel-level health badges and global gap summary.
  - Add alerting for prolonged staleness.
  - Ensure all ingestion pipelines publish health telemetry.

---

## Suggested Delivery Order

1. **Foundation first:** Task 23, Task 28, Task 18  
2. **Humanitarian live data migration:** Task 1, Task 2, Task 3, Task 4, Task 5  
3. **Financial intelligence parity:** Task 6, Task 7, Task 8, Task 9, Task 10, Task 11, Task 12  
4. **Infrastructure/global logistics:** Task 13, Task 14, Task 15, Task 16, Task 17  
5. **Advanced intelligence/security:** Task 19, Task 20, Task 21, Task 22  
6. **Platform parity:** Task 24, Task 25, Task 26, Task 27
