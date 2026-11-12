// Promotions. Each one gets a page /promo/<slug>/ — a target for push notifications.
import type { ImageKey } from './images';

export interface Promo {
  slug: string;
  title: string;
  /** One line for cards and push text. */
  lead: string;
  /** Short badge on the card: «−50%», «Подарок». */
  badge: string;
  conditions: string[];
  /** ISO dates, inclusive. */
  validFrom: string;
  validTo: string;
  image: ImageKey;
  /** Menu item the main button leads to. */
  itemSlug: string;
}

export const promos: Promo[] = [
  {
    slug: 'second-cappuccino',
    title: 'Второй капучино за полцены',
    lead: 'Берите кофе на двоих: второй капучино обойдётся в половину цены.',
    badge: '−50%',
    conditions: [
      'Скидка 50% на второй капучино в заказе.',
      'Действует на любой размер, скидка на напиток с меньшей ценой.',
      'Работает при заказе в приложении и на сайте с самовывозом.',
      'Не суммируется с другими акциями.',
    ],
    validFrom: '2026-11-01',
    validTo: '2026-12-31',
    image: 'cappuccino',
    itemSlug: 'cappuccino',
  },
  {
    slug: 'early-breakfast',
    title: 'Ранний завтрак −20%',
    lead: 'С 7:30 до 11:00 сырники и тосты на 20% дешевле.',
    badge: '−20%',
    conditions: [
      'Скидка 20% на все позиции из раздела «Завтраки».',
      'Время заказа с 7:30 до 11:00 в будни.',
      'Во всех трёх кофейнях «Пенки».',
    ],
    validFrom: '2026-11-01',
    validTo: '2027-01-31',
    image: 'syrniki',
    itemSlug: 'syrniki',
  },
  {
    slug: 'matcha-week',
    title: 'Неделя матчи: сироп в подарок',
    lead: 'К матча-латте любой сироп бесплатно: ваниль, карамель или орех.',
    badge: 'Подарок',
    conditions: [
      'Сироп за 0 ₽ к любому матча-латте.',
      'Один сироп на напиток.',
      'Пока матча есть в наличии.',
    ],
    validFrom: '2026-11-10',
    validTo: '2026-11-30',
    image: 'matcha',
    itemSlug: 'matcha-latte',
  },
];

export function getPromo(slug: string): Promo | undefined {
  return promos.find((p) => p.slug === slug);
}
