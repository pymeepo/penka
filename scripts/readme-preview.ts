// Builds docs/preview.jpg for the README: first screen of four pages side by side.
// Run after `npm test` (it reads screenshots/*.jpg): npm run preview-image
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { COLORS } from './lib/brand.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const shots = ['home', 'menu', 'menu-item', 'contacts'];
const W = 360;
const H = 760;
const GAP = 28;
const PAD = 40;
const R = 28;

const mask = Buffer.from(`<svg width="${W}" height="${H}"><rect width="${W}" height="${H}" rx="${R}" fill="#fff"/></svg>`);

const tiles = await Promise.all(
  shots.map(async (name) =>
    sharp(resolve(root, `screenshots/${name}.jpg`))
      .resize({ width: W })
      .extract({ left: 0, top: 0, width: W, height: H })
      .composite([{ input: mask, blend: 'dest-in' }])
      .png()
      .toBuffer(),
  ),
);

const width = PAD * 2 + shots.length * W + (shots.length - 1) * GAP;
const height = PAD * 2 + H;
const shadow = Buffer.from(
  `<svg width="${width}" height="${height}">${shots
    .map((_, i) => `<rect x="${PAD + i * (W + GAP)}" y="${PAD + 10}" width="${W}" height="${H}" rx="${R}" fill="#2B1D14" opacity=".12"/>`)
    .join('')}</svg>`,
);

const out = resolve(root, 'docs/preview.jpg');
mkdirSync(dirname(out), { recursive: true });
await sharp({ create: { width, height, channels: 3, background: '#EFE3D3' } })
  .composite([
    { input: await sharp(shadow).blur(14).png().toBuffer(), left: 0, top: 0 },
    ...tiles.map((input, i) => ({ input, left: PAD + i * (W + GAP), top: PAD })),
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(out);
console.log('✓ docs/preview.jpg');
