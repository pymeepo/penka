// Resolves image keys from src/data to optimisable assets for <Image>/<Picture>.
// Lazy glob: only images a page actually uses end up in the build.
import type { ImageMetadata } from 'astro';
import type { ImageKey } from '../data/images';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/images/*.{jpg,jpeg,png,webp}');

const byKey = new Map(Object.entries(files).map(([path, load]) => [path.replace(/^.*\/|\.\w+$/g, ''), load]));

export async function loadImage(key: ImageKey): Promise<ImageMetadata> {
  const load = byKey.get(key);
  if (!load) throw new Error(`Нет фото «${key}» в src/assets/images/ — запустите npm run assets`);
  return (await load()).default;
}
