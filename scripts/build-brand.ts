// Generates logo SVGs, favicon, PWA icons, OG image and app-store PNGs.
// Run: npm run assets
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { COLORS, MARK_BOX, logoHorizontalSvg, logoStackedSvg, markSvg, textFontRegular } from './lib/brand.ts';
import { r, textToPath } from './lib/text-path.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = (p: string): string => {
  const full = resolve(root, p);
  mkdirSync(dirname(full), { recursive: true });
  return full;
};

const brandColors = { ink: COLORS.ink, foam: COLORS.foam };

async function png(svg: string, path: string, size?: number): Promise<void> {
  let img = sharp(Buffer.from(svg), { density: 300 });
  if (size) img = img.resize(size, size);
  await img.png({ compressionLevel: 9 }).toFile(out(path));
  console.log('✓', path);
}

function svgFile(svg: string, path: string): void {
  writeFileSync(out(path), svg + '\n');
  console.log('✓', path);
}

// --- SVG sources used by the site -------------------------------------------
// Header logo: ink parts follow `currentColor`, so CSS controls the colour.
svgFile(logoHorizontalSvg({ ink: 'currentColor', foam: COLORS.foam }).svg, 'src/assets/brand/logo.svg');
svgFile(markSvg({ ink: 'currentColor', foam: COLORS.foam }), 'src/assets/brand/mark.svg');
svgFile(markSvg(brandColors, 64, COLORS.cream, 0.9), 'public/favicon.svg');
// Full-colour sources for the app project.
svgFile(logoHorizontalSvg(brandColors).svg, 'brand/logo.svg');
svgFile(markSvg(brandColors), 'brand/mark.svg');

// --- App icon and splash (for the WebView app) -------------------------------
await png(markSvg(brandColors, 1024, COLORS.cream, 0.6), 'brand/icon-1024.png', 1024);
await png(logoStackedSvg(brandColors, 1024), 'brand/logo-transparent-1024.png', 1024);

// --- PWA icons ---------------------------------------------------------------
await png(markSvg(brandColors, 192, COLORS.cream, 0.72), 'public/icons/icon-192.png', 192);
await png(markSvg(brandColors, 512, COLORS.cream, 0.72), 'public/icons/icon-512.png', 512);
// Maskable: keep the mark inside the 80% safe zone.
await png(markSvg(brandColors, 512, COLORS.cream, 0.56), 'public/icons/icon-maskable-512.png', 512);
await png(markSvg(brandColors, 180, COLORS.cream, 0.7), 'public/icons/apple-touch-icon.png', 180);

// --- Open Graph image (1200×630) ---------------------------------------------
{
  const W = 1200;
  const H = 630;
  const logo = logoHorizontalSvg(brandColors);
  const logoW = 640;
  const k = logoW / logo.width;
  const logoH = logo.height * k;
  const tagline = textToPath('Кофейни рядом с домом · три точки в городе', textFontRegular, 34);
  const inner = logo.svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<rect width="${W}" height="${H}" fill="${COLORS.cream}"/>` +
    `<circle cx="1110" cy="80" r="190" fill="${COLORS.sage}" opacity=".35"/>` +
    `<circle cx="80" cy="600" r="160" fill="${COLORS.caramel}" opacity=".3"/>` +
    `<g transform="translate(${r((W - logoW) / 2)} ${r(H / 2 - logoH + 20)}) scale(${r(k)}) translate(${-MARK_BOX.x} ${-MARK_BOX.y})">${inner}</g>` +
    `<path transform="translate(${r((W - tagline.width) / 2)} ${r(H / 2 + 90)})" fill="${COLORS.ink}" opacity=".75" d="${tagline.d}"/>` +
    `</svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out('public/og.png'));
  console.log('✓ public/og.png');
}
