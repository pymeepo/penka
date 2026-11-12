// Text → SVG path conversion using fontkit.
// Lets build scripts render Cyrillic text into SVG/PNG without relying on system fonts.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as fontkit from 'fontkit';

const require = createRequire(import.meta.url);

// Minimal structural types for the parts of fontkit we use.
interface FkPath {
  scale(sx: number, sy?: number): FkPath;
  translate(x: number, y: number): FkPath;
  toSVG(): string;
}
interface FkGlyph {
  path: FkPath;
}
interface FkPosition {
  xAdvance: number;
  xOffset: number;
  yOffset: number;
}
interface FkFont {
  unitsPerEm: number;
  ascent: number;
  descent: number;
  hasGlyphForCodePoint(cp: number): boolean;
  layout(text: string): { glyphs: FkGlyph[]; positions: FkPosition[] };
}

const cache = new Map<string, FkFont>();

/** Opens a font file shipped in an npm package, e.g. `@fontsource/manrope/files/manrope-latin-700-normal.woff2`. */
export function loadFont(spec: string): FkFont {
  const cached = cache.get(spec);
  if (cached) return cached;
  const file = require.resolve(spec);
  const font = (fontkit as unknown as { create(b: Buffer): FkFont }).create(readFileSync(file));
  cache.set(spec, font);
  return font;
}

/** Fontsource splits fonts by subset, so pass several files; each char uses the first font that has it. */
export function fontStack(...specs: string[]): FkFont[] {
  return specs.map(loadFont);
}

interface Run {
  font: FkFont;
  text: string;
}

function splitRuns(text: string, fonts: FkFont[]): Run[] {
  const runs: Run[] = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 32;
    const prev = runs.at(-1);
    // Whitespace sticks to the current run to keep kerning stable.
    const font =
      (ch.trim() === '' && prev?.font) ||
      fonts.find((f) => f.hasGlyphForCodePoint(cp)) ||
      fonts[0];
    if (prev && prev.font === font) prev.text += ch;
    else runs.push({ font, text: ch });
  }
  return runs;
}

export interface TextPath {
  d: string;
  width: number;
  /** Distance from baseline to cap top, in px (approximate, from ascent). */
  ascent: number;
  descent: number;
}

/**
 * Lays out `text` at `size` px with the baseline at y = 0 and the start at x = 0.
 * `tracking` is extra letter spacing in em.
 */
export function textToPath(text: string, fonts: FkFont[], size: number, tracking = 0): TextPath {
  let x = 0;
  const parts: string[] = [];
  let ascent = 0;
  let descent = 0;
  for (const run of splitRuns(text, fonts)) {
    const s = size / run.font.unitsPerEm;
    ascent = Math.max(ascent, run.font.ascent * s);
    descent = Math.max(descent, -run.font.descent * s);
    const { glyphs, positions } = run.font.layout(run.text);
    glyphs.forEach((glyph, i) => {
      const pos = positions[i];
      const p = glyph.path.scale(s, -s).translate(x + pos.xOffset * s, -pos.yOffset * s);
      parts.push(p.toSVG());
      x += pos.xAdvance * s + tracking * size;
    });
  }
  if (text.length > 0) x -= tracking * size;
  return { d: parts.join(''), width: x, ascent, descent };
}

export const r = (n: number): string => (Math.round(n * 100) / 100).toString();
