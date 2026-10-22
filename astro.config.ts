import { defineConfig, fontProviders } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { youtubeFacade } from './src/lib/youtube.ts';
import buildChecks from './src/integrations/build-checks.ts';

export default defineConfig({
  site: 'https://mesaje-crestine.ro',
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: {
    processor: satteri({
      // Both default to on, and both change the text: smart punctuation rewrites quotes,
      // dashes and ellipses, GFM turns bare URLs into links (docs/content-model.md).
      features: { smartPunctuation: false, gfm: false },
      hastPlugins: [youtubeFacade],
    }),
  },
  integrations: [buildChecks()],
  // The design's fonts (docs/specs/visual-design.md), downloaded at build and served from the
  // site itself (docs/seo.md, performance).
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Roboto',
      cssVariable: '--font-roboto',
      weights: [300, 400, 500],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Source Serif 4',
      cssVariable: '--font-serif',
      weights: [300, 400, 500],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['Georgia', 'serif'],
      options: { experimental: { variableAxis: { opsz: [['8', '60']] } } },
    },
  ],
});
