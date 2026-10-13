// Reel de 30 s em motion graphics (1080x1920, 30 fps), quadro a quadro: reels.html expõe render(t, f).
//   node scripts/reels/render.mjs <pasta-de-quadros> [segundo-inicial segundo-final]
//   ffmpeg -framerate 30 -i <pasta>/%04d.jpg -c:v libx264 -pix_fmt yuv420p -crf 17 reels.mp4
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = process.argv[2] || 'reels-frames';
const FPS = 30;
const T0 = Number(process.argv[3] ?? 0);
const T1 = Number(process.argv[4] ?? 30);
mkdirSync(OUT, { recursive: true });

const html = join(dirname(fileURLToPath(import.meta.url)), 'reels.html');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(html).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

for (let f = Math.round(T0 * FPS); f < Math.round(T1 * FPS); f++) {
  await page.evaluate(([t, f]) => window.render(t, f), [f / FPS, f]);
  await page.screenshot({ path: `${OUT}/${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 93 });
  if (f % 150 === 0) console.log(`${f}/${T1 * FPS}`);
}
await browser.close();
console.log('ok');
