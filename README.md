# Courtside

Volleyball serve-receive lineups, rotations and live set tracking. A static web app hosted on GitHub Pages. There are no accounts and no server: all data lives in the browser's `localStorage`.

**Live site:** https://alwinray37.github.io/courtside/

## Quick start

```sh
npm ci          # install dependencies
npm run dev     # local dev server at http://localhost:5173/courtside/
npm test        # engine unit tests (Vitest)
npm run test:e2e # browser tests (Playwright)
npm run build   # production build into dist/
npm run preview # serve dist/ locally (use this to test offline/PWA)
```

Requires Node 20+.

## Docs

| Doc | What's in it |
| --- | --- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the code is laid out, the data model and where data is stored |
| [docs/DEVELOPING.md](docs/DEVELOPING.md) | Day-to-day workflow: making changes, testing, deploying, releasing updates |
| [docs/DATA.md](docs/DATA.md) | Saving, loading, backing up and moving your team data |
| [BACKLOG.md](BACKLOG.md) | What's done, what's next, and the full-stack plan |
