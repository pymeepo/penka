const rub = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

/** 1250 → «1 250 ₽» (with a non-breaking space before the sign). */
export function formatPrice(value: number): string {
  return `${rub.format(value)} ₽`;
}

const dateLong = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
const dateShort = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });

/** '2026-11-30' → «30 ноября 2026 г.» */
export function formatDate(iso: string, withYear = true): string {
  const d = new Date(`${iso}T12:00:00`);
  return (withYear ? dateLong : dateShort).format(d);
}

/** Russian plural: plural(3, ['позиция', 'позиции', 'позиций']) → «позиции». */
export function plural(n: number, forms: readonly [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

/** '+7 000 000-00-00' → 'tel:+70000000000' */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
