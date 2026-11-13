// Server-only: slug → small square thumbnail URL, for pages that render cart lines on the client.
// Cart lines also store an image URL, but it may point to an older build; this map is always fresh.
import { getImage } from 'astro:assets';
import { menu } from '../data/menu';
import { loadImage } from './images';

export async function menuThumbs(): Promise<Record<string, string>> {
  const entries = await Promise.all(
    menu.map(async (item) => {
      const img = await getImage({ src: await loadImage(item.image), width: 160, height: 160, format: 'webp' });
      return [item.slug, img.src] as const;
    }),
  );
  return Object.fromEntries(entries);
}
