

## Plan: Add SOS Signals + Enhanced Shelter/Housing Popups on Crisis Map

### What Changes

**1. Fetch SOS signals from database** — Add a new `useEffect` + Realtime subscription in `CrisisMap` to load active `sos_signals` from the database, alongside existing shelters and housing.

**2. New SOS marker icon** — A pulsing red `!` icon to visually distinguish distress signals from other markers.

**3. Add "SOS" to layer toggles** — New `sos` key in `LayerToggle` so users can show/hide SOS signals independently.

**4. Enhanced popups with navigation links** — All three marker types (SOS, Shelters, Housing) get richer popups:
   - **SOS**: Shows needs tags, people count, time ago, phone link, and "Navigate" link (Google Maps directions)
   - **Shelters**: Adds occupancy bar, amenities, status badge, "Get Directions" link, and call button
   - **Housing**: Adds free/paid badge, urgency indicator, "Get Directions" and WhatsApp contact links

**5. Realtime updates** — Subscribe to `sos_signals`, `shelters`, and `housing_listings` via Supabase Realtime so new entries appear on the map instantly without refresh.

### Files Modified

- **`src/components/CrisisMap.tsx`** — Add SOS state, realtime subscriptions, SOS icon, SOS layer toggle, and enhanced popups for all three humanitarian layers.

### Technical Details

- SOS icon: `L.DivIcon` with red pulsing `!` marker and `animate-pulse` CSS
- Realtime: single `supabase.channel('map-humanitarian')` subscribing to all three tables
- Navigation links use `getDirectionsUrl` from `useGeolocation.ts`
- Phone links use `tel:` protocol; WhatsApp uses `https://wa.me/` with pre-filled text
- Time display uses `date-fns` `formatDistanceToNow` for "5 min ago" style

