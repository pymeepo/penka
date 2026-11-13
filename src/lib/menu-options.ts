// Option selection → price, labels and cart key. Shared by the server (cards) and the client (item page).
import {
  milkOptions,
  sizeOptions,
  syrupOptions,
  type MenuItem,
  type MilkOption,
  type SizeOption,
  type SyrupOption,
} from '../data/menu';
import type { CartLine } from './cart';

export interface Selection {
  size?: SizeOption['id'];
  milk?: MilkOption['id'];
  syrup?: SyrupOption['id'];
}

export function defaultSelection(item: MenuItem): Selection {
  return {
    size: item.options?.sizes ? 'S' : undefined,
    milk: item.options?.milk ? 'regular' : undefined,
    syrup: item.options?.syrup ? 'none' : undefined,
  };
}

const size = (sel: Selection): SizeOption | undefined => sizeOptions.find((o) => o.id === sel.size);
const milk = (sel: Selection): MilkOption | undefined => milkOptions.find((o) => o.id === sel.milk);
const syrup = (sel: Selection): SyrupOption | undefined => syrupOptions.find((o) => o.id === sel.syrup);

export function priceFor(item: MenuItem, sel: Selection): number {
  return item.price + (size(sel)?.extra ?? 0) + (milk(sel)?.extra ?? 0) + (syrup(sel)?.extra ?? 0);
}

/** Labels for the cart: size always (for drinks), milk and syrup only when not default. */
export function optionLabels(item: MenuItem, sel: Selection): string[] {
  const labels: string[] = [];
  const s = size(sel);
  if (s) labels.push(`${s.id} · ${s.volume}`);
  else labels.push(item.portion);
  const m = milk(sel);
  if (m && m.id !== 'regular') labels.push(`${m.name.toLowerCase()} молоко`);
  const y = syrup(sel);
  if (y && y.id !== 'none') labels.push(`сироп «${y.name.toLowerCase()}»`);
  return labels;
}

export function lineKey(item: MenuItem, sel: Selection): string {
  return [item.slug, sel.size ?? '-', sel.milk ?? '-', sel.syrup ?? '-'].join('|');
}

export function buildLine(item: MenuItem, sel: Selection, image?: string): Omit<CartLine, 'qty'> {
  return {
    key: lineKey(item, sel),
    slug: item.slug,
    name: item.name,
    options: optionLabels(item, sel),
    unitPrice: priceFor(item, sel),
    image,
  };
}
