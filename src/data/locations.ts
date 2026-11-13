// Coffee shops. Phones are deliberately fake: +7 000 000-00-00.
import type { ImageKey } from './images';

export const CITY = 'Казань';
export const CONTACT_EMAIL = 'hello@penka.example';
export const DEMO_PHONE = '+7 000 000-00-00';

export interface OpeningHours {
  days: string;
  time: string;
}

export interface Location {
  slug: string;
  name: string;
  address: string;
  /** Neighbourhood hint for cards. */
  note: string;
  hours: OpeningHours[];
  phone: string;
  /** [latitude, longitude] */
  coords: [number, number];
  image: ImageKey;
  imageAlt: string;
}

export const locations: Location[] = [
  {
    slug: 'baumana',
    name: 'Пенка на Баумана',
    address: 'ул. Баумана, 44',
    note: 'В центре, пять минут от метро «Кремлёвская»',
    hours: [
      { days: 'Пн–Пт', time: '7:30–22:00' },
      { days: 'Сб–Вс', time: '9:00–22:00' },
    ],
    phone: DEMO_PHONE,
    coords: [55.7887, 49.1146],
    image: 'shop-baumana',
    imageAlt: 'Зал у большого окна: круглые столики и кирпичная стена',
  },
  {
    slug: 'universitet',
    name: 'Пенка у университета',
    address: 'ул. Кремлёвская, 21',
    note: 'Большой зал и розетки у каждого стола',
    hours: [
      { days: 'Пн–Пт', time: '7:30–21:00' },
      { days: 'Сб–Вс', time: '10:00–20:00' },
    ],
    phone: DEMO_PHONE,
    coords: [55.7924, 49.122],
    image: 'shop-universitet',
    imageAlt: 'Светлый зал с высокими окнами и стойкой бариста',
  },
  {
    slug: 'pobedy',
    name: 'Пенка на Победы',
    address: 'пр. Победы, 91',
    note: 'Летняя веранда и парковка у входа',
    hours: [
      { days: 'Ежедневно', time: '8:00–22:00' },
    ],
    phone: DEMO_PHONE,
    coords: [55.7614, 49.2187],
    image: 'shop-pobedy',
    imageAlt: 'Летняя веранда под зонтами',
  },
];

export function fullAddress(loc: Location): string {
  return `${CITY}, ${loc.address}`;
}

export function getLocation(slug: string): Location | undefined {
  return locations.find((l) => l.slug === slug);
}
