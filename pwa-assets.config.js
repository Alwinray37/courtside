import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Generates the app icons in public/ from public/favicon.svg. Run: npm run icons
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#0f1b33' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#0f1b33' } },
  },
  images: ['public/favicon.svg'],
});
