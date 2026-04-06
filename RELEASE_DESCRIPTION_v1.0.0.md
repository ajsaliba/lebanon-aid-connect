# Cedars Alert v1.0.0

The first public release of Cedars Alert, a real-time crisis intelligence and humanitarian coordination dashboard.

## Core Features

- Real-time news aggregation from 30+ RSS feeds plus GDELT intelligence sources
- Interactive crisis map with multi-layer situational overlays and optional 3D globe mode
- SOS distress signaling with live responder visibility and “I’m Safe” check-ins
- Aid matching workflow using proximity, category, quantity, and freshness scoring
- Family locator and missing persons status tracking
- Geo-tagged damage reporting with photo upload support
- Broadcast alerting via SMS/WhatsApp for coordinator-level messaging
- Search across all data sources

## Map Layers

- Hotspots, shelters, SOS signals, and threat heatmap overlays
- Infrastructure nodes (power, water, telecom, roads)
- Optional 3D globe visualization for regional awareness

## Panels

- Live Intelligence (RSS + GDELT streams)
- Conflict timeline and escalation replay
- Strategic risk and early warning views
- Humanitarian coordination (aid, shelter, medical, displacement)
- Infrastructure and logistics status
- Community, volunteer, and NGO coordination
- Operations alerts, custom feeds, and command palette search

## Infrastructure

- Supabase backend (PostgreSQL, Realtime, Auth, Storage, Edge Functions)
- Edge functions for ingestion, classification, alerting, translation, and aid matching
- PWA/offline support with Workbox caching
- Role-based access (viewer, volunteer, coordinator, admin) and multilingual support

**Full Changelog:** https://github.com/ajsaliba/Cedars-Alert/commits/v1.0.0
