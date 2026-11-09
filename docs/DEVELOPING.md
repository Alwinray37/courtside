# Developing

## Making a change

1. `npm run dev` and open http://localhost:5173/courtside/
2. Edit `src/`. The page hot-reloads.
3. If you touched `engine.js`, add or update a test in `tests/engine.test.js` and run `npm test`.
4. Before pushing, run `npm test && npm run build && npm run preview` and click through the app once.

Note that `localhost` and the live site have **separate storage**. Your real team on the live site isn't visible locally. To test with it, download a backup on the live site and restore it locally (see [DATA.md](DATA.md)).

## Deploying

Pushing to `main` triggers [.github/workflows/deploy.yml](../.github/workflows/deploy.yml). The workflow runs `npm ci`, `npm test` and `npm run build`, then publishes `dist/` to GitHub Pages. If the tests fail, nothing deploys.

One-time setup (already done if the site is live): in the GitHub repo, open **Settings → Pages → Source** and choose **GitHub Actions**.

Check deploy status in the repo's **Actions** tab or with `gh run list`.

## How users get updates

Installed and returning users have the old version cached by the service worker. After a deploy:
1. On their next visit, the browser downloads the new version in the background.
2. The app shows **New version available · Reload**.
3. When they tap Reload, the new version runs. If they tap Later, it runs the next time all Courtside tabs or windows are closed and reopened.

To check this locally, run `npm run build && npm run preview`, open the app, change something, rebuild, and refresh. The bar should appear.

## Changing stored data (important)

Data saved by older versions stays in people's browsers. If you rename or restructure a field on `Team` or `Lineup`:
- Make the new code read the old shape and upgrade it. `openTeam()` in `app.js` is the place for this. It already adds the `4` set call to older teams and upgrades older sample teams (`sampleV`).
- Never delete or rename the `courtside-v1` key. If you ever must, read the old key first, the way `loadStore()` falls back to `svbc-lineup-builder-v1`.
- Restoring a backup should keep working for old backup files (`app: 'courtside'` or `'sunshine-lineup-builder'`).

## Icons

The source is `public/favicon.svg`. After editing it, run:

```sh
npm run icons
```

This regenerates `favicon.ico`, `pwa-*.png`, `maskable-icon-512x512.png` and `apple-touch-icon-180x180.png` in `public/`. The background color for the maskable and Apple icons is set in `pwa-assets.config.js`.

## Changing the app name, colors or URL

- **Name/description/theme color:** `manifest` in `vite.config.js`, plus `<title>` and `theme-color` in `index.html`
- **Repo name/URL path:** `base`, `start_url` and `scope` in `vite.config.js` must all match `/<repo-name>/`
- **UI colors:** CSS variables at the top of `src/styles.css` (light, then dark)

## Dependencies

| Package | Purpose |
| --- | --- |
| `vite` | Dev server and bundler |
| `vitest` | Unit tests |
| `vite-plugin-pwa` | Manifest + service worker |
| `@vite-pwa/assets-generator` | `npm run icons` |
