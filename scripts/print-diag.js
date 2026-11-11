// Diagnose print layout of the report cover: measure element heights under print media.
const path = '/opt/zcode/rt/runtime/node_modules/playwright-core';
const { chromium } = require(path);

(async () => {
  const browser = await chromium.launch({ executablePath: '/home/z/.cache/ms-playwright/chromium_headless_shell-1200/chrome-headless-shell-linux64/chrome-headless-shell' });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  // load the demo project from the landing page
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent.includes('تجربة فورية') || b.textContent.includes('Essai immédiat') || b.textContent.includes('Instant try')).click());
  await page.waitForTimeout(3000);
  await page.goto('http://localhost:3000/#/report', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.emulateMedia({ media: 'print' });
  const data = await page.evaluate(() => {
    const cover = document.querySelector('.report-cover');
    const cs = getComputedStyle(cover);
    const kids = [...cover.children].map(k => ({
      tag: k.tagName, cls: (k.className || '').toString().slice(0, 60),
      h: Math.round(k.getBoundingClientRect().height),
      mt: getComputedStyle(k).marginTop,
    }));
    return {
      coverH: Math.round(cover.getBoundingClientRect().height),
      minH: cs.minHeight, height: cs.height, justify: cs.justifyContent,
      coverHmm: Math.round(cover.getBoundingClientRect().height / 3.7795),
      kids,
    };
  });
  console.log(JSON.stringify(data, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
