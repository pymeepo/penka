// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { SITE_URL } from './site.config.mjs';

const { origin, pathname } = new URL(SITE_URL);

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: origin,
  base: pathname,
  trailingSlash: 'always',
  // Astro 7 defaults to 'jsx', which drops whitespace between inline tags on separate lines.
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
