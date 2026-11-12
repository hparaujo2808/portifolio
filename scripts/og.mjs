// Gera public/og.png (1200x630), a imagem de prévia do link no WhatsApp e redes.
// Uso: node scripts/og.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const font = readFileSync('node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2').toString('base64');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Geist; src: url(data:font/woff2;base64,${font}) format('woff2'); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #0b0e14; color: #e9edf3; font-family: Geist, sans-serif;
  padding: 72px 80px; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; }
.top { display: flex; align-items: center; gap: 18px; font-size: 34px; font-weight: 600; letter-spacing: -0.02em; }
h1 { font-size: 92px; line-height: 1; letter-spacing: -0.045em; font-weight: 600; }
h1 em { font-style: normal; color: #2fd9c5; display: block; }
.foot { display: flex; justify-content: space-between; font-size: 26px; color: #8d95a3; }
.big { position: absolute; right: -40px; top: 50%; transform: translateY(-50%); opacity: 0.9; }
</style></head><body>
<div class="top">${mark(46)} Oblique</div>
<h1>Seu negócio<br>não é um template.<em>Seu site também não.</em></h1>
<div class="foot"><span>Sites sob medida · Belo Horizonte</span><span>Um ângulo só seu.</span></div>
</body></html>`;

function mark(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" stroke="#e9edf3" stroke-width="2.4" stroke-linecap="round">
<path d="M4 8h6M13 8h6M22 8h6M4 16h6M22 16h6M4 24h6M13 24h6M22 24h6"/><path d="M14 13l4 6" stroke="#2fd9c5"/></svg>`;
}

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html);
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: 'public/og.png' });
await b.close();
