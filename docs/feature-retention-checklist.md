# Feature Retention Checklist

Baseline features that must remain accessible through the operations shell rollout.

## Header

- [ ] Notifications drawer opens and marks all as read.
- [ ] Language switcher changes locale (5 full locales + 4 stubs).
- [ ] Source filter modal accessible.
- [ ] Auth dialog accessible.
- [ ] CSV/JSON data export accessible.
- [ ] Command palette opens via keyboard shortcut.
- [ ] Fullscreen and sound toggles work.

## Map

- [ ] Map renders by default in 2D (Leaflet).
- [ ] 3D globe toggle available when `VITE_ENABLE_3D_GLOBE` is enabled (default: on).
- [ ] All 19 layer toggles work: hotspots, airstrikes, shelters, housing, news, hospitals, infrastructure, SOS, protests, displacement, weather, cyber, maritime, telecom, power grid, satellite, borders, supply routes, day/night.
- [ ] Time-range filter works (1 h, 6 h, 24 h, 48 h, 7 d, all).

## Left-Side Panels

- [ ] Feed view accessible.
- [ ] Intel view accessible.
- [ ] Resources/tools view accessible.
- [ ] Live streams accessible.

## Right-Side Aid Workflows

- [ ] SOS workflow accessible.
- [ ] Shelters workflow accessible.
- [ ] Housing workflow accessible.
- [ ] Donations workflow accessible.
- [ ] Aid matching workflow accessible.
- [ ] Medical workflow accessible.
- [ ] Volunteer workflow accessible.
- [ ] Family workflow accessible.
- [ ] Jobs workflow accessible.

## Data and Persistence

- [ ] Supabase article ingestion and realtime updates functional.
- [ ] Supabase aid-panel data flows functional.
- [ ] localStorage UI preferences restore correctly.

## Smoke Tests (`src/test/smoke.app-shell.test.tsx`)

- [ ] Map loads in operations shell.
- [ ] Feed loads in mobile flow.
- [ ] Right panel SOS visible by default.
- [ ] Right panel shelters tab switches.
- [ ] Command palette opens via keyboard shortcut.
