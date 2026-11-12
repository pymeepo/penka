// Brand constants and SVG builders shared by build scripts.
import { fontStack, textToPath, r } from './text-path.ts';

export const COLORS = {
  cream: '#F7F1E8',
  ink: '#2B1D14',
  caramel: '#C8875B',
  sage: '#8FA58A',
  foam: '#FFFAF3',
} as const;

export const displayFont = fontStack(
  '@fontsource/unbounded/files/unbounded-cyrillic-700-normal.woff2',
  '@fontsource/unbounded/files/unbounded-latin-700-normal.woff2',
);

export const textFont = fontStack(
  '@fontsource/manrope/files/manrope-cyrillic-700-normal.woff2',
  '@fontsource/manrope/files/manrope-latin-700-normal.woff2',
);

export const textFontRegular = fontStack(
  '@fontsource/manrope/files/manrope-cyrillic-400-normal.woff2',
  '@fontsource/manrope/files/manrope-latin-400-normal.woff2',
);

interface MarkColors {
  ink: string;
  foam: string;
}

/**
 * The mark: a cup with a puffy foam cap, drawn in a 64×64 box.
 * The foam outline is made by drawing bigger ink circles under the foam circles,
 * which gives a clean union outline without boolean path ops.
 */
export function markGroup({ ink, foam }: MarkColors): string {
  // Bottom bubbles end exactly at y = 36, so the foam meets the cup in a clean line.
  const bubbles: Array<[number, number, number]> = [
    [18.5, 28.5, 7.5],
    [28.5, 22.5, 10],
    [40.5, 24.5, 9],
    [48.5, 30, 6],
  ];
  const outline = 2.75;
  const base = 'M14 28h36v8H14z';
  const inkBubbles = bubbles
    .map(([cx, cy, rad]) => `<circle cx="${cx}" cy="${cy}" r="${rad + outline}"/>`)
    .join('');
  const foamBubbles = bubbles
    .map(([cx, cy, rad]) => `<circle cx="${cx}" cy="${cy}" r="${rad}"/>`)
    .join('');
  return [
    `<g fill="${ink}">${inkBubbles}</g>`,
    `<path d="M52 37.5h2.5a6.5 6.5 0 0 1 0 13H50" fill="none" stroke="${ink}" stroke-width="4.5" stroke-linecap="round"/>`,
    `<path d="M10.5 34H53.5V40C53.5 51.8 44.5 58.5 32 58.5S10.5 51.8 10.5 40Z" fill="${ink}"/>`,
    `<g fill="${foam}">${foamBubbles}<path d="${base}"/></g>`,
  ].join('');
}

// Visual bounding box of markGroup(): x 8.25…63.25, y 9.75…58.5.
export const MARK_BOX = { x: 8.25, y: 9.75, w: 55, h: 48.75 };

/** Square mark, optically centred. `scale` is the share of the canvas the mark's width takes. */
export function markSvg(colors: MarkColors, size = 64, background?: string, scale = 0.94): string {
  const vb = MARK_BOX.w / scale;
  const x0 = MARK_BOX.x + MARK_BOX.w / 2 - vb / 2;
  // Nudge down a little: the foam cap is visually lighter than the cup.
  const y0 = MARK_BOX.y + MARK_BOX.h / 2 - vb / 2 - vb * 0.01;
  const bg = background ? `<rect x="${r(x0)}" y="${r(y0)}" width="${r(vb)}" height="${r(vb)}" fill="${background}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${r(x0)} ${r(y0)} ${r(vb)} ${r(vb)}">${bg}${markGroup(colors)}</svg>`;
}

/** Horizontal lockup: mark + «Пенка». `ink` may be `currentColor`. */
export function logoHorizontalSvg(colors: MarkColors): { svg: string; width: number; height: number } {
  const size = 34;
  const word = textToPath('Пенка', displayFont, size, -0.01);
  const gap = 10;
  const wordX = MARK_BOX.x + MARK_BOX.w + gap;
  const width = wordX + word.width + 1 - MARK_BOX.x;
  const height = MARK_BOX.h + 1;
  const baseline = 49;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_BOX.x} ${MARK_BOX.y} ${r(width)} ${r(height)}" role="img" aria-label="Пенка">` +
    markGroup(colors) +
    `<path transform="translate(${r(wordX)} ${baseline})" fill="${colors.ink}" d="${word.d}"/>` +
    `</svg>`;
  return { svg, width, height };
}

/** Stacked lockup centred in a square canvas (for splash screens). */
export function logoStackedSvg(colors: MarkColors, canvas: number, background?: string): string {
  const markW = canvas * 0.46;
  const k = markW / MARK_BOX.w;
  const markH = MARK_BOX.h * k;
  const fontSize = canvas * 0.13;
  const word = textToPath('Пенка', displayFont, fontSize, -0.01);
  const capH = fontSize * 0.74;
  const gap = canvas * 0.06;
  const top = (canvas - (markH + gap + capH)) / 2;
  const baseline = top + markH + gap + capH;
  const bg = background ? `<rect width="${canvas}" height="${canvas}" fill="${background}"/>` : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas}" height="${canvas}" viewBox="0 0 ${canvas} ${canvas}">` +
    bg +
    `<g transform="translate(${r((canvas - markW) / 2 - MARK_BOX.x * k)} ${r(top - MARK_BOX.y * k)}) scale(${r(k)})">${markGroup(colors)}</g>` +
    `<path transform="translate(${r((canvas - word.width) / 2)} ${r(baseline)})" fill="${colors.ink}" d="${word.d}"/>` +
    `</svg>`
  );
}
