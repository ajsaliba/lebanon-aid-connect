

## Plan: Fix Blank Page -- Missing `leaflet.markercluster` Package

### Root Cause

`src/components/map/MarkerClusterGroup.tsx` imports `leaflet.markercluster` (line 9), but only the type definitions (`@types/leaflet.markercluster`) are in `package.json`. The actual runtime package is missing, causing an immediate crash and blank screen.

### Fix

1. **Install `leaflet.markercluster`** -- add it as a dependency (version `^1.5.3`)
2. No code changes needed; the import and usage are already correct

Single-step fix: add the missing package to `package.json` dependencies.

