# Lovable Prompt — Lebanon-Aid-Connect: World Monitor UI Branch

## Repository & Branch

**Repository:** https://github.com/ajsaliba/Lebanon-Aid-Connect.git
**Branch:** `UI`

Clone/import the UI branch. Do **NOT** work on `main`.

---

## Project Overview

This is **Cedars Alert**, a real-time crisis monitoring and humanitarian coordination dashboard for Lebanon — referred to throughout the codebase as "World Monitor." It is a single-page React 18 + TypeScript + Vite application styled with TailwindCSS and Shadcn/ui, running on top of a Supabase backend.

The app is feature-complete at the UI layer (~95%) but critically incomplete at the data and backend layer (~10%). Your job is to implement every missing feature described below while strictly following the existing visual language.

---

## UI Design System — Read This First

Before touching any feature, internalize the established look-and-feel so every new element is indistinguishable from existing ones.

### Color Palette (dark terminal aesthetic)

| Role | Classes |
|------|---------|
| Background layers | `bg-black`, `bg-gray-950`, `bg-gray-900`, `bg-gray-800` |
| Panel surfaces | `bg-gray-900/80 backdrop-blur-sm border border-gray-800` |
| Primary accent | `text-cyan-400`, `bg-cyan-500/10`, `border-cyan-500/30` |
| Success / safe | `text-green-400`, `bg-green-500/10` |
| Warning / elevated | `text-yellow-400`, `bg-yellow-500/10` |
| Critical / high threat | `text-red-400`, `bg-red-500/10` |
| Muted text | `text-gray-400`, `text-gray-500` |
| Labels / captions | `text-xs text-gray-500 uppercase tracking-wider` |

### Typography

- All code, data, and identifiers: `font-mono`
- Panel headers: `text-sm font-semibold text-cyan-400 uppercase tracking-widest`
- Body copy: `text-sm text-gray-300`
- Secondary info: `text-xs text-gray-500`

### Panel Anatomy

Every panel follows this exact structure:

```tsx
<div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800
                rounded-lg overflow-hidden flex flex-col h-full">
  {/* Header */}
  <div className="px-4 py-3 border-b border-gray-800 flex items-center
                  justify-between shrink-0">
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-cyan-400" />
      <span className="text-sm font-semibold text-cyan-400 uppercase
                       tracking-widest">PANEL TITLE</span>
      <span className="text-xs text-gray-500 font-mono">· {count}</span>
    </div>
    <div className="flex items-center gap-2">
      {/* action buttons — small, ghost, icon-only */}
    </div>
  </div>
  {/* Scrollable content */}
  <div className="flex-1 overflow-y-auto scrollbar-thin
                  scrollbar-thumb-gray-700">
    ...
  </div>
</div>
```

### Badges / Status Chips

```tsx
// Severity
<span className="px-2 py-0.5 rounded text-xs font-mono bg-red-500/20
                 text-red-400 border border-red-500/30">HIGH</span>
<span className="px-2 py-0.5 rounded text-xs font-mono bg-yellow-500/20
                 text-yellow-400 border border-yellow-500/30">ELEVATED</span>
<span className="px-2 py-0.5 rounded text-xs font-mono bg-green-500/20
                 text-green-400 border border-green-500/30">BASELINE</span>

// Generic label
<span className="px-1.5 py-0.5 rounded text-xs bg-gray-800
                 text-gray-400 border border-gray-700">label</span>
```

### Buttons

```tsx
// Primary action
className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400
           border border-cyan-500/30 text-xs px-3 py-1.5 rounded"

// Destructive — same pattern with red variants

// Icon-only
className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-gray-200"
```

### Inputs / Forms

```tsx
<input className="w-full bg-gray-800 border border-gray-700 rounded
                  px-3 py-2 text-sm text-gray-200 placeholder-gray-600
                  focus:outline-none focus:border-cyan-500/50
                  focus:ring-1 focus:ring-cyan-500/20" />
```

### List Items (within scrollable panels)

```tsx
<div className="px-4 py-3 border-b border-gray-800/50 hover:bg-gray-800/30
                cursor-pointer transition-colors">
  <div className="flex items-start justify-between gap-2">
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-200 font-medium truncate">Title</p>
      <p className="text-xs text-gray-500 mt-0.5">subtitle · timestamp</p>
    </div>
    <Badge />
  </div>
</div>
```

### Live Pulse Indicator

Used on the top bar and any "live" data source:

```tsx
<span className="relative flex h-2 w-2">
  <span className="animate-ping absolute inline-flex h-full w-full
                   rounded-full bg-cyan-400 opacity-75" />
  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
</span>
```

### Empty States

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Icon className="h-8 w-8 text-gray-700 mb-3" />
  <p className="text-sm text-gray-600">No data available</p>
  <p className="text-xs text-gray-700 mt-1">descriptive sub-message</p>
</div>
```

### Skeleton / Loading State

```tsx
<div className="animate-pulse space-y-3 p-4">
  {[...Array(5)].map((_, i) => (
    <div key={i} className="space-y-1.5">
      <div className="h-3 bg-gray-800 rounded w-3/4" />
      <div className="h-2 bg-gray-800 rounded w-1/2" />
    </div>
  ))}
</div>
```

---

## Missing Features to Implement

---

### Feature 1 — Real Authentication Flow

**What exists:** `useAuth()` returns a hardcoded mock user. `AuthDialog.tsx` exists but is disconnected. Supabase client is configured with URL and anon key.

**What to build:**

1. Wire `AuthDialog.tsx` to a real Supabase email/password auth flow. Use `supabase.auth.signInWithPassword()` and `supabase.auth.signUp()`. Show both tabs (Sign In / Sign Up) in the dialog.
2. In `useAuth()` at `src/hooks/useAuth.ts`, subscribe to `supabase.auth.onAuthStateChange()` and return the live session user instead of the mock.
3. Protect the main dashboard: if no session, render `AuthDialog` as a full-screen gate (same dark background, centered dialog card using the existing panel anatomy).
4. Add a user avatar button in the top-right of `TopBar.tsx` — clicking it opens a small dropdown with "Profile" and "Sign Out". Sign out calls `supabase.auth.signOut()`.
5. Store `displayName` in `supabase.auth.user.user_metadata`. Surface it next to the avatar.

**UI rules:** The AuthDialog must use the exact dark panel style. Header: `AUTHENTICATE · CEDARS ALERT` in the standard cyan uppercase. Input fields follow the form pattern above. The submit button uses the primary cyan style. No white cards, no light backgrounds.

---

### Feature 2 — Live Supabase Data Binding (Replace Mock Data)

**What exists:** 57 components import from `src/data/mockData.ts` and siblings. Supabase auto-generated types exist at `src/integrations/supabase/types.ts`. Only `ShelterPanel`, `SOSPanel`, and `HousingPanel` actively call Supabase.

**What to build:**

Create a unified data layer that replaces every mock import. For each major entity, add a custom React Query hook that reads from Supabase:

| Entity | Supabase table | Hook to create |
|--------|---------------|----------------|
| News articles | `articles` | `useArticles(filters)` |
| Missing persons | `missing_persons` | `useMissingPersons(query)` |
| Hospitals & clinics | `medical_resources` | `useMedicalResources()` |
| Community channels | `community_channels` | `useCommunityChannels()` |
| Aid inventory | `aid_inventory` | `useAidInventory()` |
| Damage reports | `damage_reports` | `useDamageReports()` |
| Volunteers | `volunteers` | `useVolunteers()` |
| Marketplace listings | `marketplace` | `useMarketplace()` |
| Mesh nodes | `mesh_nodes` | `useMeshNodes()` |

For each hook, use `@tanstack/react-query`'s `useQuery` with a `queryFn` that calls `supabase.from(table).select('*')`. Handle `isLoading` with the skeleton pattern and `isError` with an inline error chip (`text-red-400 text-xs font-mono`).

Each table needs a Supabase migration. Create migration files at `supabase/migrations/`. Define sensible columns matching the existing mock TypeScript types. Enable Row Level Security — public read, authenticated write.

Replace mock imports panel-by-panel, testing each one before moving on.

---

### Feature 3 — Real-Time WebSocket Subscriptions

**What exists:** `NewsFeedContext` has a fake 5-second polling interval that cycles through mock arrays. There is a connectivity banner showing live/cached/offline but no real connection check.

**What to build:**

1. In `NewsFeedContext` (`src/contexts/NewsFeedContext.tsx`), replace the fake interval with a Supabase Realtime subscription:

```ts
supabase
  .channel('articles')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'articles' },
    (payload) => prependArticle(payload.new))
  .subscribe((status) => setConnectionStatus(
    status === 'SUBSCRIBED' ? 'live' : 'cached'));
```

2. Animate new articles sliding in from the top of the news feed list. Use a brief `animate-slide-down` CSS class (define it in `globals.css` as a translate-Y from -16px to 0 over 200ms).
3. Wire the connectivity banner's three states (live, cached, offline) to the actual Supabase channel status. Show the pulsing cyan dot only when `status === 'live'`.
4. Add real-time subscriptions for `damage_reports`, `sos_calls`, and `shelter_availability` tables — each triggers a toast notification (use the existing Sonner toast) with the appropriate severity color.

---

### Feature 4 — GDELT News Integration

**What exists:** `GDELTIntelPanel.tsx` renders with mock data and references the GDELT Project API. No actual fetch logic is wired.

**What to build:**

Build a Supabase Edge Function at `supabase/functions/gdelt-fetch/index.ts` that:

1. Accepts a `POST { query: string, timespan: string }` request.
2. Calls the GDELT DOC 2.0 API:
   `https://api.gdeltproject.org/api/v2/doc/doc?query={q}&mode=artlist&maxrecords=75&timespan={t}&format=json`
3. Normalises the response to match the app's `Article` type (title, url, source, seendate, socialimage, language, domain).
4. Returns the normalised array as JSON.

On the client, in `GDELTIntelPanel.tsx`, use `useQuery` to call this edge function every 5 minutes. Map results into the existing article card format. Add a "Source: GDELT" badge (`bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs font-mono`) next to each article's timestamp. Show a filter bar at the panel header: presets for "Lebanon", "Beirut", "Hezbollah", "UNIFIL", "IDF". Clicking a preset updates the query and refetches.

---

### Feature 5 — Damage Report with Photo Upload

**What exists:** `DamageReportPanel.tsx` renders a form with text fields and severity selector. There is no image input and no file upload logic. Photos show placeholder initials only.

**What to build:**

1. Add a photo upload dropzone to the damage report form. Use the native `<input type="file" accept="image/*" multiple>` wrapped in a styled div:

```
border-2 border-dashed border-gray-700 hover:border-cyan-500/50
rounded-lg p-6 text-center cursor-pointer transition-colors
```

When a file is selected, show a thumbnail preview grid (3 columns, each thumbnail `w-full aspect-square object-cover rounded`).

2. On submit, upload each file to a Supabase Storage bucket named `damage-photos` using `supabase.storage.from('damage-photos').upload(path, file)`. Store the returned public URLs in the `damage_reports` table row.

3. In the damage report list view, render a photo strip below each report's description: a horizontal scroll row of `h-20 w-28` thumbnails with rounded corners. Clicking a thumbnail opens a full-screen lightbox (use `Dialog` from `@radix-ui/react-dialog`, black background, close on Escape/backdrop click).

---

### Feature 6 — Family Locator with Live Search

**What exists:** `FamilyLocatorPanel.tsx` renders with hardcoded missing persons from `extendedMockData.ts`. Search filters locally within the static array.

**What to build:**

1. Replace mock data with the `useMissingPersons(query)` hook from Feature 2.
2. Add server-side full-text search: when the user types in the search box, debounce 300ms then call:

```ts
supabase.from('missing_persons')
  .select('*')
  .or(`name.ilike.%${q}%,last_known_location.ilike.%${q}%`)
```

3. Add a "Report Found / Update Status" button on each person card. Clicking opens an inline expandable form (no modal — expands below the card using `AnimatePresence` from `framer-motion` with height animation):
   - Status selector: Missing / Safe / Injured / Evacuated / Deceased
   - Notes textarea (max 300 chars with counter)
   - Submit calls `supabase.from('missing_persons').update({ status, notes }).eq('id', id)`

4. Add a "+ Report Missing Person" floating button at the bottom-right of the panel (fixed within the panel container, not page-level). Same cyan style. Opens a drawer (use Shadcn `Sheet` component, `side="right"`) with a structured form: Full Name, Age, Last Known Location (lat/lng picker on a mini Leaflet map), Photo Upload, Contact Info.

---

### Feature 7 — Operations Shell as Default Layout

**What exists:** `OperationsShell.tsx` and `PanelLayoutManager.tsx` are fully built (~170 lines each) but the app always boots into `LegacyShell`. The feature flag `VITE_ENABLE_OPERATIONS_SHELL` defaults to `true` but the conditional in `Index.tsx` may not actually switch shells.

**What to build:**

1. In `src/pages/Index.tsx`, ensure that when `VITE_ENABLE_OPERATIONS_SHELL` is `true` (the default), the app renders `<OperationsShell />` as the primary layout instead of the legacy one.

2. Make the **app variant switcher** work end-to-end. The four variants are: `humanitarian`, `intel`, `operations`, `recovery`. Each variant changes:
   - Which panels are shown in the main grid
   - The map layer presets loaded on boot
   - The sidebar navigation items highlighted

   Persist the active variant in localStorage key `worldmonitor_variant`.

3. Add a variant switcher UI to the top bar (right side, before the language selector): four icon buttons (`Shield`, `Brain`, `Activity`, `Heart` from lucide-react) with tooltips. The active variant button gets `bg-cyan-500/10 text-cyan-400 border border-cyan-500/30`.

4. Wire `PanelLayoutManager` — allow users to drag-and-drop panels to reorder them within the resizable grid. Use the existing `react-resizable-panels` already installed. Persist layout as JSON in localStorage key `worldmonitor_layout_{variant}`.

---

### Feature 8 — SMS & Messaging Gateway

**What exists:** Contact phone numbers are stored in mock data. WhatsApp links are hardcoded strings. There is no send functionality.

**What to build:**

Create a Supabase Edge Function at `supabase/functions/send-alert/index.ts` that accepts `{ to: string[], message: string, channel: 'sms' | 'whatsapp' }` and integrates with Twilio:

- For SMS: `POST https://api.twilio.com/2010-04-01/Accounts/{SID}/Messages.json`
- For WhatsApp: same endpoint but `to` prefixed with `whatsapp:`

Store `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` as Supabase secrets.

On the client, add a "Broadcast Alert" button to `SOSPanel.tsx`. Clicking it opens a `Dialog` with:

- Recipients list (pre-populated from community contacts, multi-select checkboxes)
- Message textarea (max 160 chars for SMS, live character counter in `text-xs font-mono text-gray-500`)
- Channel toggle: SMS / WhatsApp (segmented control using the cyan accent)
- Send button that calls the edge function and shows a Sonner toast on success/failure

Log each broadcast to a `broadcast_log` Supabase table: `id`, `sender_id`, `recipients_count`, `message`, `channel`, `sent_at`, `status`.

---

### Feature 9 — Custom Feed Subscriptions (Persist + Filter)

**What exists:** `CustomFeedsPanel` renders a UI for managing custom feeds with add/edit/delete forms, but there is no persistence — changes disappear on refresh. Feeds also don't actually filter the news stream.

**What to build:**

1. Persist custom feeds to a `custom_feeds` Supabase table: `id`, `user_id`, `name`, `keywords: text[]`, `sources: text[]`, `min_severity`, `enabled`, `created_at`.

2. In `useFeedSettings()` hook, load the user's custom feeds on mount via React Query. CRUD operations must call Supabase and invalidate the query.

3. Wire custom feeds into `NewsFeedContext`: when feeds are enabled, filter the articles array so only articles matching at least one enabled feed's keyword list or source list are shown. A keyword match means `article.title.toLowerCase().includes(kw)` or body match.

4. Add a feed count badge on the `CustomFeedsPanel` header showing how many feeds are active: `{activeCount} active` in `text-cyan-400 font-mono text-xs`.

5. Add per-feed match count (e.g. "12 matches") shown as a small gray chip next to each feed name in the list.

---

### Feature 10 — Threat Heatmap on 2D Map

**What exists:** The 2D Leaflet map has marker layers for hospitals, shelters, hotspots, and airstrikes. There is no density/heatmap visualization.

**What to build:**

1. Install `leaflet.heat`. If it conflicts with the Vite setup, implement a canvas-based heatmap directly using the Leaflet `Canvas` renderer.

2. Add a "Heatmap" toggle button to the map layer controls bar (same row as existing layer toggles, follow the same `bg-gray-900/80 border border-gray-800 rounded` chip style).

3. When enabled, plot intensity points derived from:
   - Article geo-coordinates (weight = severity score from ML worker)
   - Damage reports (weight = severity enum mapped to 0.3 / 0.6 / 1.0)
   - SOS calls (weight = 1.0 always)

   Use a gradient: `{ 0.4: 'cyan', 0.65: 'yellow', 1.0: 'red' }` — matching the app's threat color system.

4. The heatmap layer must respect the active time filter (the `TimeFilterBar` component already exists — read its selected value from context and recompute the heatmap points on change).

---

### Feature 11 — Escalation History & Replay

**What exists:** `ConflictTimelinePanel.tsx` renders a static vertical timeline of hardcoded escalation events. The `useEscalationHistory` hook returns the same mock array.

**What to build:**

1. Create an `escalation_events` Supabase table: `id`, `title`, `description`, `location`, `lat`, `lng`, `severity`, `event_type`, `source_url`, `occurred_at`, `created_at`.

2. Replace the mock hook with a real query. Subscribe to real-time inserts so the timeline updates live.

3. Add a **Timeline Replay** control bar below the timeline header:
   - A scrubber slider (`<input type="range">` styled with `accent-color: #22d3ee`)
   - Play / Pause buttons (use `Play` and `Pause` from lucide-react)
   - Speed selector: 1×, 5×, 10×

   When playing, animate through events chronologically — each event "activates" (full opacity, left border `border-l-2 border-cyan-400`) as the playhead reaches its timestamp, with inactive events at 40% opacity.

4. On the 2D map, each active timeline event during replay places a temporary pulsing marker at its lat/lng using a custom DivIcon with the `animate-ping` ring effect.

---

### Feature 12 — Aid Matching Algorithm (Server-Side)

**What exists:** `AidMatchPanel.tsx` shows aid inventory and request forms but matching is manual/visual — no automatic pairing logic.

**What to build:**

Create a Supabase Edge Function at `supabase/functions/match-aid/index.ts` that:

1. Accepts `{ requestId: string }`.
2. Queries `aid_requests` and `aid_inventory` tables.
3. Scores each available inventory item against the request using:
   - Category match: 40 pts
   - Location proximity (Haversine, max 50 km): up to 30 pts
   - Quantity adequacy: up to 20 pts
   - Freshness (less-recently-matched items preferred): 10 pts
4. Returns top 5 matches sorted by score.

On the client, in `AidMatchPanel.tsx`:

- Add a "Find Matches" button on each open request card (small, cyan, icon = `Zap`).
- Show a loading skeleton while the edge function runs.
- Render the returned matches as a nested list below the request card, each showing: item name, distance, quantity available, match score (colored bar: `bg-cyan-500` width proportional to score out of 100).
- "Accept Match" button calls `supabase.from('aid_matches').insert(...)` and updates both the request and inventory row status to `matched`.

---

### Feature 13 — Offline / PWA Support

**What exists:** `vite.config.ts` may reference `@vite-pwa/plugin`. A `public/manifest.json` exists. No service worker logic is present.

**What to build:**

1. Install and configure `vite-plugin-pwa`. Register it in `vite.config.ts` with `registerType: 'autoUpdate'` and a Workbox strategy:
   - Cache-first for static assets (JS, CSS, fonts, icons)
   - Network-first with 10 s timeout for API calls
   - Stale-while-revalidate for map tiles

2. Add an offline banner: when `navigator.onLine === false`, show a slim bar below the top bar:

```
bg-yellow-500/10 border-b border-yellow-500/30 text-yellow-400
text-xs font-mono px-4 py-2 text-center
```

Text: `⚠ OFFLINE — displaying cached data`

3. Cache the last 200 news articles to IndexedDB on fetch using the `workbox-cacheable-response` plugin.

4. Add an "Add to Home Screen" prompt: detect the `beforeinstallprompt` event, store it, and show a small bottom sheet on mobile after 30 seconds of use — "Install Cedars Alert for offline access" — with Install / Dismiss buttons (same dark panel style, bottom of viewport).

---

### Feature 14 — Search with Full-Text Index

**What exists:** The news feed search box matches within the in-memory mock array. No other panels have search. There is no persistent search history.

**What to build:**

1. In the `articles` table migration, add a generated `tsvector` column and a GIN index:

```sql
ALTER TABLE articles ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title,'') || ' ' || coalesce(body,''))
  ) STORED;
CREATE INDEX articles_fts_idx ON articles USING GIN(fts);
```

2. In the search query, use `.textSearch('fts', query, { type: 'websearch' })`.

3. Add global search to the **Command Palette** (`CommandPalette.tsx`): when the user types in the CMD+K palette, show results grouped by entity type: Articles, Missing Persons, Shelters, Medical Resources. Use the existing palette's result row style.

4. Add search history: store the last 10 search terms in localStorage key `worldmonitor_search_history`. Show them as "Recent" chips at the top of the command palette before the user types. Each chip has an × button to remove it individually. History chips: `bg-gray-800 border border-gray-700 text-gray-400 text-xs px-2 py-1 rounded`.

---

### Feature 15 — User Roles & Permissions

**What exists:** All users see all panels. There is no concept of roles. Supabase RLS is not fully configured.

**What to build:**

1. Define roles: `viewer`, `volunteer`, `coordinator`, `admin`.

2. Store role in a Supabase `profiles` table: `id` (FK to `auth.users`), `role`, `display_name`, `region`, `organization`, `created_at`.

3. Create a trigger: on new `auth.users` insert, create a `profiles` row with `role = 'viewer'`.

4. Enable RLS policies:
   - `viewers` — SELECT on articles, shelters, medical_resources
   - `volunteers` — additionally INSERT on damage_reports, missing_persons
   - `coordinators` — INSERT/UPDATE on all tables
   - `admin` — full access

5. In the UI, read the user's role from the `profiles` table after login. Pass it through context. Conditionally render action buttons:
   - "Edit"/"Delete" buttons only for `coordinator` and above
   - "Broadcast Alert" only for `coordinator` and above
   - Settings and admin panels only visible to `admin`

   Show a role badge next to the user avatar in the top bar — `text-xs font-mono uppercase` in the appropriate color: viewer = gray, volunteer = green, coordinator = cyan, admin = purple.

---

## Implementation Notes

- Do **not** change the visual style of any existing component unless a feature explicitly requires adding new UI elements to it.
- Run `npm run build` and confirm zero TypeScript errors before considering any feature done.
- For Edge Functions, always add a CORS header: `'Access-Control-Allow-Origin': '*'` and handle the `OPTIONS` preflight.
- All Supabase queries must handle the `{ data, error }` return — surface errors as inline `text-red-400 text-xs` messages, not `console.log`.
- When adding new Shadcn components not already in `src/components/ui/`, use `npx shadcn-ui@latest add <component>` to install them properly.
- Framer Motion is already installed — use `AnimatePresence` and `motion.div` for any new enter/exit animations. Keep durations under 200 ms.
- The app uses `react-resizable-panels` for layout. When adding new panels to the grid, always place them inside a `ResizablePanel` with a sensible `defaultSize` and `minSize={10}`.

**Start with Features 1, 2, and 3** (auth, data binding, real-time) as they unblock every other feature. Then implement 4–15 in any order.
