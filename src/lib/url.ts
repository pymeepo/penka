/**
 * Builds an internal URL that respects the site's base path (`/penka/` on GitHub Pages).
 * Page paths get a trailing slash (trailingSlash: 'always'); files (with an extension) don't.
 *
 *   url()                        → /penka/
 *   url('menu')                  → /penka/menu/
 *   url('/order/success?n=12')   → /penka/order/success/?n=12
 *   url('files/menu.pdf')        → /penka/files/menu.pdf
 */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const match = /^([^?#]*)(.*)$/.exec(path.replace(/^\/+/, ''));
  let pathname = match?.[1] ?? '';
  const rest = match?.[2] ?? '';
  const last = pathname.split('/').pop() ?? '';
  if (pathname && !pathname.endsWith('/') && !last.includes('.')) pathname += '/';
  return base + pathname + rest;
}

/** Absolute URL (for Open Graph, share links). */
export function absoluteUrl(path: string, site: URL | undefined): string {
  return new URL(url(path), site ?? 'http://localhost').href;
}
