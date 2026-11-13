// Menu. To add a dish: copy an item, give it a unique slug and an image key from images.ts.
import type { ImageKey } from './images';

export type CategoryId = 'coffee' | 'not-coffee' | 'bakery' | 'breakfast';
export type Tag = 'hit' | 'new';

export interface Category {
  id: CategoryId;
  name: string;
}

export const categories: Category[] = [
  { id: 'coffee', name: 'Кофе' },
  { id: 'not-coffee', name: 'Не кофе' },
  { id: 'bakery', name: 'Выпечка' },
  { id: 'breakfast', name: 'Завтраки' },
];

export const tagLabels: Record<Tag, string> = {
  hit: 'Хит',
  new: 'Новинка',
};

export interface MenuItem {
  slug: string;
  name: string;
  description: string;
  category: CategoryId;
  /** Volume or weight of the base portion, e.g. «250 мл», «120 г». */
  portion: string;
  /** Price in roubles for the base portion (size S for drinks). */
  price: number;
  image: ImageKey;
  tags: Tag[];
  /** Which options the item page offers. */
  options?: {
    sizes?: boolean;
    milk?: boolean;
    syrup?: boolean;
  };
}

// --- Options ---------------------------------------------------------------

export interface SizeOption {
  id: 'S' | 'M' | 'L';
  volume: string;
  extra: number;
}

export const sizeOptions: SizeOption[] = [
  { id: 'S', volume: '250 мл', extra: 0 },
  { id: 'M', volume: '350 мл', extra: 40 },
  { id: 'L', volume: '450 мл', extra: 80 },
];

export interface MilkOption {
  id: 'regular' | 'oat' | 'lactose-free';
  name: string;
  extra: number;
}

export const milkOptions: MilkOption[] = [
  { id: 'regular', name: 'Обычное', extra: 0 },
  { id: 'oat', name: 'Овсяное', extra: 50 },
  { id: 'lactose-free', name: 'Безлактозное', extra: 50 },
];

export interface SyrupOption {
  id: 'none' | 'vanilla' | 'caramel' | 'hazelnut';
  name: string;
  extra: number;
}

export const syrupOptions: SyrupOption[] = [
  { id: 'none', name: 'Без сиропа', extra: 0 },
  { id: 'vanilla', name: 'Ваниль', extra: 40 },
  { id: 'caramel', name: 'Солёная карамель', extra: 40 },
  { id: 'hazelnut', name: 'Лесной орех', extra: 40 },
];

// --- Items -----------------------------------------------------------------

export const menu: MenuItem[] = [
  // Кофе
  {
    slug: 'cappuccino',
    name: 'Капучино',
    description: 'Двойной эспрессо на зерне из Бразилии и Эфиопии и плотная молочная пена. Наш самый частый заказ.',
    category: 'coffee',
    portion: '250 мл',
    price: 220,
    image: 'cappuccino',
    tags: ['hit'],
    options: { sizes: true, milk: true, syrup: true },
  },
  {
    slug: 'latte',
    name: 'Латте',
    description: 'Больше молока, мягкий вкус и рисунок на пене. Хорош, когда хочется не спешить.',
    category: 'coffee',
    portion: '250 мл',
    price: 230,
    image: 'latte-art',
    tags: [],
    options: { sizes: true, milk: true, syrup: true },
  },
  {
    slug: 'flat-white',
    name: 'Флэт уайт',
    description: 'Двойной ристретто и тонкий слой бархатного молока. Кофе чувствуется ярче, чем в латте.',
    category: 'coffee',
    portion: '180 мл',
    price: 240,
    image: 'flat-white',
    tags: [],
    options: { milk: true },
  },
  {
    slug: 'raf-vanilla',
    name: 'Раф ванильный',
    description: 'Эспрессо, сливки и ванильный сахар, взбитые вместе. Сладкий и очень нежный.',
    category: 'coffee',
    portion: '250 мл',
    price: 290,
    image: 'raf',
    tags: ['hit'],
    options: { sizes: true },
  },
  {
    slug: 'raf-halva',
    name: 'Раф с халвой',
    description: 'Подсолнечная халва, сливки и эспрессо. На вкус как в детстве, только для взрослых.',
    category: 'coffee',
    portion: '250 мл',
    price: 320,
    image: 'raf-halva',
    tags: ['new'],
    options: { sizes: true },
  },
  {
    slug: 'filter-of-the-day',
    name: 'Фильтр дня',
    description: 'Каждый день новое зерно и новая воронка. Спросите бариста, что заварили сегодня.',
    category: 'coffee',
    portion: '250 мл',
    price: 200,
    image: 'filter-coffee',
    tags: [],
    options: { sizes: true },
  },
  {
    slug: 'americano',
    name: 'Американо',
    description: 'Эспрессо и горячая вода. Честный кофе без лишнего, можно с сиропом.',
    category: 'coffee',
    portion: '250 мл',
    price: 170,
    image: 'americano',
    tags: [],
    options: { sizes: true, syrup: true },
  },

  // Не кофе
  {
    slug: 'matcha-latte',
    name: 'Матча-латте',
    description: 'Японский чай матча, взбитый венчиком, и тёплое молоко. Бодрит мягко, без кофеина в лоб.',
    category: 'not-coffee',
    portion: '250 мл',
    price: 290,
    image: 'matcha',
    tags: ['new'],
    options: { sizes: true, milk: true, syrup: true },
  },
  {
    slug: 'matcha-tonic',
    name: 'Матча-тоник',
    description: 'Матча, тоник и апельсиновый фреш со льдом. Освежает даже в ноябре.',
    category: 'not-coffee',
    portion: '350 мл',
    price: 310,
    image: 'matcha-tonic',
    tags: [],
  },
  {
    slug: 'cocoa',
    name: 'Какао',
    description: 'Настоящий бельгийский какао-порошок на молоке, сверху маршмеллоу.',
    category: 'not-coffee',
    portion: '250 мл',
    price: 210,
    image: 'cocoa',
    tags: [],
    options: { sizes: true, milk: true },
  },

  // Выпечка
  {
    slug: 'croissant',
    name: 'Круассан',
    description: 'Слоёный, на сливочном масле 82,5 %. Печём каждое утро с семи часов.',
    category: 'bakery',
    portion: '70 г',
    price: 160,
    image: 'croissant',
    tags: [],
  },
  {
    slug: 'almond-croissant',
    name: 'Миндальный круассан',
    description: 'Круассан с миндальным кремом франжипан и хлопьями миндаля.',
    category: 'bakery',
    portion: '110 г',
    price: 230,
    image: 'almond-croissant',
    tags: [],
  },
  {
    slug: 'cinnamon-roll',
    name: 'Булочка с корицей',
    description: 'Мягкое тесто, много корицы и сливочная глазурь сверху. Лучше брать тёплой.',
    category: 'bakery',
    portion: '120 г',
    price: 190,
    image: 'cinnamon-roll',
    tags: ['hit'],
  },
  {
    slug: 'cardamom-bun',
    name: 'Булочка с кардамоном',
    description: 'Шведская булочка-узелок с кардамоном и жемчужным сахаром.',
    category: 'bakery',
    portion: '110 г',
    price: 190,
    image: 'cardamom-bun',
    tags: ['new'],
  },

  // Завтраки
  {
    slug: 'syrniki',
    name: 'Сырники со сметаной',
    description: 'Три сырника из фермерского творога, сметана и ягодный соус. Подаём весь день.',
    category: 'breakfast',
    portion: '220 г',
    price: 360,
    image: 'syrniki',
    tags: ['hit'],
  },
  {
    slug: 'avocado-toast',
    name: 'Тост с авокадо',
    description: 'Хлеб на закваске, авокадо, яйцо пашот, редис и щепотка чили.',
    category: 'breakfast',
    portion: '230 г',
    price: 420,
    image: 'avocado-toast',
    tags: [],
  },
];

export function getMenuItem(slug: string): MenuItem | undefined {
  return menu.find((item) => item.slug === slug);
}

export function itemsByCategory(id: CategoryId): MenuItem[] {
  return menu.filter((item) => item.category === id);
}

export const hits: MenuItem[] = menu.filter((item) => item.tags.includes('hit')).slice(0, 4);
