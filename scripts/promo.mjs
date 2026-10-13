// Vídeo promocional vertical (1080x1920, 30 fps) gravado do site no ar, quadro a quadro.
// O relógio da página é falso (page.clock) e as transições CSS são posicionadas à mão em cada
// quadro, então o movimento sai na velocidade real mesmo com a captura lenta.
//   node scripts/promo.mjs <pasta-de-quadros>
//   ffmpeg -framerate 30 -i <pasta>/%04d.jpg -c:v libx264 -pix_fmt yuv420p -crf 18 promo.mp4
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const URL = process.env.PROMO_URL || 'https://henrique-araujo.netlify.app/';
const OUT = process.argv[2] || 'promo-frames';
const FPS = 30;
const DUR = 24;
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 405, height: 720 },
  deviceScaleFactor: 1080 / 405,
  isMobile: true,
  hasTouch: true,
  colorScheme: 'dark',
  locale: 'pt-BR',
});
const page = await ctx.newPage();
await page.clock.install({ time: new Date('2026-10-13T12:00:00') });
await page.goto(URL, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const pos = await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = 'auto';
  const top = (id) => document.getElementById(id).getBoundingClientRect().top + scrollY;
  return {
    about: top('about') - 96,
    process: top('process') - 96,
    services: top('services') - 96,
    contact: top('contact') - 120,
    stepsH: document.getElementById('steps').offsetHeight,
    servicesH: document.getElementById('services').offsetHeight,
  };
});

// Camada de legendas e cartão final, com a fonte e as cores do próprio site
await page.evaluate(() => {
  // selo "Powered by Netlify" que o Netlify injeta no site publicado
  for (const el of document.querySelectorAll('body *'))
    if (/powered by/i.test(el.textContent || '') && getComputedStyle(el).position === 'fixed') el.remove();
  document.querySelectorAll('netlify-badge, [id*=netlify], iframe').forEach((el) => el.remove());
  const st = document.createElement('style');
  st.textContent = `
    #promo-cap{position:fixed;left:22px;right:22px;bottom:46px;z-index:9999;pointer-events:none;
      font:600 25px/1.15 Geist,sans-serif;letter-spacing:-.02em;color:#fff;
      background:rgba(6,10,20,.82);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.08);
      border-left:3px solid var(--accent);border-radius:14px;padding:16px 18px;opacity:0}
    #promo-end{position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;justify-content:center;
      padding:0 34px;gap:22px;background:var(--bg,#05080f);color:#fff;font-family:Geist,sans-serif;opacity:0}
    #promo-end svg{width:64px;height:64px;color:#fff}
    #promo-end svg .acc{color:var(--accent)}
    #promo-end h2{font:600 40px/1.05 Geist,sans-serif;letter-spacing:-.035em;margin:0}
    #promo-end h2 span{color:var(--accent)}
    #promo-end .url{font:500 19px Geist,sans-serif;color:var(--accent);letter-spacing:-.01em}
    #promo-end .sub{font:400 15px/1.4 Geist,sans-serif;color:rgba(255,255,255,.6)}
    #promo-end .cta{align-self:flex-start;margin-top:6px;padding:13px 20px;border-radius:999px;
      background:var(--accent);color:#04121a;font:600 16px Geist,sans-serif}`;
  document.head.append(st);
  const cap = document.createElement('div');
  cap.id = 'promo-cap';
  const end = document.createElement('div');
  end.id = 'promo-end';
  const mark = document.querySelector('svg.mark')?.outerHTML || '';
  end.innerHTML = `${mark}
    <h2>Seu site<br>não é um <span>template.</span></h2>
    <div class="sub">Sites feitos do zero, sob medida.<br>Belo Horizonte, para o Brasil e o mundo.</div>
    <div class="url">henrique-araujo.netlify.app</div>
    <div class="cta">Chama no WhatsApp</div>`;
  end.querySelector('svg')?.setAttribute('width', '64');
  end.querySelector('svg')?.setAttribute('height', '64');
  document.body.append(cap, end);
  window.__anims = new Map();
});

const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a, b, x) => a + (b - a) * x;

// [início, fim, de, até, curva]
const rolagem = [
  [0, 3.8, 0, 0, 'lin'],
  [3.8, 5, 0, pos.about, 'ease'],
  [5, 8.2, pos.about, pos.about + 260, 'lin'],
  [8.2, 9.2, pos.about + 260, pos.process, 'ease'],
  [9.2, 13.2, pos.process, pos.process + Math.max(200, pos.stepsH - 420), 'lin'],
  [13.2, 14.2, pos.process + Math.max(200, pos.stepsH - 420), pos.services, 'ease'],
  [14.2, 17.6, pos.services, pos.services + Math.max(200, pos.servicesH - 640), 'lin'],
  [17.6, 18.7, pos.services + Math.max(200, pos.servicesH - 640), pos.contact, 'ease'],
  [18.7, DUR, pos.contact, pos.contact, 'lin'],
];
const legendas = [
  [5.2, 8.0, 'Quem constrói é quem atende. Do primeiro papo ao site no ar.'],
  [9.4, 13.0, 'Escopo, prazo e preço fechados antes da primeira linha de código.'],
  [14.4, 17.4, 'Landing page, institucional ou sob medida.'],
  [18.9, 20.4, 'Um clique e a conversa começa no WhatsApp.'],
];

function scrollEm(t) {
  for (const [a, b, de, ate, c] of rolagem) {
    if (t >= a && t < b) {
      const x = (t - a) / (b - a);
      return lerp(de, ate, c === 'ease' ? ease(x) : x);
    }
  }
  return rolagem.at(-1)[3];
}

const total = FPS * DUR;
for (let f = 0; f < total; f++) {
  const t = f / FPS;
  await page.clock.runFor(1000 / FPS);
  const leg = legendas.find(([a, b]) => t >= a - 0.3 && t < b + 0.3);
  let capOp = 0;
  if (leg) capOp = Math.min(1, (t - (leg[0] - 0.3)) / 0.3, (leg[1] + 0.3 - t) / 0.3);
  const endX = Math.max(0, Math.min(1, (t - 20.5) / 0.6));
  await page.evaluate(
    ({ y, now, cap, capOp, endX }) => {
      scrollTo(0, y);
      dispatchEvent(new Event('scroll'));
      // transições CSS andam no tempo virtual, não no relógio de parede
      for (const an of document.getAnimations()) {
        if (!window.__anims.has(an)) window.__anims.set(an, now);
        an.pause();
        an.currentTime = now - window.__anims.get(an);
      }
      const c = document.getElementById('promo-cap');
      if (cap) c.textContent = cap;
      c.style.opacity = capOp;
      c.style.transform = `translateY(${(1 - capOp) * 14}px)`;
      const e = document.getElementById('promo-end');
      e.style.opacity = endX;
      e.style.transform = `scale(${1.04 - 0.04 * endX})`;
    },
    { y: scrollEm(t), now: f * (1000 / FPS), cap: leg?.[2], capOp, endX },
  );
  await page.screenshot({ path: `${OUT}/${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92 });
  if (f % 90 === 0) console.log(`${f}/${total}`);
}
await browser.close();
console.log('ok');
