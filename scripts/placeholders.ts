// Creates JPG placeholders (gradient + caption) for every photo the site expects.
// Existing files are kept — drop real photos into src/assets/images/ with the same names.
// Run: npm run assets   (add `-- --force` to overwrite)
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { COLORS, textFont, textFontRegular } from './lib/brand.ts';
import { r, textToPath } from './lib/text-path.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = resolve(root, 'src/assets/images');
mkdirSync(dir, { recursive: true });
const force = process.argv.includes('--force');

interface Spec {
  file: string;
  caption: string;
  from: string;
  to: string;
  w: number;
  h: number;
}

const wide = { w: 1920, h: 1280 };
const square = { w: 1200, h: 1200 };

const specs: Spec[] = [
  { file: 'hero.jpg', caption: 'Утро в «Пенке»', from: '#8A5A3B', to: '#E3B48E', ...wide },
  { file: 'latte-art.jpg', caption: 'Латте-арт', from: '#B57A52', to: '#F1D9BF', ...square },
  { file: 'cappuccino.jpg', caption: 'Капучино', from: '#9C6440', to: '#EBCBA8', ...square },
  { file: 'raf.jpg', caption: 'Раф', from: '#C8875B', to: '#F7E6D2', ...square },
  { file: 'filter-coffee.jpg', caption: 'Фильтр-кофе', from: '#5B3A26', to: '#C8875B', ...square },
  { file: 'matcha.jpg', caption: 'Матча', from: '#6F8A69', to: '#D3E0C9', ...square },
  { file: 'croissant.jpg', caption: 'Круассан', from: '#C08A4E', to: '#F4DDB3', ...square },
  { file: 'cinnamon-roll.jpg', caption: 'Булочка с корицей', from: '#A0623B', to: '#EDCFAE', ...square },
  { file: 'syrniki.jpg', caption: 'Сырники', from: '#C99A63', to: '#FBEBD3', ...square },
  { file: 'avocado-toast.jpg', caption: 'Тост с авокадо', from: '#7E9A64', to: '#E9E3C5', ...square },
  { file: 'interior.jpg', caption: 'Интерьер', from: '#6B4A35', to: '#BFA58A', ...wide },
  { file: 'barista.jpg', caption: 'Бариста', from: '#4A3426', to: '#A9876B', ...wide },
  { file: 'flat-white.jpg', caption: 'Флэт уайт', from: '#8E5A3A', to: '#E8C9A6', ...square },
  { file: 'americano.jpg', caption: 'Американо', from: '#3E2A1E', to: '#B07A52', ...square },
  { file: 'raf-halva.jpg', caption: 'Раф с халвой', from: '#B8875E', to: '#F5E3CC', ...square },
  { file: 'cocoa.jpg', caption: 'Какао', from: '#5A3524', to: '#C99872', ...square },
  { file: 'matcha-tonic.jpg', caption: 'Матча-тоник', from: '#7E9A5A', to: '#F2C27A', ...square },
  { file: 'almond-croissant.jpg', caption: 'Миндальный круассан', from: '#B4834A', to: '#F1DDB8', ...square },
  { file: 'cardamom-bun.jpg', caption: 'Булочка с кардамоном', from: '#A26B42', to: '#EFD6B6', ...square },
  { file: 'shop-baumana.jpg', caption: 'Пенка на Баумана', from: '#6B4A35', to: '#C9AE91', ...wide },
  { file: 'shop-universitet.jpg', caption: 'Пенка у университета', from: '#7A6655', to: '#E2D6C6', ...wide },
  { file: 'shop-pobedy.jpg', caption: 'Пенка на Победы', from: '#5F7A58', to: '#D9E2CC', ...wide },
];

function svgFor(s: Spec): string {
  const big = Math.round(Math.min(s.w, s.h) * 0.085);
  const small = Math.round(big * 0.36);
  const title = textToPath(s.caption, textFont, big);
  const note = textToPath(`заглушка · ${s.file}`, textFontRegular, small, 0.02);
  const cx = s.w / 2;
  const cy = s.h / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s.w}" height="${s.h}" viewBox="0 0 ${s.w} ${s.h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${s.from}"/>
      <stop offset="1" stop-color="${s.to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.75" cy="0.2" r="0.7">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <circle cx="${r(s.w * 0.18)}" cy="${r(s.h * 0.82)}" r="${r(Math.min(s.w, s.h) * 0.28)}" fill="${COLORS.foam}" opacity="0.12"/>
  <path transform="translate(${r(cx - title.width / 2)} ${r(cy + big * 0.35)})" fill="${COLORS.foam}" d="${title.d}"/>
  <path transform="translate(${r(cx - note.width / 2)} ${r(cy + big * 0.35 + small * 2.2)})" fill="${COLORS.foam}" opacity="0.8" d="${note.d}"/>
</svg>`;
}

let made = 0;
for (const s of specs) {
  const file = resolve(dir, s.file);
  if (existsSync(file) && !force) {
    console.log('·', s.file, '(уже есть, пропускаю)');
    continue;
  }
  await sharp(Buffer.from(svgFor(s))).jpeg({ quality: 82, mozjpeg: true }).toFile(file);
  console.log('✓', s.file);
  made++;
}
console.log(`Готово: ${made} новых заглушек.`);
