// /app-config.json — everything the WebView app needs, generated from src/data at build time:
// tab URLs, promo pages for push notifications, bridge contract. Absolute URLs follow site.config.mjs.
import type { APIRoute } from 'astro';
import { promos } from '../data/promos';
import { SESSION_COOKIE, SESSION_MAX_AGE } from '../lib/session';
import { absoluteUrl } from '../lib/url';

export const GET: APIRoute = ({ site }) => {
  const abs = (path: string): string => absoluteUrl(path, site);
  const config = {
    version: 1,
    site: abs(''),
    userAgentToken: 'PenkaApp',
    tabs: [
      { id: 'home', title: 'Главная', icon: 'house', url: abs('') },
      { id: 'menu', title: 'Меню', icon: 'coffee', url: abs('menu') },
      { id: 'promo', title: 'Акции', icon: 'percent', url: abs('promo') },
      { id: 'contacts', title: 'Кофейни', icon: 'map-pin', url: abs('contacts') },
      { id: 'account', title: 'Профиль', icon: 'user', url: abs('account') },
    ],
    cart: {
      url: abs('cart'),
      badgeSelector: '.cart-count',
      message: { type: 'cart', count: 'number' },
    },
    promos: promos.map((p) => ({
      slug: p.slug,
      title: p.title,
      body: p.lead,
      validFrom: p.validFrom,
      validTo: p.validTo,
      url: abs(`promo/${p.slug}`),
    })),
    pages: {
      order: abs('order'),
      orderSuccess: abs('order/success'),
      jobs: abs('jobs'),
      privacy: abs('privacy'),
      menuPdf: abs('files/menu.pdf'),
    },
    session: { cookie: SESSION_COOKIE, maxAgeSeconds: SESSION_MAX_AGE },
    // Links the app should open outside the WebView.
    externalUrlPrefixes: ['tel:', 'mailto:', 'https://yandex.ru/maps', 'https://t.me/', 'https://wa.me/'],
  };
  return new Response(JSON.stringify(config, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
