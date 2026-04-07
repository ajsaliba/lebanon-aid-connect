# World Monitor

**Real-time global intelligence dashboard** — AI-powered news aggregation, geopolitical monitoring, and infrastructure tracking in a unified situational awareness interface.

<a href="https://github.com/ajsaliba/Cedars-Alert/stargazers"><img src="https://img.shields.io/github/stars/ajsaliba/Cedars-Alert?style=social"></a>
<a href="https://github.com/ajsaliba/Cedars-Alert/network/members"><img src="https://img.shields.io/github/forks/ajsaliba/Cedars-Alert?style=social"></a>
<a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat&amp;logo=typescript&amp;logoColor=white"></a>
<a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat&amp;logo=supabase&amp;logoColor=white"></a>
<a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18-61DAFB?style=flat&amp;logo=react&amp;logoColor=black"></a>
<a href="https://opensource.org/license/mit"><img src="https://img.shields.io/badge/License-MIT-blue.svg"></a>
<a href="https://github.com/ajsaliba/Cedars-Alert/commits/main"><img src="https://img.shields.io/github/last-commit/ajsaliba/Cedars-Alert"></a>

<p>
  <a href="https://github.com/ajsaliba/Cedars-Alert"><img src="https://img.shields.io/badge/Repository-Cedars--Alert-2563eb?style=for-the-badge&amp;logo=github&amp;logoColor=white"></a>&nbsp;
  <a href="https://github.com/ajsaliba/Cedars-Alert/issues"><img src="https://img.shields.io/badge/Issues-Tracker-ef4444?style=for-the-badge&amp;logo=github&amp;logoColor=white"></a>&nbsp;
  <a href="https://github.com/ajsaliba/Cedars-Alert/actions"><img src="https://img.shields.io/badge/CI-GitHub_Actions-0891b2?style=for-the-badge&amp;logo=githubactions&amp;logoColor=white"></a>
</p>

<p>
  <a href="https://github.com/ajsaliba/Cedars-Alert"><strong>Repository</strong></a> &nbsp;·&nbsp;
  <a href="https://github.com/ajsaliba/Cedars-Alert/issues"><strong>Issues</strong></a> &nbsp;·&nbsp;
  <a href="https://github.com/ajsaliba/Cedars-Alert/blob/main/README.md"><strong>Documentation</strong></a>
</p>

<img>

---

## What It Does

- **Live news intelligence** — RSS + GDELT feeds across conflict, humanitarian, medical, infrastructure, and displacement categories, refreshed every 60 seconds with Supabase Realtime slide-in animation
- **Interactive crisis map** — Leaflet 2D map with 10+ toggleable layers (hotspots, shelters, SOS signals, canvas heatmap, infrastructure nodes) and an optional globe.gl 3D globe engine
- **SOS distress system** — one-tap GPS broadcast, real-time responder feed, "I'm Safe" check-in, WhatsApp location sharing
- **Aid matching algorithm** — Supabase edge function scores inventory against requests by category, Haversine proximity, quantity adequacy, and freshness; returns top-5 ranked matches
- **Family locator** — server-side full-text search across missing persons with live status update forms and Framer Motion animations
- **Damage reporting** — multi-photo upload to Supabase Storage, geo-tagged incident reports with lightbox viewer
- **Broadcast alerts** — Twilio SMS/WhatsApp gateway for coordinator-level mass notifications
- **Conflict timeline replay** — escalation history scrubber with play/pause and 1×/5×/10× playback speed
- **Threat heatmap** — canvas-based intensity overlay on the 2D map derived from live news severity scores
- **Offline / PWA** — Workbox service worker caches map tiles, API responses, and static assets; offline banner on connectivity loss
- **Full-text search** — global command palette (Ctrl+K / ⌘K) with PostgreSQL FTS, results grouped by entity type, and persistent 10-item search history
- **Role-based access** — viewer / volunteer / coordinator / admin roles with gated features
- **9 languages** — English, Arabic (RTL), French, German, Spanish, Italian, Portuguese, Russian, Turkish; lazy-loaded locale chunks

---

## Quick Start

```bash
git clone https://github.com/ajsaliba/Lebanon-Aid-Connect.git
cd Lebanon-Aid-Connect
npm install
```

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
```

Then run:

```bash
npm run dev        # Development server → localhost:8080
npm run build      # Production build  → dist/
npm run preview    # Preview production build locally
```

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migrations in the Supabase **SQL Editor**:
   ```
   supabase/migrations/20260404000001_profiles_table.sql
   supabase/migrations/20260403000001_core_tables.sql
   supabase/migrations/20260403000002_extend_custom_feeds.sql
   ```
3. Enable **Email confirmation** → Authentication → Providers → Email → "Confirm email"
4. Add your domain to **Redirect URLs** → Authentication → URL Configuration
5. Deploy edge functions:
   ```bash
   supabase functions deploy
   ```

---

## Tech Stack

| Category | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite 5, TailwindCSS, Shadcn/ui (Radix primitives) |
| **Map** | Leaflet + react-leaflet (2D), globe.gl + Three.js (3D globe) |
| **Backend** | Supabase — PostgreSQL, Auth, Storage, Realtime WebSockets, Edge Functions (Deno) |
| **State** | TanStack Query v5, React Context, `usePersistedState` (localStorage) |
| **Animation** | Framer Motion (height transitions, enter/exit), CSS `@keyframes` |
| **Messaging** | Twilio REST API (SMS + WhatsApp) via Deno edge function |
| **Intelligence** | GDELT DOC 2.0 API, 30+ RSS sources, browser-side ML web worker |
| **Fonts** | JetBrains Mono (UI / monospace), Inter (headings) |
| **PWA** | vite-plugin-pwa + Workbox (NetworkFirst + CacheFirst strategies) |
| **Testing** | Vitest, Testing Library |

---

## Application Shells

### Operations Shell *(default)*
Full-screen mission dashboard with icon-based variant switcher, `PanelLayoutManager` for drag-configurable panel grids, and a live AlertTicker. Four mission variants selectable from the top bar:

| Variant | Icon | Focus |
|---|---|---|
| `humanitarian` | Heart | Aid coordination, medical, family locator, shelters |
| `intel` | Brain | GDELT feeds, conflict timeline, strategic risk analysis |
| `operations` | Activity | SOS, broadcast alerts, logistics, NGO missions |
| `recovery` | Shield | Reconstruction, agriculture, supply chain |

### Legacy Shell
Sidebar-based layout with tabbed left panel and right info rail. Used when `VITE_ENABLE_OPERATIONS_SHELL=false`.

---

## Feature Flags

Three runtime flags controlled via environment variables or `localStorage` overrides:

| Flag | Env Var | Default | Description |
|---|---|---|---|
| `operationsShell` | `VITE_ENABLE_OPERATIONS_SHELL` | `true` | Operations Shell layout |
| `map3dGlobe` | `VITE_ENABLE_3D_GLOBE` | `true` | globe.gl 3D map engine |
| `desktopRuntimePrep` | `VITE_ENABLE_DESKTOP_RUNTIME_PREP` | `false` | Desktop cache hydration |

---

## Panels Reference

### Situational Awareness

| Panel | Description |
|---|---|
| **CrisisMap** | Leaflet 2D map — hotspot markers, shelter pins, SOS signals, canvas heatmap, infrastructure nodes, optional 3D globe toggle |
| **AlertTicker** | Scrolling ticker of live high-severity alerts |
| **ConflictTimelinePanel** | Chronological escalation event feed with replay scrubber (Play/Pause, 1×/5×/10× speed) |
| **EarlyWarningPanel** | Predictive risk indicators and threshold breach notifications |
| **StrategicRiskPanel** | Country-level composite risk scores across multiple signal categories |
| **StrategicPosturePanel** | Military and diplomatic positioning overview |
| **SentimentVelocityPanel** | NLP-derived sentiment trend analysis across active news streams |
| **CIIPanel** | Country Intelligence Index — composite instability scoring |
| **GDELTIntelPanel** | GDELT DOC 2.0 intelligence with preset query filters and 1h / 6h / 24h / 7d timespans |
| **MlIntelPanel** | Browser-side ML threat classification via web worker |
| **CorrelationPanel** | Cross-stream signal convergence — correlates military, economic, and disaster signals |
| **WorldBriefPanel** | AI-synthesised situation brief generated from top active feeds |
| **TrendingPanel** | Real-time trending keywords extracted from the live article stream |
| **RumorVerifyPanel** | Crowdsourced rumour flagging and source credibility cross-reference |

### Humanitarian Coordination

| Panel | Description |
|---|---|
| **AidMatchPanel** | Aid request/offer board; "Find Matches" calls edge function returning top-5 scored inventory items with score bar and Accept button |
| **FamilyLocatorPanel** | Live server-side search across missing persons; inline status update with Framer Motion expand animation |
| **DamageReportPanel** | Geo-tagged damage reports with dropzone photo upload to Supabase Storage and lightbox viewer |
| **SOSPanel** | One-tap SOS distress broadcast with GPS, live active-signal responder feed, "I'm Safe" check-in, WhatsApp location share |
| **MedicalResourcePanel** | Live medical facility availability — hospitals, clinics, pharmacies |
| **PharmacyBloodPanel** | Pharmacy stock levels and blood bank availability |
| **FieldHospitalPanel** | Field hospital locations and capacity |
| **FoodWaterPanel** | Food and water distribution point registry |
| **ShelterPanel** | Shelter listings with occupancy, capacity, and amenities |
| **HousingPanel** | Emergency housing listings with free/rental classification |
| **DisplacementPanel** | IDP movement tracking and displacement corridor mapping |
| **RefugeeFlowPanel** | Cross-border refugee flow data and trends |
| **VulnerableGroupsPanel** | At-risk population registries — elderly, children, disabled |

### Infrastructure & Logistics

| Panel | Description |
|---|---|
| **InfraStatusPanel** | Power, water, telecom, and road infrastructure status by region |
| **InfrastructureCascadePanel** | Graph-based cascade failure analysis across infrastructure nodes |
| **EnergyPanel** | Electricity availability, generator fuel levels, solar capacity |
| **NightPowerPanel** | Neighbourhood-level power schedule and outage tracking |
| **FuelStationPanel** | Fuel station availability, queue status, and pricing |
| **TransportPanel** | Road closures, checkpoint status, and transport corridor alerts |
| **SafeRoutePanel** | AI-suggested safe routing avoiding active conflict zones |
| **LogisticsPanel** | Aid convoy tracking and supply chain visibility |
| **SupplyChainPanel** | Critical supply chain disruption monitoring |
| **ConnectivityPanel** | Internet, mobile network, and mesh node status |
| **MeshNetworkPanel** | Decentralised mesh node registry and signal coverage |
| **GPSJammingPanel** | GPS jamming event detection and affected zone mapping |
| **SatellitePanel** | Satellite imagery availability and recent capture timestamps |

### Community & Social

| Panel | Description |
|---|---|
| **CommunityPanel** | Neighbourhood-level information and community coordination |
| **CommunityRiskPanel** | Block-level risk scoring from community-sourced reports |
| **VolunteerPanel** | Volunteer registry — skills, availability, and location |
| **NGOMissionPanel** | Active NGO mission listing and resource coordination |
| **NeighborhoodLeadersPanel** | Focal point contacts per neighbourhood |
| **FocalPointsPanel** | Strategic coordination focal points across agencies |
| **DonationsPanel** | Verified donation links — WhatsApp, GoFundMe, PayPal, other |
| **MarketplacePanel** | Peer-to-peer goods exchange for essential items |
| **DiasporaSupportPanel** | Diaspora resource directory and remittance coordination |
| **AidAccountabilityPanel** | Aid delivery confirmation and accountability tracking |

### Economy & Recovery

| Panel | Description |
|---|---|
| **EconomicToolsPanel** | Exchange rates, price index, and economic indicator tracking |
| **AgriculturePanel** | Agricultural zone status, harvest disruption, food security |
| **ReconstructionPanel** | Post-conflict reconstruction progress and project registry |
| **ResourceForecastPanel** | Predictive resource depletion modelling |
| **EmergencyKitPanel** | Emergency kit contents and local procurement links |
| **EmergencyPlanPanel** | Household and community emergency plan builder |
| **DIYToolsPanel** | Field repair guides and improvised resource instructions |
| **SafeBuildingPanel** | Structural safety assessment guides and engineer contacts |

### Intelligence & Security

| Panel | Description |
|---|---|
| **WarImpactPanel** | Macro-level conflict metrics — casualties, displacement, infrastructure damage |
| **PredictiveRiskPanel** | 72-hour risk forecast using historical escalation patterns |
| **ProtestsPanel** | Protest and civil unrest event tracking |
| **WeatherAlertsPanel** | Severe weather warnings and operational impact |
| **SecurityPrivacyPanel** | Digital security guidance and privacy tools for at-risk users |
| **DigitalVaultPanel** | Encrypted document storage for critical personal records |
| **CrisisKnowledgePanel** | Curated survival and crisis management knowledge base |
| **CrisisAssistantPanel** | AI-assisted crisis guidance chatbot |
| **TelemedicinePanel** | Remote medical consultation links and triage guidance |

### Operations Management

| Panel | Description |
|---|---|
| **BroadcastAlertDialog** | Coordinator-only Twilio SMS/WhatsApp mass notification; multi-select contacts, channel toggle, 160-char message counter |
| **CustomFeedsPanel** | User-defined RSS feed subscriptions with keyword/source filters and live per-feed match counts |
| **NewsFeed** | Aggregated article stream with category tabs, severity badges, Supabase Realtime slide-in, and deduplication |
| **CommandPalette** | Ctrl+K / ⌘K global search across articles (PostgreSQL FTS), hotspots, infrastructure nodes, countries; results grouped by type; persistent 10-item search history chips |

---

## Backend Services

### Edge Functions (Supabase / Deno)

| Function | Description |
|---|---|
| `rss-news-feed` | Fetches and normalises 30+ RSS sources; classifies by category and severity; deduplication via `content_hash` |
| `classify-threat` | Keyword + rule-based threat classification for incoming articles |
| `sentiment-velocity` | NLP sentiment scoring with rate-of-change (velocity) over sliding windows |
| `world-brief` | AI-generated situation brief synthesised from top active articles |
| `gdelt-fetch` | GDELT DOC 2.0 API queries with custom `query` + `timespan` params; normalises to unified article shape |
| `match-aid` | Scores `aid_inventory` against an `aid_requests` row: category 40 pts, proximity ≤50 km 30 pts, quantity 20 pts, freshness 10 pts; returns top 5 |
| `send-alert` | Twilio REST API — sends SMS or WhatsApp to a list of recipients; logs outcome to `broadcast_log` |
| `geocode` | Reverse geocoding for user-submitted coordinates |
| `translate` | On-demand article translation |

---

## Database Schema

All tables use Row Level Security (RLS) with **public SELECT** and **authenticated INSERT/UPDATE own rows** policies.

| Table | Purpose |
|---|---|
| `profiles` | User roles (`viewer` / `volunteer` / `coordinator` / `admin`), display name, region, organisation |
| `articles` | Aggregated news articles with `fts tsvector GENERATED ALWAYS` column and GIN index |
| `custom_feeds` | User-defined RSS subscriptions with `keywords[]`, `sources[]`, `min_severity` |
| `sos_signals` | Active distress signals — GPS, needs, people count, status |
| `safety_checkins` | "I'm Safe" records with GPS and timestamp |
| `shelters` | Community-submitted shelter listings with capacity and occupancy |
| `housing_listings` | Emergency housing available for displaced persons |
| `missing_persons` | Missing persons registry — status, photos, contacts, last known location |
| `aid_requests` | Open aid requests — category, quantity, location, priority, status |
| `aid_inventory` | Available aid items — category, quantity, location, status |
| `aid_matches` | Accepted matches linking `aid_requests` to `aid_inventory` |
| `damage_reports` | Geo-tagged damage reports with Supabase Storage photo URLs |
| `escalation_events` | Conflict escalation history for timeline replay |
| `broadcast_log` | SMS/WhatsApp broadcast audit log |
| `volunteers` | Volunteer registry with skills and availability |
| `donation_links` | Verified donation platform links |

---

## Authentication & Roles

- **Supabase Auth** — email/password sign-up with confirmation email required
- **AuthGate** — full-screen blocker wrapping the entire app; resolves on session load
- **Duplicate email guard** — inspects `user.identities[]` on sign-up to catch already-registered addresses
- **Roles** stored in `user_metadata` (primary, no table dependency) and `profiles` table (secondary); four levels:

| Role | Permissions |
|---|---|
| `viewer` | Read-only access to all panels |
| `volunteer` | Submit aid requests, damage reports, check-ins |
| `coordinator` | All volunteer permissions + Broadcast Alert, aid matching |
| `admin` | Full access to all features |

---

## PWA & Offline Support

Workbox cache strategies:

| Cache | Strategy | TTL |
|---|---|---|
| RSS news feed API | NetworkFirst | 5 min |
| Supabase REST | NetworkFirst | 10 min |
| OpenStreetMap tiles | CacheFirst | 1 day |
| JS / CSS / images | CacheFirst | 1 week |
| Google Fonts | CacheFirst | 1 year |

An offline banner (warning-coloured, WifiOff icon) appears below the AlertTicker in both shells when the browser detects network loss.

---

## Internationalisation

9 locale files, lazy-loaded as separate Vite chunks to minimise initial bundle:

| Code | Language | Direction |
|---|---|---|
| `en` | English | LTR |
| `ar` | Arabic | **RTL** |
| `fr` | French | LTR |
| `de` | German | LTR |
| `es` | Spanish | LTR |
| `it` | Italian | LTR |
| `pt` | Portuguese | LTR |
| `ru` | Russian | LTR |
| `tr` | Turkish | LTR |

RTL layout applied via `src/lib/i18n/rtl.css` when Arabic locale is active.

---

## Project Structure

```
src/
├── components/           # 80+ panel and UI components
│   └── map/              # HeatmapLayer (canvas overlay for Leaflet)
├── config/               # Feature flags, hotspots, infrastructure nodes,
│                         # country instability, source reliability, propaganda risk
├── contexts/             # NewsFeedContext, NotificationCenterContext
├── data/                 # Static mock data (fallback when DB tables are empty)
├── features/
│   ├── map/              # MapGlobe3D (globe.gl + Three.js)
│   ├── operations/       # OperationsShell, PanelLayoutManager
│   └── runtime/          # Desktop runtime cache preparation
├── hooks/                # 20+ custom hooks (useAuth, useProfile, useDataHooks, …)
├── integrations/
│   └── supabase/         # Generated type-safe client
├── lib/
│   ├── bootstrap/        # Runtime cache hydration
│   ├── correlation/      # Cross-stream signal correlation engine
│   ├── i18n/             # Locale files + RTL stylesheet
│   └── ml/               # Web worker manager for browser-side inference
├── pages/                # Index (main app shell), NotFound
├── test/                 # Vitest unit + smoke tests
└── workers/              # ml.worker.ts (browser-side ML inference)
supabase/
├── functions/            # 9 Deno edge functions
└── migrations/           # 9 PostgreSQL migration files
```

---

## Scripts

```bash
npm run dev          # Development server (localhost:8080, HMR)
npm run build        # Production build → dist/
npm run build:dev    # Development-mode production build
npm run preview      # Preview production build locally
npm run lint         # ESLint
npm run test         # Vitest single run
npm run test:watch   # Vitest watch mode
```

---

## Contributing

Contributions welcome. Open an issue before submitting large pull requests.

```bash
npx tsc --noEmit     # Type check (must pass)
npm run lint         # Lint check (must pass)
npm run test         # Tests (must pass)
npm run build        # Production build (must succeed)
```

---

## Author

**Antonios Saliba** — [GitHub](https://github.com/ajsaliba)

---

## License

MIT — see [LICENSE](LICENSE) for full terms.

---

<p align="center">
  <a href="https://github.com/ajsaliba/Cedars-Alert">github.com/ajsaliba/Cedars-Alert</a>
</p>
