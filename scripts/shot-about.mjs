import { chromium } from 'playwright';
const out = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:4321/');
await page.waitForTimeout(800);
await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = 'auto';
  document.getElementById('about').scrollIntoView(); scrollBy(0, 420);
});
await page.waitForTimeout(800);
await page.screenshot({ path: out });
await browser.close();
