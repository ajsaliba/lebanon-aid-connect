# Feature Retention Checklist (Root App)

This checklist defines baseline root features that must remain accessible through the new operational shell rollout.

## Header Interactions

- Notifications drawer opens and marks all as read.
- Language switcher changes locale.
- Source filter modal remains accessible.
- Auth dialog remains accessible.
- Data export (CSV/JSON) remains accessible.
- Command palette remains available via keyboard shortcut.
- Fullscreen and sound toggles remain available.

## Map Capabilities

- Map renders by default in 2D fallback mode.
- Layer toggles remain available (hotspots, conflicts, shelters, housing, news, hospitals, infrastructure, SOS, day/night).
- Time filter remains available.
- Hotspot and humanitarian overlays remain visible when enabled.

## Left-Side Operational Features

- Feed view remains accessible.
- Intel view remains accessible.
- Resources/tools view remains accessible.
- Live streams remain accessible.

## Right-Side Aid/Humanitarian Workflows

- SOS workflow remains accessible.
- Shelters workflow remains accessible.
- Housing workflow remains accessible.
- Donations workflow remains accessible.
- Aid matching workflow remains accessible.
- Medical workflow remains accessible.
- Volunteer workflow remains accessible.
- Family workflow remains accessible.
- Jobs workflow remains accessible.

## Data and Persistence

- Supabase-backed article ingestion and live updates remain functional.
- Supabase-backed aid panel data flows remain functional.
- Existing localStorage-backed UI preferences continue to restore safely.

## Phase 0 Smoke Test Coverage

- Map load in root shell.
- Feed load in root shell mobile flow.
- Right panel SOS default visibility.
- Right panel shelters tab switching.
- Command palette open via keyboard shortcut.
