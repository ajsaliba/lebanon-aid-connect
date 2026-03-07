
# Lebanon Crisis Monitor — Real-Time War & Humanitarian Dashboard

A dark, "operations room" styled web app combining real-time conflict monitoring with humanitarian aid features for Lebanon.

## Phase 1: Core Layout & Design System
- Dark military/ops-room theme: dark background (#0a0a0a), amber/orange accents for alerts, green for safe zones, red for danger
- Monospace fonts for data, scanline/grid aesthetic
- Responsive layout: interactive map (center), sidebar with live feeds (left), news/humanitarian panel (right)
- Top bar with region filters (Lebanon focus, Middle East, Global) and live clock (UTC)

## Phase 2: Interactive Map (Leaflet + OpenStreetMap)
- Full-screen interactive map centered on Lebanon
- **Conflict layer**: Airstrike locations with red pulsing markers, conflict zones with shaded regions
- **Humanitarian layer**: Shelter locations (green pins), homes for rent (blue pins), aid distribution points
- **News overlay**: Clickable markers for geotagged news events
- Layer toggle panel (similar to WorldMonitor) to show/hide each data type
- Click any marker for details popup

## Phase 3: Live News Feed
- Aggregated news from real APIs (NewsAPI, GNews, or similar) filtered for Lebanon/Middle East conflict
- Embedded live YouTube news streams (Al Jazeera, CNN, France 24, Al Arabiya)
- News cards with severity indicators (High Alert / Elevated / Monitoring)
- Time filters: 1h, 6h, 24h, 48h, 7d
- Search and category filtering

## Phase 4: Authentication & User Profiles (Supabase)
- Email/password signup and login
- User profiles with roles (volunteer, donor, admin)
- Protected routes for submitting listings
- Admin dashboard for moderating content

## Phase 5: Humanitarian Aid Features
- **Shelters directory**: Browse/search shelters on map and list view, with capacity, contact info, and availability status. Authenticated users can submit new shelters (pending admin approval)
- **Homes for rent**: Listings with location, price, photos, contact details, displayed on map. Users can submit new listings
- **Donations page**: Curated links to trusted donation platforms (Red Cross, UNHCR, local NGOs) with descriptions and direct links
- **Emergency contacts**: Key phone numbers, embassy contacts, emergency services

## Phase 6: Real-Time Data & Alerts
- Live data refresh with visual pulse indicators
- Push-style alert banner for breaking events (scrolling ticker)
- Status indicators showing data freshness
- Region-based filtering and search

## Technical Notes
- Supabase backend for auth, database (shelters, housing listings, user profiles, roles), and storage (listing photos)
- Real news APIs via Supabase Edge Functions to keep API keys secure
- Leaflet.js for interactive mapping
- All data validated with Zod on client and server side
