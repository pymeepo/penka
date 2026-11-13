// Behaviour the WebView app relies on: app mode, cart badge, postMessage bridge, session cookie.
import { expect, test } from '@playwright/test';

test.describe('app mode (PenkaApp user agent)', () => {
  test.use({ userAgent: 'Mozilla/5.0 (Linux; Android 14) PenkaApp/1.0' });

  test('hides site chrome but keeps .cart-count', async ({ page }) => {
    await page.goto('');
    await expect(page.locator('html')).toHaveClass(/in-app/);
    await expect(page.locator('.site-header')).toBeHidden();
    await expect(page.locator('.site-footer')).toBeHidden();
    await expect(page.locator('.site-tabbar')).toBeHidden();
    await expect(page.locator('.app-banner')).toBeHidden();
    await expect(page.locator('.cart-count')).toBeAttached();
    await expect(page.locator('.app-only .demo-notice')).toBeVisible();
    await page.screenshot({ path: 'screenshots/app-mode-home.jpg', type: 'jpeg', quality: 80, animations: 'disabled' });
  });
});

test('cart changes post the count to ReactNativeWebView', async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __messages: string[]; ReactNativeWebView: { postMessage(m: string): void } };
    w.__messages = [];
    w.ReactNativeWebView = { postMessage: (m: string) => w.__messages.push(m) };
  });
  await page.goto('menu/');
  const card = page.locator('[data-product]').first();
  await card.getByRole('button', { name: 'В корзину' }).click();
  await card.locator('[data-inc]').click();
  await expect(page.locator('.cart-count')).toHaveText('2');
  const messages = await page.evaluate(() => (window as unknown as { __messages: string[] }).__messages);
  expect(messages.at(-1)).toBe(JSON.stringify({ type: 'cart', count: 2 }));
});

test('order flow: cart → checkout → success → history', async ({ page }) => {
  await page.goto('menu/cappuccino/');
  await page.locator('[data-item-form] [data-submit]').click();
  await expect(page.locator('.cart-count')).toHaveText('1');
  await page.goto('order/');
  await page.getByRole('button', { name: /Подтвердить заказ/ }).click();
  await expect(page.locator('[data-error="name"]')).toBeVisible();

  await page.getByLabel('Имя').fill('Аня');
  await page.getByLabel('Телефон').pressSequentially('9001234567');
  await expect(page.getByLabel('Телефон')).toHaveValue('+7 (900) 123-45-67');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: /Подтвердить заказ/ }).click();

  await page.waitForURL(/order\/success\/\?n=\d{4}/);
  const number = new URL(page.url()).searchParams.get('n');
  await expect(page.locator('[data-number]')).toHaveText(number ?? '');
  await expect(page.locator('.cart-count')).toHaveText('0');
});

test('login sets a 30-day penka_session cookie', async ({ page, context }) => {
  await page.goto('account/');
  await page.getByLabel('Номер телефона').pressSequentially('9001234567');
  await page.getByRole('button', { name: 'Получить код' }).click();
  await page.getByLabel('Код', { exact: true }).pressSequentially('1234');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Гость «Пенки»');

  const cookie = (await context.cookies()).find((c) => c.name === 'penka_session');
  expect(cookie).toBeDefined();
  expect(cookie?.path).toBe('/');
  expect(cookie?.sameSite).toBe('Lax');
  const days = ((cookie?.expires ?? 0) * 1000 - Date.now()) / 86_400_000;
  expect(days).toBeGreaterThan(29);

  await page.reload();
  await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible();
});
