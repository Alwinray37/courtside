# Courtside

Build volleyball serve-receive lineups, see every rotation, and run a live set from the bench.

**Live site:** https://&lt;your-username&gt;.github.io/courtside/

## Features

- **Board:** drag players to their serve-receive spots, draw attack lines, step through rotations with animated moves, toggle the rotation base view, and preview libero modes (none / for MB / for OH). Overlap rules are checked as you drag.
- **Rotations:** all six rotations at a glance with front-row hitters and any rule problems.
- **Live set:** pick your starting six and planned subs, tap the score to add points, rotations follow side-outs, tap the base to sub. The re-entry rule (a player only comes back into the spot she played) is enforced, with an injury override.
- **Roster:** players with jersey numbers. Lineups use position tokens (S1, OH1, MB1, OP, L...), so any player can play any spot in a given set.
- **Backup & restore:** export your teams as JSON and import them on another device.

## Data and privacy

There is no account and no server. Everything is saved in your browser's `localStorage`, so it stays on that device. Use **More > Backup & restore** to move teams between devices or browsers.

## Development

```bash
npm install
npm run dev       # local dev server
npm test          # rules-engine tests (Vitest)
npm run build     # production build to dist/
```

### Project layout

```
index.html          page shell
src/main.js         entry: loads styles and the app
src/engine.js       rotation rules engine (pure functions, no DOM)
src/app.js          UI, state, storage
src/styles.css      app styles (light and dark)
tests/              engine unit tests
.github/workflows/  build, test and deploy to GitHub Pages on every push to main
```

## Deploying

Pushing to `main` runs the GitHub Action, which tests, builds, and publishes `dist/` to GitHub Pages. In the repo's **Settings > Pages**, set **Source** to **GitHub Actions** (one-time).

The site is served under `/courtside/`. If you rename the repo, change `base` in `vite.config.js` to match.

## Roadmap

See [BACKLOG.md](BACKLOG.md).
# courtside
