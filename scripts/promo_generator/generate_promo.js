const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const OUT_DIR = path.join(__dirname, 'promo_images');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

// Convert image to base64 data URI
function imgToDataUri(filename) {
  const fp = path.join(SCREENSHOTS_DIR, filename);
  if (!fs.existsSync(fp)) {
    console.warn(`WARNING: ${fp} not found!`);
    return '';
  }
  const buf = fs.readFileSync(fp);
  console.log(`  Converting ${filename} (${buf.length} bytes) to data URI...`);
  return `data:image/png;base64,${buf.toString('base64')}`;
}

// Slide definitions
const slides = [
  {
    id: 'promo_01',
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    heading: '動画の「神シーン」を<br>逃さず記録！',
    sub: '再生中の動画にタイムスタンプ付きの自分専用メモを残せる。<br>気になるシーンをワンクリックですぐ見返せます。',
    layout: 'browser',
    image: 'full_dark_input.png',
    pills: null
  },
  {
    id: 'promo_02',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    heading: '自分だけの「お気に入り」を<br>タイムラインに',
    sub: '心が動いた瞬間を逃さずチェック。お気に入りシーンが<br>どこにあるか、タイムライン上で一目でわかります。',
    layout: 'closeup',
    image: 'closeup_dark_burst.png',
    pills: null
  },
  {
    id: 'promo_03',
    bg: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 50%, #6366f1 100%)',
    heading: '視聴を邪魔しない<br>デザイン設定',
    sub: '動画に合わせて、ダーク＆ライトテーマを瞬時に切り替え。<br>自分好みの視聴空間で、お気に入りシーンに没頭できます。',
    layout: 'compare',
    imageLeft: 'closeup_dark_burst.png',
    imageRight: 'closeup_light_list.png',
    pills: null
  },
  {
    id: 'promo_04',
    bg: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    heading: '好きなシーンを<br>いつでも見返す',
    sub: '過去にチェックした動画もリストで管理。あの時の<br>「神シーン」へ、ワンクリックですぐにジャンプ。',
    layout: 'closeup',
    image: 'closeup_dark_settings.png',
    pills: null
  },
  {
    id: 'promo_05',
    bg: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    heading: '自由自在な<br>視聴スタイル',
    sub: 'ウィンドウのサイズ、位置、透過率を好みに合わせて調整。<br>視聴スタイルを邪魔しない、自分だけの快適な画面へ。',
    layout: 'browser',
    image: 'full_light_resized.png',
    pills: null
  }
];

function buildHtml(slide) {
  const pillsHtml = slide.pills
    ? `<div class="pills">${slide.pills.map(p => `<span class="pill">${p}</span>`).join('')}</div>`
    : '';

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
          <div class="compare-label">🌙 ダークテーマ</div>
          <div class="panel"><img src="${leftUri}"></div>
        </div>
        <div class="compare-col">
          <div class="compare-label">☀️ ライトテーマ</div>
          <div class="panel"><img src="${rightUri}"></div>
        </div>
      </div>`;
  }

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1280px; height: 800px; overflow: hidden;
    font-family: 'Noto Sans JP', sans-serif;
    background: ${slide.bg};
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 30px 50px;
  }
  .heading {
    color: #fff; font-size: 38px; font-weight: 900;
    text-align: center; margin-bottom: 14px;
    text-shadow: 0 2px 16px rgba(0,0,0,0.25); line-height: 1.35;
  }
  .sub {
    color: rgba(255,255,255,0.92); font-size: 16px; font-weight: 400;
    text-align: center; margin-bottom: 28px;
    text-shadow: 0 1px 8px rgba(0,0,0,0.15);
    max-width: 680px; line-height: 1.55;
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
    color: rgba(255,255,255,0.95); font-size: 16px; font-weight: 700;
    text-shadow: 0 1px 6px rgba(0,0,0,0.2);
  }
  .compare .panel img { height: 420px; }
  .pills { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; justify-content: center; }
  .pill {
    background: rgba(255,255,255,0.18); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.3); color: #fff;
    padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 700;
  }
</style>
</head>
<body>
  ${pillsHtml}
  <div class="heading">${slide.heading}</div>
  <div class="sub">${slide.sub}</div>
  ${contentHtml}
</body>
</html>`;
}

async function run() {
  console.log('=== Promo Image Generator v2 (inline base64) ===');

  const browser = await chromium.launch({ headless: true });

  for (const slide of slides) {
    console.log(`Generating ${slide.id}...`);

    const html = buildHtml(slide);
    const tmpFile = path.join(__dirname, `_tmp_${slide.id}.html`);
    fs.writeFileSync(tmpFile, html, 'utf-8');

    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`file:///${tmpFile.replace(/\\/g, '/')}`, { waitUntil: 'load' });
    await page.waitForTimeout(1500); // wait for fonts + images

    const timestamp = Date.now();
    const filename = `${slide.id}_${timestamp}.png`;
    const outputPath = path.join(OUT_DIR, filename);
    await page.screenshot({
      path: outputPath,
      clip: { x: 0, y: 0, width: 1280, height: 800 }
    });
    console.log(`  Saved: ${filename}`);

    // Update slides array to store the actual filename for printing at the end
    slide.actualFilename = filename;

    await page.close();
    fs.unlinkSync(tmpFile); // cleanup
  }

  await browser.close();
  console.log('\n=== Done! ===');
  console.log('Final Filenames:');
  slides.forEach(s => console.log(`  ${s.id}: ${s.actualFilename}`));
  console.log(`Output: ${OUT_DIR}`);
}

run().catch(e => { console.error('Error:', e); process.exit(1); });
