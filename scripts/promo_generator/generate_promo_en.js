const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const OUT_DIR = path.join(__dirname, 'promo_images', 'en');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function imgToDataUri(filename) {
  const fp = path.join(SCREENSHOTS_DIR, filename);
  if (!fs.existsSync(fp)) {
    console.warn(`WARNING: ${fp} not found!`);
    return '';
  }
  const buf = fs.readFileSync(fp);
  return `data:image/png;base64,${buf.toString('base64')}`;
}

const slides = [
  {
    id: 'promo_01',
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    heading: 'Capture and Revisit <br>Your "Scene Memos"!',
    sub: 'Save personal, timestamped notes while you watch.<br>Get started with a <b>$3.99</b> one-time purchase.',
    layout: 'browser',
    image: 'wide_full_dark_input_en.png'
  },
  {
    id: 'promo_02',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    heading: 'Pin your "Favorites" <br>to the Timeline',
    sub: 'Capture every moving moment.<br>See exactly where your favorite scenes are at a glance.',
    layout: 'closeup',
    image: 'closeup_dark_list_en.png'
  },
  {
    id: 'promo_03',
    bg: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 50%, #6366f1 100%)',
    heading: 'Unobtrusive <br>Design Settings',
    sub: 'Switch instantly between Dark and Light themes.<br>Immerse yourself in your favorites with a custom space.',
    layout: 'compare',
    imageLeft: 'closeup_dark_list_en.png',
    imageRight: 'closeup_light_list_en.png'
  },
  {
    id: 'promo_04',
    bg: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    heading: 'Revisit Your Favorite <br>Scenes Anytime',
    sub: 'Manage previously watched videos in a list.<br>Jump straight back to your "Scene Memos" with ease.',
    layout: 'closeup',
    image: 'closeup_dark_settings_en.png'
  },
  {
    id: 'promo_05',
    bg: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    heading: 'Flexible <br>Viewing Style',
    sub: 'Adjust window size, position, and opacity freely.<br>Your favorites, your space, only <b>$3.99</b> per device.',
    layout: 'browser',
    image: 'wide_full_light_resized_en.png'
  }
];

function buildHtml(slide) {
  let contentHtml = '';

  if (slide.layout === 'browser') {
    const dataUri = imgToDataUri(slide.image);
    contentHtml = `
      <div class="browser">
        <div class="browser-bar">
          <div class="dot r"></div><div class="dot y"></div><div class="dot g"></div>
          <div class="url-bar">youtube.com/watch?v=aqz-KE-bpKQ</div>
        </div>
        <img src="${dataUri}">
      </div>`;
  } else if (slide.layout === 'closeup') {
    const dataUri = imgToDataUri(slide.image);
    contentHtml = `
      <div class="panel-wrap">
        <div class="panel"><img src="${dataUri}"></div>
      </div>`;
  } else if (slide.layout === 'compare') {
    const leftUri = imgToDataUri(slide.imageLeft);
    const rightUri = imgToDataUri(slide.imageRight);
    contentHtml = `
      <div class="compare">
        <div class="compare-col">
          <div class="compare-label">🌙 Dark Theme</div>
          <div class="panel"><img src="${leftUri}"></div>
        </div>
        <div class="compare-col">
          <div class="compare-label">☀️ Light Theme</div>
          <div class="panel"><img src="${rightUri}"></div>
        </div>
      </div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1280px; height: 800px; overflow: hidden;
    font-family: 'Inter', sans-serif;
    background: ${slide.bg};
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 30px 50px;
  }
  .heading {
    color: #fff; font-size: 38px; font-weight: 900;
    text-align: center; margin-bottom: 14px;
    text-shadow: 0 2px 16px rgba(0,0,0,0.25); line-height: 1.2;
  }
  .sub {
    color: rgba(255,255,255,0.92); font-size: 18px; font-weight: 400;
    text-align: center; margin-bottom: 28px;
    text-shadow: 0 1px 8px rgba(0,0,0,0.15);
    max-width: 720px; line-height: 1.5;
  }
  .browser {
    background: #fff; border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    overflow: hidden; max-width: 960px; width: 100%;
  }
  .browser-bar {
    background: #f1f3f5; height: 34px;
    display: flex; align-items: center; padding: 0 14px; gap: 7px;
    border-bottom: 1px solid #ddd;
  }
  .dot { width: 11px; height: 11px; border-radius: 50%; }
  .r { background: #ff5f57; } .y { background: #ffbd2e; } .g { background: #28c840; }
  .url-bar {
    flex:1; margin-left:10px; background:#e8eaed; border-radius:14px;
    height:22px; display:flex; align-items:center; padding:0 12px;
    color:#888; font-size:11px;
  }
  .browser img { width: 100%; display: block; }
  .panel-wrap { display: flex; justify-content: center; }
  .panel {
    border-radius: 14px;
    box-shadow: 0 16px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08);
    overflow: hidden;
  }
  .panel img { display: block; height: 480px; width: auto; }
  .compare { display: flex; gap: 40px; align-items: flex-start; justify-content: center; }
  .compare-col { display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .compare-label {
    color: rgba(255,255,255,0.95); font-size: 18px; font-weight: 700;
    text-shadow: 0 1px 6px rgba(0,0,0,0.2);
  }
  .compare .panel img { height: 420px; }
</style>
</head>
<body>
  <div class="heading">${slide.heading}</div>
  <div class="sub">${slide.sub}</div>
  ${contentHtml}
</body>
</html>`;
}

async function run() {
  console.log('=== English Promo Image Generator ===');
  const browser = await chromium.launch({ headless: true });

  for (const slide of slides) {
    console.log(`Generating ${slide.id}...`);
    const html = buildHtml(slide);
    const tmpFile = path.join(__dirname, `_tmp_${slide.id}_en.html`);
    fs.writeFileSync(tmpFile, html, 'utf-8');

    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`file:///${tmpFile.replace(/\\/g, '/')}`, { waitUntil: 'load' });
    await page.waitForTimeout(2000); 

    const outputPath = path.join(OUT_DIR, `${slide.id}_en.png`);
    await page.screenshot({ path: outputPath, clip: { x: 0, y: 0, width: 1280, height: 800 } });
    console.log(`  Saved: ${slide.id}_en.png`);

    await page.close();
    fs.unlinkSync(tmpFile); 
  }

  await browser.close();
  console.log('All Done.');
}

run();
