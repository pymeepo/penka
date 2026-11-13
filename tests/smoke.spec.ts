// Smoke test: every page opens in a mobile viewport without console errors,
// has SEO basics, and gets a full-page screenshot in screenshots/.
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

interface Route {
  name: string;
  path: string;
  status?: number;
}

const routes: Route[] = [
  { name: 'home', path: '' },
  { name: 'menu', path: 'menu/' },
  { name: 'menu-item', path: 'menu/cappuccino/' },
  { name: 'promo', path: 'promo/' },
  { name: 'promo-item', path: 'promo/second-cappuccino/' },
  { name: 'cart', path: 'cart/' },
  { name: 'order', path: 'order/' },
  { name: 'order-success', path: 'order/success/?n=1234' },
  { name: 'account', path: 'account/' },
  { name: 'contacts', path: 'contacts/' },
  { name: 'jobs', path: 'jobs/' },
  { name: 'privacy', path: 'privacy/' },
  { name: '404', path: 'no-such-page/', status: 404 },
];

/** Collects console errors, uncaught exceptions and failed same-origin requests. */
function watchErrors(page: Page, allowMainDocument404 = false): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (allowMainDocument404 && /status of 404/.test(text)) return;
    errors.push(`console: ${text}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('response', (res) => {
    const url = new URL(res.url());
    const sameOrigin = url.host === new URL(page.url() || res.url()).host;
    const isDocument = res.request().resourceType() === 'document';
    if (sameOrigin && res.status() >= 400 && !(allowMainDocument404 && isDocument)) {
      errors.push(`http ${res.status()}: ${url.pathname}`);
    }
  });
  return errors;
}

for (const route of routes) {
  test(`${route.name} opens cleanly`, async ({ page }) => {
    const errors = watchErrors(page, route.status === 404);
    const res = await page.goto(route.path, { waitUntil: 'networkidle' });
    expect(res?.status(), 'HTTP status').toBe(route.status ?? 200);

    // SEO basics
    await expect(page).toHaveTitle(/Пенка/);
    expect(await page.locator('meta[name="description"]').getAttribute('content')).toBeTruthy();
    expect(await page.locator('meta[property="og:title"]').getAttribute('content')).toBeTruthy();
    expect(await page.locator('meta[property="og:image"]').getAttribute('content')).toMatch(/^https?:\/\//);
    await expect(page.locator('h1:visible')).toHaveCount(1);

    // Brand chrome: the demo notice and the cart badge are always in the DOM.
    await expect(page.locator('.demo-notice').first()).toBeAttached();
    await expect(page.locator('.cart-count')).toHaveCount(1);

    // No horizontal scroll on a phone.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, 'horizontal overflow, px').toBeLessThanOrEqual(1);

    await page.screenshot({
      path: `screenshots/${route.name}.jpg`,
      type: 'jpeg',
      quality: 80,
      fullPage: true,
      animations: 'disabled',
      // A fixed tab bar would be stamped mid-page in a full-page capture; pin it to the bottom instead.
      style: 'body{position:relative} .site-tabbar{position:absolute!important;bottom:0}',
    });
    expect(errors).toEqual([]);
  });
}

test('PDF menu is served', async ({ request }) => {
  const res = await request.get('files/menu.pdf');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('application/pdf');
  expect((await res.body()).subarray(0, 4).toString()).toBe('%PDF');
});

test('manifest is valid', async ({ request }) => {
  const res = await request.get('manifest.webmanifest');
  expect(res.status()).toBe(200);
  const manifest = (await res.json()) as { theme_color: string; background_color: string; icons: Array<{ sizes: string; src: string }> };
  expect(manifest.theme_color).toBe('#C8875B');
  expect(manifest.background_color).toBe('#F7F1E8');
  expect(manifest.icons.map((i) => i.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));
  for (const icon of manifest.icons) expect((await request.get(icon.src)).status()).toBe(200);
});

test('app-config.json lists working URLs', async ({ request }) => {
  const res = await request.get('app-config.json');
  expect(res.status()).toBe(200);
  const config = (await res.json()) as {
    site: string;
    tabs: Array<{ url: string }>;
    promos: Array<{ url: string }>;
    pages: Record<string, string>;
    cart: { url: string };
  };
  expect(config.tabs).toHaveLength(5);
  expect(config.promos.length).toBeGreaterThan(0);
  const urls = [...config.tabs.map((t) => t.url), ...config.promos.map((p) => p.url), config.cart.url, ...Object.values(config.pages)];
  for (const url of urls) {
    expect(url.startsWith(config.site)).toBe(true);
    // Production URLs → check the same path on the local preview.
    const path = new URL(url).pathname.replace(new URL(config.site).pathname, '');
    expect((await request.get(path)).status(), path).toBe(200);
  }
});
