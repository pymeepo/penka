// Generates public/files/menu.pdf from src/data (A4, one page, two columns).
// Fonts: Manrope + Unbounded from @fontsource (WOFF). Fontsource splits fonts by subset,
// so text is drawn in runs, each run with the subset that has its characters.
// Run: npm run pdf (also runs before dev and build).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fontkitPdf from '@pdf-lib/fontkit';
import { PDFDocument, rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib';
import sharp from 'sharp';
import { categories, itemsByCategory, milkOptions, sizeOptions, syrupOptions, type MenuItem } from '../src/data/menu.ts';
import { CITY, CONTACT_EMAIL, DEMO_PHONE, locations } from '../src/data/locations.ts';
import { SITE_URL } from '../site.config.mjs';
import { COLORS, logoHorizontalSvg } from './lib/brand.ts';
import { loadFont } from './lib/text-path.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const OUT = resolve(root, 'public/files/menu.pdf');

// --- Colours ---------------------------------------------------------------
const hex = (h: string): RGB => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
const C = {
  cream: hex(COLORS.cream),
  ink: hex(COLORS.ink),
  muted: hex('#6B5A4E'),
  caramel: hex(COLORS.caramel),
  caramelDeep: hex('#8E522C'),
  caramelSoft: hex('#F1DCC8'),
  sageSoft: hex('#DDE6D8'),
  sageDeep: hex('#4F6A4B'),
  card: hex('#FFFCF8'),
  line: hex('#E6D9C8'),
};

// --- Fonts -----------------------------------------------------------------
const doc = await PDFDocument.create();
doc.registerFontkit(fontkitPdf);

interface Face {
  pdf: PDFFont;
  covers: (cp: number) => boolean;
}
type Family = Face[];

async function family(name: string, weight: number): Promise<Family> {
  const subsets = ['latin', 'cyrillic', 'latin-ext'];
  return Promise.all(
    subsets.map(async (subset) => {
      const spec = `@fontsource/${name}/files/${name}-${subset}-${weight}-normal.woff`;
      const pdf = await doc.embedFont(readFileSync(require.resolve(spec)), { subset: true });
      const fk = loadFont(spec);
      return { pdf, covers: (cp: number) => fk.hasGlyphForCodePoint(cp) };
    }),
  );
}

const F = {
  text: await family('manrope', 400),
  bold: await family('manrope', 700),
  display: await family('unbounded', 700),
};

function runs(text: string, fam: Family): Array<{ face: Face; text: string }> {
  const out: Array<{ face: Face; text: string }> = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 32;
    const prev = out.at(-1);
    const face = (ch === ' ' && prev?.face) || fam.find((f) => f.covers(cp)) || fam[0];
    if (prev && prev.face === face) prev.text += ch;
    else out.push({ face, text: ch });
  }
  return out;
}

function width(text: string, fam: Family, size: number): number {
  return runs(text, fam).reduce((w, r) => w + r.face.pdf.widthOfTextAtSize(r.text, size), 0);
}

function draw(page: PDFPage, text: string, x: number, y: number, fam: Family, size: number, color: RGB = C.ink): number {
  let cx = x;
  for (const r of runs(text, fam)) {
    page.drawText(r.text, { x: cx, y, size, font: r.face.pdf, color });
    cx += r.face.pdf.widthOfTextAtSize(r.text, size);
  }
  return cx - x;
}

function wrap(text: string, fam: Family, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (width(next, fam, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Rounded rectangle (pdf-lib has no border radius), origin at bottom-left like drawRectangle. */
function pill(x: number, y: number, w: number, h: number, color: RGB, r = Math.min(h / 2, 14)): void {
  const d = `M${r} 0 H${w - r} A${r} ${r} 0 0 1 ${w} ${r} V${h - r} A${r} ${r} 0 0 1 ${w - r} ${h} H${r} A${r} ${r} 0 0 1 0 ${h - r} V${r} A${r} ${r} 0 0 1 ${r} 0 Z`;
  // drawSvgPath uses SVG coordinates (y down) from the given origin, so flip vertically.
  page.drawSvgPath(d, { x, y: y + h, color, scale: 1, borderWidth: 0 });
}

const rub = (n: number): string => `${new Intl.NumberFormat('ru-RU').format(n).replace(/\s/g, ' ')} ₽`;

// --- Page ------------------------------------------------------------------
const W = 595.28;
const H = 841.89;
const M = 40;
const page = doc.addPage([W, H]);
page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.cream });
page.drawCircle({ x: W + 10, y: H - 20, size: 120, color: C.sageSoft });
page.drawCircle({ x: -30, y: 70, size: 90, color: C.caramelSoft, opacity: 0.8 });

// Logo (rendered from the same SVG as the site, at 3× for print).
const logo = logoHorizontalSvg({ ink: COLORS.ink, foam: COLORS.foam });
const logoH = 30;
const logoW = (logo.width / logo.height) * logoH;
const logoPng = await sharp(Buffer.from(logo.svg)).resize({ height: logoH * 4 }).png().toBuffer();
page.drawImage(await doc.embedPng(logoPng), { x: M, y: H - M - logoH, width: logoW, height: logoH });

const site = new URL(SITE_URL);
const tagline = `Кофейни в ${CITY === 'Казань' ? 'Казани' : CITY} · ${site.host}${site.pathname.replace(/\/$/, '')}`;
draw(page, tagline, W - M - width(tagline, F.text, 9), H - M - 19, F.text, 9, C.muted);

let y = H - M - logoH - 44;
draw(page, 'Меню', M, y, F.display, 30);
y -= 20;
const s = sizeOptions;
const notes = [
  `Напитки: ${s.map((o) => `${o.id} ${o.volume}${o.extra ? ` (+${rub(o.extra)})` : ''}`).join(', ')}.`,
  `Молоко: ${milkOptions.filter((m) => m.extra).map((m) => m.name.toLowerCase()).join(' или ')} +${rub(milkOptions[1].extra)}. Сироп +${rub(syrupOptions[1].extra)}.`,
];
for (const n of notes) {
  draw(page, n, M, y, F.text, 9, C.muted);
  y -= 13;
}
const top = y - 14;

// --- Items in two columns ---------------------------------------------------
const GAP = 26;
const COL = (W - M * 2 - GAP) / 2;
const BOTTOM = 120; // room for the footer

function itemHeight(item: MenuItem): number {
  const desc = wrap(item.description, F.text, 8.5, COL - 6);
  return 14 + desc.length * 11 + (item.options?.sizes ? 11 : 0) + 6;
}

function drawItem(item: MenuItem, x: number, yTop: number): number {
  let yy = yTop - 11;
  const price = rub(item.price);
  const priceW = width(price, F.bold, 11);
  const nameW = draw(page, item.name, x, yy, F.bold, 11);
  let tx = x + nameW + 5;
  const portion = item.options?.sizes ? `${item.portion} (S)` : item.portion;
  tx += draw(page, portion, tx, yy, F.text, 8.5, C.muted) + 6;
  for (const tag of item.tags) {
    const label = tag === 'hit' ? 'хит' : 'новинка';
    const lw = width(label, F.bold, 7) + 10;
    if (tx + lw > x + COL - priceW - 6) break;
    pill(tx, yy - 2.5, lw, 12, tag === 'hit' ? C.caramel : C.sageSoft);
    draw(page, label, tx + 5, yy + 0.5, F.bold, 7, tag === 'hit' ? C.ink : C.sageDeep);
    tx += lw + 4;
  }
  draw(page, price, x + COL - priceW, yy, F.bold, 11);
  if (item.options?.sizes) {
    yy -= 12;
    const sizes = sizeOptions.slice(1).map((o) => `${o.id} ${o.volume} — ${rub(item.price + o.extra)}`).join('    ');
    draw(page, sizes, x, yy, F.text, 8.5, C.caramelDeep);
  }
  for (const line of wrap(item.description, F.text, 8.5, COL - 6)) {
    yy -= 11;
    draw(page, line, x, yy, F.text, 8.5, C.ink);
  }
  yy -= 7;
  page.drawLine({ start: { x, y: yy }, end: { x: x + COL, y: yy }, thickness: 0.5, color: C.line });
  return yy - 6;
}

const columns = [M, M + COL + GAP];
let col = 0;
let cy = top;
for (const cat of categories) {
  const items = itemsByCategory(cat.id);
  if (items.length === 0) continue;
  // Keep a category in one column when it fits; otherwise at least the heading with its first item.
  const catHeight = 26 + items.reduce((h, it) => h + itemHeight(it), 0);
  if (col === 0 && (cy - catHeight < BOTTOM || cy - 26 - itemHeight(items[0]) < BOTTOM)) {
    col = 1;
    cy = top;
  }
  const x = columns[col];
  draw(page, cat.name, x, cy - 14, F.display, 13, C.caramelDeep);
  cy -= 26;
  for (const item of items) {
    if (cy - itemHeight(item) < BOTTOM && col === 0) {
      col = 1;
      cy = top;
    }
    cy = drawItem(item, columns[col], cy);
  }
  cy -= 8;
}
if (cy < BOTTOM - 10) console.warn('⚠ Меню не помещается на одну страницу — уменьшите описания или шрифт.');

// --- Footer -----------------------------------------------------------------
pill(M, 32, W - M * 2, 74, C.card, 12);
const fw = (W - M * 2 - 28) / 3;
locations.forEach((loc, i) => {
  const fx = M + 14 + i * fw;
  draw(page, loc.name, fx, 90, F.bold, 9);
  draw(page, loc.address, fx, 78, F.text, 7.5, C.muted);
  draw(page, loc.hours.map((h) => `${h.days} ${h.time}`).join(', '), fx, 68, F.text, 7.5, C.muted);
});
page.drawLine({ start: { x: M + 14, y: 58 }, end: { x: W - M - 14, y: 58 }, thickness: 0.5, color: C.line });
draw(page, `${DEMO_PHONE} · ${CONTACT_EMAIL}`, M + 14, 42, F.text, 8, C.muted);
const demo = 'Демо-проект: кофейня вымышленная, заказы не принимаются.';
draw(page, demo, W - M - 14 - width(demo, F.bold, 8), 42, F.bold, 8, C.sageDeep);
const updated = `Цены действительны на ${new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(new Date())}`;
draw(page, updated, M, 20, F.text, 7, C.muted);

// --- Metadata & save ------------------------------------------------------------
doc.setTitle('Меню — Пенка');
doc.setAuthor('Пенка (демо)');
doc.setSubject('Меню кофеен «Пенка»');
doc.setLanguage('ru-RU');
doc.setCreator('scripts/menu-pdf.ts');
doc.setProducer('pdf-lib');

mkdirSync(dirname(OUT), { recursive: true });
const bytes = await doc.save();
writeFileSync(OUT, bytes);
console.log(`✓ public/files/menu.pdf (${Math.round(bytes.length / 1024)} КБ)`);
