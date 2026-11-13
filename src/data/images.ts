// Photo keys = file names in src/assets/images/ without extension.
// Plain strings here so data files stay importable from Node scripts (PDF menu).
export const IMAGE_KEYS = [
  'hero',
  'latte-art',
  'cappuccino',
  'raf',
  'filter-coffee',
  'matcha',
  'croissant',
  'cinnamon-roll',
  'syrniki',
  'avocado-toast',
  'interior',
  'barista',
  'flat-white',
  'americano',
  'raf-halva',
  'cocoa',
  'matcha-tonic',
  'almond-croissant',
  'cardamom-bun',
  'shop-baumana',
  'shop-universitet',
  'shop-pobedy',
] as const;

export type ImageKey = (typeof IMAGE_KEYS)[number];
