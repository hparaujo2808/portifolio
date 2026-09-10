import { chromium } from 'playwright';
const out = process.argv[2];
const width = Number(process.argv[3] || 1440);
const height = Number(process.argv[4] || 900);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, colorScheme: 'dark' });
await page.goto('http://localhost:4321/');
await page.waitForTimeout(800);
await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = 'auto';
  const el = document.getElementById('steps');
  const y = el.getBoundingClientRect().bottom + scrollY - innerHeight * 0.25;
  scrollTo(0, y);
});
await page.waitForTimeout(1200);
await page.screenshot({ path: out });
await browser.close();
