# Cedars Alert

**Real-time crisis intelligence and humanitarian coordination dashboard for Lebanon** — AI-assisted news aggregation, conflict monitoring, SOS signaling, aid matching, and infrastructure tracking in a unified situational awareness interface.

<a href="https://github.com/ajsaliba/Cedars-Alert/stargazers"><img src="https://img.shields.io/github/stars/ajsaliba/Cedars-Alert?style=social"></a>
<a href="https://github.com/ajsaliba/Cedars-Alert/network/members"><img src="https://img.shields.io/github/forks/ajsaliba/Cedars-Alert?style=social"></a>
<a href="https://github.com/ajsaliba/Cedars-Alert/blob/main/SECURITY.md"><img src="https://img.shields.io/badge/Security-Policy-0ea5e9?style=flat"></a>
<a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg"></a>
<a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat&amp;logo=typescript&amp;logoColor=white"></a>
<a href="https://github.com/ajsaliba/Cedars-Alert/commits/main"><img src="https://img.shields.io/github/last-commit/ajsaliba/Cedars-Alert"></a>
<a href="https://github.com/ajsaliba/Cedars-Alert/releases/latest"><img src="https://img.shields.io/github/v/release/ajsaliba/Cedars-Alert?style=flat"></a>

<p>
  <a href="https://github.com/ajsaliba/Cedars-Alert"><img src="https://img.shields.io/badge/Repository-Cedars--Alert-blue?style=for-the-badge&amp;logo=github&amp;logoColor=white"></a>&nbsp;
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=for-the-badge&amp;logo=supabase&amp;logoColor=white"></a>&nbsp;
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&amp;logo=vite&amp;logoColor=white"></a>&nbsp;
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/UI-React-61DAFB?style=for-the-badge&amp;logo=react&amp;logoColor=black"></a>&nbsp;
  <a href="https://www.leafletjs.com/"><img src="https://img.shields.io/badge/Maps-Leaflet-199900?style=for-the-badge&amp;logo=leaflet&amp;logoColor=white"></a>
</p>

<p>
  <a href="https://github.com/ajsaliba/Cedars-Alert"><img src="https://img.shields.io/badge/Download-Source_Code-181717?style=for-the-badge&amp;logo=github&amp;logoColor=white"></a>&nbsp;
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Runtime-Node.js-339933?style=for-the-badge&amp;logo=node.js&amp;logoColor=white"></a>&nbsp;
  <a href="https://www.npmjs.com/"><img src="https://img.shields.io/badge/Package_Manager-npm-CB3837?style=for-the-badge&amp;logo=npm&amp;logoColor=white"></a>&nbsp;
  <a href="https://www.openstreetmap.org/"><img src="https://img.shields.io/badge/Map_Data-OpenStreetMap-7EBC6F?style=for-the-badge&amp;logo=openstreetmap&amp;logoColor=white"></a>
</p>

<p>
  <a href="/CONTRIBUTING.md"><strong>Contributing</strong></a> &nbsp;·&nbsp;
  <a href="https://github.com/ajsaliba/Cedars-Alert/releases/latest"><strong>Releases</strong></a> &nbsp;·&nbsp;
  <a href="/SECURITY.md"><strong>Security Policy</strong></a>
</p>


---

## What It Does

- **Live crisis intelligence** from RSS and GDELT streams, continuously refreshed for operational awareness
- **Dual map experience** with Leaflet 2D operations map and optional globe.gl 3D view
- **SOS distress workflows** with one-tap alerts, location sharing, and “I’m Safe” check-ins
- **Aid matching engine** that ranks inventory-to-request matches by category, distance, quantity, and freshness
- **Family locator and missing persons tracking** with live status updates
- **Damage and infrastructure reporting** with geotagged entries and media uploads
- **Broadcast alerting** for coordinator-led SMS/WhatsApp notifications
- **Conflict timeline and early warning panels** for escalation monitoring and replay
- **Role-based coordination** across viewer, volunteer, coordinator, and admin access levels
- **PWA/offline support** for degraded-connectivity environments

For implementation details, see <a href="/src">`/src`</a> for frontend modules and <a href="/supabase/functions">`/supabase/functions`</a> for backend edge functions.

---

## Quick Start

```bash
git clone https://github.com/ajsaliba/Cedars-Alert.git
cd Cedars-Alert
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

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, shadcn/ui |
| **Maps** | Leaflet + react-leaflet (2D), globe.gl + Three.js (3D) |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions) |
| **Data/Intelligence** | RSS feeds, GDELT DOC 2.0, browser-side ML worker |
| **Messaging** | Twilio (SMS/WhatsApp) via Supabase Edge Functions |
| **Testing** | Vitest, Testing Library |

---

## Data Overview

Cedars Alert aggregates external intelligence and operational feeds for humanitarian response, including news, conflict signals, infrastructure conditions, and community-submitted reports.

---

## Contributing

Contributions welcome! See <a href="/CONTRIBUTING.md">CONTRIBUTING.md</a> for guidelines.

```bash
npm run lint
npm run build
npm run test
```

---

## License

**MIT** — see <a href="/LICENSE">LICENSE</a> for full terms.

---

## Author

**Antonios Saliba** — <a href="https://github.com/ajsaliba">GitHub</a>

## Contributors

<a href="https://github.com/ajsaliba/Cedars-Alert/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ajsaliba/Cedars-Alert">
</a>

## Security

See <a href="/SECURITY.md">SECURITY.md</a> for responsible disclosure guidelines.

---

<p>
  <a href="https://github.com/ajsaliba/Cedars-Alert">github.com/ajsaliba/Cedars-Alert</a>
</p>
