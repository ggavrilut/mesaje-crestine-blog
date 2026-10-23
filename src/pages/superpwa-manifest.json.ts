import { SITE_NAME, THEME_COLOR } from '../lib/site.ts';

// The app's manifest (docs/specs/pwa.md), at the URL the WordPress app (SuperPWA) used, so
// installed apps pick it up. `id` and `start_url` stay `/`: the app's identity must not change.

export const GET = () =>
  new Response(
    JSON.stringify({
      id: '/',
      start_url: '/',
      scope: '/',
      name: SITE_NAME,
      short_name: SITE_NAME,
      description: 'Meditații, predici și scrieri creștine traduse în limba română.',
      lang: 'ro',
      dir: 'ltr',
      display: 'standalone',
      theme_color: THEME_COLOR,
      background_color: '#fbfcfb',
      icons: [
        { src: '/app-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/app-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/app-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    }),
    { headers: { 'content-type': 'application/manifest+json' } },
  );
