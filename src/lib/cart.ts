// Cart store in localStorage. Client-only: import from <script> tags, not from frontmatter.
import { postToApp } from './app-bridge';

export interface CartLine {
  /** slug + chosen options; equal keys merge into one line. */
  key: string;
  slug: string;
  name: string;
  /** Human-readable options, e.g. ['M · 350 мл', 'овсяное молоко']. */
  options: string[];
  unitPrice: number;
  qty: number;
  /** Optimised thumbnail URL rendered at build time. */
  image?: string;
}

const STORAGE_KEY = 'penka:cart';
const CHANGE_EVENT = 'penka:cart-change';
export const MAX_QTY = 20;

function safeParse(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (l): l is CartLine =>
        typeof l === 'object' && l !== null &&
        typeof (l as CartLine).key === 'string' &&
        typeof (l as CartLine).qty === 'number' &&
        typeof (l as CartLine).unitPrice === 'number',
    );
  } catch {
    return [];
  }
}

export function getCart(): CartLine[] {
  try {
    return safeParse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

function save(lines: CartLine[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Private mode / quota: the cart just won't persist.
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function cartCount(lines = getCart()): number {
  return lines.reduce((sum, l) => sum + l.qty, 0);
}

export function cartTotal(lines = getCart()): number {
  return lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
}

export function addToCart(line: Omit<CartLine, 'qty'>, qty = 1): void {
  const lines = getCart();
  const existing = lines.find((l) => l.key === line.key);
  if (existing) existing.qty = Math.min(MAX_QTY, existing.qty + qty);
  else lines.push({ ...line, qty: Math.min(MAX_QTY, qty) });
  save(lines);
}

export function setQty(key: string, qty: number): void {
  const lines = getCart();
  const next = qty <= 0
    ? lines.filter((l) => l.key !== key)
    : lines.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, qty) } : l));
  save(next);
}

export function removeFromCart(key: string): void {
  save(getCart().filter((l) => l.key !== key));
}

export function clearCart(): void {
  save([]);
}

/** Quantity of a menu item across all its option variants. */
export function qtyForSlug(slug: string, lines = getCart()): number {
  return lines.filter((l) => l.slug === slug).reduce((s, l) => s + l.qty, 0);
}

export function onCartChange(fn: () => void): void {
  window.addEventListener(CHANGE_EVENT, fn);
  // Other tabs.
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) fn();
  });
}

/** Updates every .cart-count badge and tells the native app. */
export function syncCartBadges(animate = false): void {
  const count = cartCount();
  document.querySelectorAll<HTMLElement>('.cart-count').forEach((el) => {
    el.textContent = String(count);
    el.dataset.count = String(count);
    if (animate) {
      el.classList.remove('animate-pop');
      void el.offsetWidth; // restart the animation
      el.classList.add('animate-pop');
    }
  });
  document.querySelectorAll<HTMLElement>('[data-cart-label]').forEach((el) => {
    el.setAttribute('aria-label', count > 0 ? `Корзина, товаров: ${count}` : 'Корзина пуста');
  });
  postToApp({ type: 'cart', count });
}
