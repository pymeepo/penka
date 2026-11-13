// Order history in localStorage (demo: nothing leaves the browser).
import type { CartLine } from './cart';

const ORDERS_KEY = 'penka:orders';
const LAST_LOCATION_KEY = 'penka:last-location';
const MAX_ORDERS = 30;

export interface Order {
  number: string;
  createdAt: number;
  /** Planned pickup time, ms. */
  readyAt: number;
  asap: boolean;
  locationSlug: string;
  name: string;
  phone: string;
  comment: string;
  lines: CartLine[];
  total: number;
}

export function getOrders(): Order[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(ORDERS_KEY) ?? '[]');
    return Array.isArray(data) ? (data as Order[]).filter((o) => typeof o?.number === 'string') : [];
  } catch {
    return [];
  }
}

export function getOrder(number: string): Order | undefined {
  return getOrders().find((o) => o.number === number);
}

/** Four-digit pickup number, unique within the stored history. */
export function nextOrderNumber(): string {
  const used = new Set(getOrders().map((o) => o.number));
  let n = '';
  do {
    n = String(1000 + Math.floor(Math.random() * 9000));
  } while (used.has(n));
  return n;
}

export function saveOrder(order: Order): void {
  const orders = [order, ...getOrders()].slice(0, MAX_ORDERS);
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    localStorage.setItem(LAST_LOCATION_KEY, order.locationSlug);
  } catch {
    // Quota / private mode.
  }
}

export function lastLocation(): string | null {
  try {
    return localStorage.getItem(LAST_LOCATION_KEY);
  } catch {
    return null;
  }
}

const time = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });
const dayTime = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

export function formatTime(ms: number): string {
  return time.format(ms);
}

export function formatDayTime(ms: number): string {
  return dayTime.format(ms);
}
