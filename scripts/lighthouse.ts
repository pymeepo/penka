// Lighthouse (mobile) over key pages of the production build.
// Run: npm run build && npm run lighthouse
// Reports: .lighthouse/<page>.html; exits with 1 if a score is below the target.
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';
import { SITE_URL } from '../site.config.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 4323;
const DEBUG_PORT = 9223;
const base = `http://localhost:${PORT}${new URL(SITE_URL).pathname}`;
const outDir = resolve(root, '.lighthouse');

const pages: Array<[string, string]> = [
  ['home', ''],
  ['menu', 'menu/'],
  ['menu-item', 'menu/cappuccino/'],
  ['promo-item', 'promo/second-cappuccino/'],
  ['cart', 'cart/'],
  ['order', 'order/'],
  ['account', 'account/'],
  ['contacts', 'contacts/'],
  ['jobs', 'jobs/'],
  ['privacy', 'privacy/'],
];

const targets = { performance: 90, accessibility: 95, 'best-practices': 95, seo: 95 } as const;
type Category = keyof typeof targets;

async function waitFor(url: string, ms = 30_000): Promise<void> {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Сервер не поднялся: ${url}`);
}

const server = spawn(`npx astro preview --port ${PORT}`, { cwd: root, shell: true, stdio: 'ignore' });
let failed = false;
try {
  await waitFor(base);
  mkdirSync(outDir, { recursive: true });
  // Playwright's Chromium with a DevTools port for Lighthouse (chrome-launcher can't spawn it on Windows).
  const browser = await chromium.launch({ args: [`--remote-debugging-port=${DEBUG_PORT}`] });
  try {
    const rows: string[] = [];
    for (const [name, path] of pages) {
      const result = await lighthouse(`${base}${path}`, {
        port: DEBUG_PORT,
        output: 'html',
        logLevel: 'error',
        onlyCategories: Object.keys(targets),
      });
      if (!result) throw new Error(`Lighthouse не вернул результат для ${name}`);
      writeFileSync(resolve(outDir, `${name}.html`), result.report as string);
      const scores = Object.fromEntries(
        (Object.keys(targets) as Category[]).map((c) => [c, Math.round((result.lhr.categories[c]?.score ?? 0) * 100)]),
      ) as Record<Category, number>;
      const bad = (Object.keys(targets) as Category[]).filter((c) => scores[c] < targets[c]);
      if (bad.length) failed = true;
      const row =
        `${name.padEnd(12)} perf ${String(scores.performance).padStart(3)}  a11y ${String(scores.accessibility).padStart(3)}  bp ${String(scores['best-practices']).padStart(3)}  seo ${String(scores.seo).padStart(3)}${bad.length ? `  ✗ ${bad.join(', ')}` : '  ✓'}`;
      rows.push(row);
      console.log(row);
      // Failed audits help to fix things quickly.
      for (const c of bad) {
        const refs = result.lhr.categories[c]?.auditRefs ?? [];
        for (const ref of refs) {
          const audit = result.lhr.audits[ref.id];
          if (ref.weight > 0 && audit && audit.score !== null && audit.score < 0.9) {
            rows.push(`    · [${c}] ${audit.id}: ${audit.title}${audit.displayValue ? ` (${audit.displayValue})` : ''}`);
          }
        }
      }
    }
    writeFileSync(resolve(outDir, 'summary.txt'), rows.join('\n') + '\n');
  } finally {
    await browser.close();
  }
} finally {
  server.kill();
  if (process.platform === 'win32' && server.pid) spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
}
process.exit(failed ? 1 : 0);
