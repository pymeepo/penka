import type { APIRoute } from 'astro';
import { url } from '../lib/url';

// Built as a static file; paths follow the base path from site.config.mjs.
export const GET: APIRoute = () => {
  const manifest = {
    name: 'Пенка — кофейни у дома',
    short_name: 'Пенка',
    description: 'Меню, акции и заказ к приходу в кофейнях «Пенка» (демо).',
    lang: 'ru',
    start_url: url(),
    scope: url(),
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#C8875B',
    background_color: '#F7F1E8',
    icons: [
      { src: url('icons/icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: url('icons/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: url('icons/icon-maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
};
