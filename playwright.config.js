import { defineConfig } from '@playwright/test';

// Tests run against the production build (vite preview), the same files GitHub Pages serves.
// Uses Playwright's bundled Chromium (`npx playwright install chromium`).
// Set PW_CHANNEL=chrome to use your installed Google Chrome instead.
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://127.0.0.1:4173/courtside/',
    browserName: 'chromium',
    ...(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}),
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173/courtside/',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
