# Architecture

## Overview

Courtside is a single-page app written in plain JavaScript, with no framework and Vite as the bundler. The UI is rendered as HTML strings into `#app`. Event handlers are delegated and read `data-act` / `data-view` attributes. All state is in memory and is written to `localStorage` after every change.

```
index.html          Entry page (fonts, icons, #app mount point)
src/main.js         Imports CSS, the app and the PWA registration
src/app.js          Shared UI state, event dispatch, court rendering, sample team, backup/restore
src/board.js        Board view and libero preview
src/rotations.js    Rotations and serving order views
src/live-set.js     Live set setup, scoring, subs, and view
src/roster.js       Roster view
src/set-library.js  Set library view and setter target settings
src/storage.js      Browser storage, save status, and persistence
src/engine.js       Pure volleyball logic: rotations, overlap rules, formations, set calls
src/pwa.js          Registers the service worker and shows the "New version available" bar
src/styles.css      All styles; colors are CSS variables on :root with dark-mode overrides
src/base.css        Safe-area padding for phones
public/             Static files copied as-is (favicon, PWA icons)
tests/              Vitest engine tests and Playwright browser tests
vite.config.js      Base path (/courtside/) and PWA manifest + service worker config
pwa-assets.config.js  Icon generator config (npm run icons)
.github/workflows/deploy.yml  Build, test and deploy to GitHub Pages on push to main
```

## engine.js vs app.js

- **`engine.js`** holds pure functions that never touch the DOM or storage, so it's the part to unit-test. It exports `ENG` (court positions per rotation, overlap checks, formations, set-call recommendations, auto-fix), `allP` and `RT` (runtime state for the live set).
  - Zones follow volleyball numbering: 1 = right back, 2 = right front, 3 = middle front, 4 = left front, 5 = left back, 6 = middle back.
  - Court coordinates run from 0 to 1: `x` from left to right and `y` from the net (0) to the end line (1).
- **`app.js`** keeps shared state and actions. Each view module receives the shared functions it needs when the app starts. Its main sections are:
  - Constants: `GLOSSARY` (default set calls), `ROLES`, `SYS` (5-1, 5-2, 6-2, 4-2)
  - `S`: the global UI state (current team, lineups, view, open dialogs, live set)
  - Court and animation SVG rendering (`courtSVG`, `comboSVG`, `animSVG`, …)
  - Home and backup views
  - `render()`: rebuilds the page from `S`
  - Sample team seeding, roster parsing, backup/restore
  - `boot()`: loads storage, seeds the sample team on first visit, opens the last team

## Views (tabs)

| Tab | `S.view` | What it does |
| --- | --- | --- |
| Board | `board` | Per rotation: Serve receive (drag, legality shown live), Rotation base, and Defense (`defenseSpots`, temporary drag + Reset) |
| Rotations | `rot` | All six rotations at a glance with status |
| Live set | `live` | Run a match: score, rotate, subs, libero, log, undo |
| Roster | `roster` | Players, positions, jersey numbers |
| Set library | `calls` | The team's set-call glossary |

The home screen (team picker) shows when `S.home` is true.

## Data model

Everything is stored as one JSON object:

```js
DB = {
  v: 1,
  teams:   { [teamId]: Team },
  lineups: { [teamId]: Lineup[] },
  cur:     teamId | null,     // last opened team
  seeded:  bool,              // sample team already added
  savedAt: ISO string
}
```

**Team:** `{ id, name, season, source ('custom' | 'sample' | 'backup'), players[], roster[]?, glossary[], subLimit, createdAt, updatedAt, ... }`
- `players`: `{ id, first, last, jersey, roles: ['S'|'OH'|'M'|'OPP'|'L'|'DS'], backRow, passer, ... }`
- `glossary`: set calls `{ code, desc, roles, row: 'F'|'B', tempo: 1|2|3, x, h, ... }`

**Lineup:** `{ id, name, system ('5-1' etc.), order[6] (player ids in serve order), setters[], swaps[], subs[], liberos[], rotations[6], sort, updatedAt }`
- `rotations[i]`: `{ r, spots: { [playerId]: [x, y] }, calls: { [playerId]: setCode }, libero, lines, note }`

**Live set:** this is stored separately because it's per device and per match:
`{ lu (lineup id), r, serving, us, them, subs, slots[6], tie, partner, plans, log[], hist[] (undo) }`

## Storage keys

| Key | Contents |
| --- | --- |
| `courtside-v1` | The `DB` object: all teams and lineups |
| `courtside-live` | The live set in progress |
| `svbc-lineup-builder-v1`, `svbc-lineup-builder-live` | Old keys from the artifact version. Read once if the new keys are empty |

Saves are debounced by 250 ms (`writeStore`). If `localStorage` throws (quota, private mode), the header badge switches to "Not saving · download a backup".

## Offline / PWA

`vite-plugin-pwa` generates `manifest.webmanifest` and `sw.js` at build time.
- The service worker precaches every built file, so the app loads with no connection.
- Google Fonts are cached at runtime the first time they load.
- When a new deploy is detected, `src/pwa.js` shows a "New version available · Reload" bar. It never reloads on its own, so a live set isn't interrupted. Data is safe either way because it's in `localStorage`, not in the cache.
- The service worker only runs in `build`/`preview` builds, not in `npm run dev`.
