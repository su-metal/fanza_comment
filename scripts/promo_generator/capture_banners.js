const { chromium } = require('playwright');
const path = require('path');

const HTML_FILE = `file://${path.resolve(__dirname, 'banners.html')}`;
const OUT_DIR = path.resolve(__dirname, 'screenshots');

async function run() {
  console.log('Launching browser to capture Web Store Banners...');
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1200 },
    deviceScaleFactor: 1 // Crucial for exact pixel dimensions
  });

  console.log(`Navigating to ${HTML_FILE}`);
  await page.goto(HTML_FILE, { waitUntil: 'networkidle' });

  // 1. Promotional Tile (440x280)
  console.log('Capturing Promotional Tile (440x280)...');
  const promoEl = await page.$('#promo-tile');
  await promoEl.screenshot({ path: path.join(OUT_DIR, 'promo_tile_440x280.png') });

  // 2. Marquee Promotional Tile (1400x560)
  console.log('Capturing Marquee Tile (1400x560)...');
  const marqueeEl = await page.$('#marquee-tile');
  await marqueeEl.screenshot({ path: path.join(OUT_DIR, 'marquee_1400x560.png') });

  console.log('Done! Assets saved in screenshots/ folder.');
  await browser.close();
}

run().catch(console.error);
