import { chromium, devices } from 'playwright';
const out = process.argv[2];
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['Pixel 7'], colorScheme: 'dark' });
const page = await ctx.newPage();
await page.goto('http://localhost:4321/');
await page.waitForTimeout(1800);
await page.screenshot({ path: out });
await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = 'auto';
  document.getElementById('contact').scrollIntoView();
});
await page.waitForTimeout(600);
await page.screenshot({ path: out.replace('.png', '-contact.png') });
await browser.close();
