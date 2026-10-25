const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');

const EXTENSION_PATH = path.join(__dirname, '..', '..', 'extension');
const OUT_DIR = path.join(__dirname, 'screenshots');
const PROFILE_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'scene-memo-capture-ja-'));
const LICENSE_VERIFY_URL = 'https://asia-northeast1-fanza-comment-lic-20260303.cloudfunctions.net/licenseApi/verify-device';
let captureContext;

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

const DUMMY_COMMENTS = [
  { text: "ここほんと最高…", t: 15 },
  { text: "★ここの表情、神すぎる", t: 80 },
  { text: "アングル分かってんなー", t: 160 },
  { text: "衣装めちゃくちゃ似合ってる", t: 250 },
  { text: "[重要] 何度見ても鳥肌", t: 330 },
  { text: "ここ、絶対また見返す", t: 375 },
  { text: "このライティング、センスある", t: 420 },
  { text: "★保存版決定", t: 500 }
];

async function run() {
  console.log('=== Screenshot Capture (v2 - top-left, closeups) ===');

  const ctx = captureContext = await chromium.launchPersistentContext(PROFILE_DIR, {
    timezoneId: 'Asia/Tokyo',
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      `--window-size=1600,1000`,
      '--disable-blink-features=AutomationControlled'
    ],
    viewport: { width: 1600, height: 1000 }
  });

  // --- Get extension ID from its Manifest V3 service worker ---
  console.log('Finding extension ID...');
  let worker = ctx.serviceWorkers().find(w => w.url().startsWith('chrome-extension://'));
  if (!worker) worker = await ctx.waitForEvent('serviceworker', { timeout: 15000 });
  const extensionId = worker.url().split('/')[2];
  console.log('Extension ID:', extensionId);
  if (!extensionId) throw new Error('Extension ID not found');
  await ctx.route(LICENSE_VERIFY_URL, route => {
    const headers = {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type'
    };
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers, body: '' });
    return route.fulfill({ status: 200, contentType: 'application/json', headers, body: JSON.stringify({ ok: true, is_pro: false }) });
  });

  // --- Inject dummy comments ---
  console.log('Injecting dummy comments...');
  const popup = await ctx.newPage();
  console.log('Opening extension popup page...');
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await popup.waitForTimeout(1000);
  console.log('Writing sample comments to extension storage...');

  await popup.evaluate(async (comments) => {
    const payload = {
      fanza_memo_is_pro_purchased: false,
      fanza_memo_is_beta_grandfathered: true,
      fanza_memo_dev_force_locale: 'ja'
    };
    const site = 'youtube';
    const makeComment = (text, t, videoId) => ({
      id: Math.random(), comment_id: `sample-${Date.now()}-${Math.random()}`,
      schema_version: 1, site, video_id: videoId, t, text,
      work_key: videoId, isLocal: true, visibility: 'private',
      created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    });
    const addVideo = (id, title, rows, offset = 0) => {
      payload[`video_memo_comments_${site}_${id}`] = rows.map(row => makeComment(row.text, row.t, id));
      payload[`video_memo_meta_${site}_${id}`] = {
        title, url: `https://www.youtube.com/watch?v=${id.replace(/^yt_/, '')}`,
        site, videoId: id, updatedAt: Date.now() - offset
      };
    };
    addVideo('yt_aqz-KE-bpKQ', 'Big Buck Bunny 60fps 4K - Blender公式短編', comments);
    [
      ['yt_YE7VzlLtp-4', 'Spring - Blender Animation', 12],
      ['yt_WhWc3b3KhnY', 'Sintel - Full Movie', 8],
      ['yt_mN0zPOpADL4', 'Caminandes 3: Llamigos', 5],
      ['yt_3wzW2shAdf4', 'Cosmos Laundromat', 24],
      ['yt_v2X98V0T9yM', 'Coffee Run - Short Film', 3],
      ['yt_dpv65XN7rF8', 'Hero - 2D Animation', 15],
      ['yt_vYenZAbT7X4', 'Elephant Dream', 7],
      ['yt_aqz-KE-bpKQ_old', 'Big Buck Bunny (Previous)', 20]
    ].forEach(([id, title, count], index) => addVideo(
      id, title, Array.from({ length: count }, (_, i) => ({ text: `Sample comment ${i + 1}`, t: i * 30 })), (index + 1) * 86400000
    ));
    await chrome.storage.local.set(payload);
    const stored = await chrome.storage.local.get(Object.keys(payload));
    if (Object.keys(payload).some(key => !(key in stored))) throw new Error('Sample data was not persisted');
  }, DUMMY_COMMENTS);

  console.log('Sample comments written.');
  await popup.reload({ waitUntil: 'domcontentloaded' });
  await popup.evaluate(() => window.extI18n?.ready);
  await popup.waitForFunction(() => !/checking|確認中/i.test(document.querySelector('#license-status')?.textContent || ''), null, { timeout: 10000 });
  await popup.locator('body').screenshot({ path: path.join(OUT_DIR, 'popup_dark_ja.png'), animations: 'disabled' });
  await popup.setViewportSize({ width: 1365, height: 900 });
  await popup.goto(`chrome-extension://${extensionId}/onboarding.html`, { waitUntil: 'domcontentloaded' });
  await popup.evaluate(() => window.extI18n?.ready);
  await popup.waitForFunction(() => {
    const status = document.querySelector('#license-status')?.textContent || '';
    const restoreCard = document.querySelector('#restore-card');
    return !/checking|確認中/i.test(status) && restoreCard?.style.display === 'none';
  }, null, { timeout: 10000 });
  await popup.screenshot({ path: path.join(OUT_DIR, 'onboarding_ja.png'), fullPage: true, animations: 'disabled' });
  await popup.close();
  console.log('Done. UI state cleared to force top-left default.');

  // --- Navigate to YouTube ---
  const page = await ctx.newPage();
  
  // PAGE CONSOLE LOGGING
  page.on('console', msg => {
    console.log(`[PAGE LOG ${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  console.log('Preparing a local YouTube-shaped player page...');
  await page.route('https://www.youtube.com/watch**', route => route.fulfill({
    status: 200,
    contentType: 'text/html; charset=utf-8',
      body: `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>Big Buck Bunny - Scene Memo sample</title>
      <style>html,body{margin:0;background:#09070a;color:#fff;font:16px system-ui,sans-serif}#movie_player{position:relative;width:1280px;height:720px;margin:110px auto 0;overflow:hidden;background:radial-gradient(ellipse at 68% 35%,#8aa477 0,#58745f 24%,#253b39 55%,#10191e 100%)}#movie_player:before{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(5,7,8,.65),transparent 38%),radial-gradient(ellipse at 25% 82%,#b09c6c 0,transparent 30%)}video{position:absolute;inset:0;width:100%;height:100%;opacity:.01}</style></head>
      <body><main id="movie_player" class="html5-video-player"><video playsinline></video></main></body></html>`
  }));
  await page.goto('https://www.youtube.com/watch?v=aqz-KE-bpKQ', { waitUntil: 'domcontentloaded' });

  await page.evaluate(() => { const video = document.querySelector('video'); if (video) video.pause(); });
  await page.waitForTimeout(1200);

  console.log('Waiting for overlay...');
  await page.waitForSelector('#fanza-comment-overlay', { timeout: 30000 });
  await page.waitForTimeout(2000);

  // Helper: Force Move and Resize UI to fit within Video Player Region
  async function fitOverlayToPlayer(options = {}) {
    await page.locator('#fanza-comment-overlay').evaluate((overlay, opts) => {
      const video = document.querySelector('video');
      if (video && overlay) {
        const vRect = video.getBoundingClientRect();
        const padding = 20;

        // Reset class and handle minimized
        if (opts.minimized) {
            overlay.classList.add('minimized');
        } else {
            overlay.classList.remove('minimized');
        }

        if (opts.theme) {
            overlay.classList.remove('fc-light-theme'); // default dark
            if (opts.theme === 'light') overlay.classList.add('fc-light-theme');
        }

        // Calculate available size
        const availHeight = vRect.height - (padding * 2);
        const availWidth = vRect.width - (padding * 2);

        // Apply size (constrained by player)
        const targetWidth = opts.width || 360;
        const targetHeight = opts.height || 440;
        
        overlay.style.width = `${Math.min(targetWidth, availWidth)}px`;
        if (!opts.minimized) {
            overlay.style.height = `${Math.min(targetHeight, availHeight)}px`;
        }

        // Apply absolute positioning relative to page
        const x = vRect.left + window.scrollX + padding;
        const y = vRect.top + window.scrollY + padding;
        
        overlay.style.position = 'absolute';
        overlay.style.left = `${x}px`;
        overlay.style.top = `${y}px`;
        overlay.style.right = 'auto';
        overlay.style.bottom = 'auto';
        overlay.style.margin = '0';
        console.log(`UI fitted to player: ${x}, ${y}, size: ${overlay.style.width}x${overlay.style.height}`);
      }
    }, options);
  }

  // Final confirmation of overlay appearance
  await fitOverlayToPlayer();

  // --- Clean up UI for Store Screenshots ---
  console.log('Cleaning up UI for store review (removing Beta/Pro labels)...');
  await page.addStyleTag({ content: `
    #secondary { display: none !important; }
    ytd-watch-flexy[flexy] #primary.ytd-watch-flexy { max-width: 100% !important; min-width: 100% !important; }
  `});
  // Helper: take full-page clipped screenshot to include video background
  async function screenshotOverlay(filename) {
    const overlay = page.locator('#fanza-comment-overlay').first();
    if (await overlay.count()) {
      await overlay.screenshot({ path: path.join(OUT_DIR, filename), animations: 'disabled' });
      console.log(`  Overlay screenshot saved: ${filename}`);
      return;
    }
    console.log(`  WARNING: overlay not found for ${filename}`);
  }

  // =================================================================

  // =================================================================
  // 1) Full page + dark theme with comment input
  // =================================================================
  console.log('--- 1. Full page (dark, input) ---');
  
  // Wait for the specific dummy comments to be rendered by extension
  await page.locator('.fc-comment').first().waitFor({ timeout: 10000 }).catch(() => console.log("  Timeout waiting for comments (proceeding)"));
  
  // Robust wait for comments
  let commentsLoaded = false;
  for (let i = 0; i < 10; i++) {
    const count = await page.locator('#fanza-comment-overlay .fc-comment').count();
    if (count > 0) {
      commentsLoaded = true;
      console.log(`  Comments found: ${count}`);
      break;
    }
    await page.waitForTimeout(2000);
    console.log(`  Waiting for comments... (${i+1}/10)`);
  }
  
  if (!commentsLoaded) {
    console.log("  WARNING: Comments still not loaded. Trying to toggle settings to force refresh...");
    await page.locator('#fc-settings-btn').click();
    await page.waitForTimeout(600);
    await page.locator('#fc-settings-close').click();
    await page.waitForTimeout(2000);
  }

  // Force move and fit UI to player
  await fitOverlayToPlayer({ theme: 'dark' });

  await screenshotOverlay('closeup_dark_list.png');

  await page.locator('#fanza-comment-overlay .fc-input-area .fc-input').fill('ここほんと最高…');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'wide_full_dark_input.png') });
  console.log('  Saved: wide_full_dark_input.png');

  // =================================================================
  // 2) Overlay closeup - dark theme burst (at 280s)
  // =================================================================
  console.log('--- 2. Closeup (dark, burst at 280s) ---');
  await page.evaluate(() => {
    const v = document.querySelector('video');
    if (v) { try { v.currentTime = 280; } catch (_) {} v.pause(); }
  });
  await page.locator('#fanza-comment-overlay .fc-input-area .fc-input').fill('');
  // Wait for seeks and potential list updates
  await page.waitForTimeout(3000);
  await fitOverlayToPlayer({ theme: 'dark' });
  await screenshotOverlay('closeup_dark_burst.png');

  // =================================================================
  // 3) Overlay closeup - dark theme settings (video index)
  // =================================================================
  console.log('--- 3. Closeup (dark, settings) ---');
  await page.locator('#fc-settings-btn').click();
  await page.waitForTimeout(1500);
  await fitOverlayToPlayer({ theme: 'dark' });
  await screenshotOverlay('closeup_dark_settings.png');

  // =================================================================
  // 4) Switch to light theme - settings
  // =================================================================
  console.log('--- 4. Closeup (light, settings) ---');
  await page.locator('#fc-theme-toggle').check({ force: true });
  await page.waitForTimeout(1000);
  await fitOverlayToPlayer({ theme: 'light' });
  await screenshotOverlay('closeup_light_settings.png');

  // =================================================================
  // 5) Closeup - light theme comment list
  // =================================================================
  console.log('--- 5. Closeup (light, comment list) ---');
  await page.locator('#fc-settings-close').click();
  await page.waitForTimeout(500);
  await fitOverlayToPlayer({ theme: 'light' });
  await screenshotOverlay('closeup_light_list.png');

  // =================================================================
  // 6) Full page - light theme
  // =================================================================
  console.log('--- 6. Full page (light) ---');
  await fitOverlayToPlayer({ theme: 'light' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'wide_full_light.png') });
  console.log('  Saved: wide_full_light.png');

  // =================================================================
  // 7) Switch back to dark + minimized
  // =================================================================
  console.log('--- 7. Full page (minimized) ---');
  await page.locator('#fc-settings-btn').click();
  await page.waitForTimeout(300);
  await page.locator('#fc-theme-toggle').uncheck({ force: true }); // switch back
  await page.waitForTimeout(300);
  await page.locator('#fc-settings-close').click(); // close settings
  await page.waitForTimeout(300);
  await fitOverlayToPlayer({ theme: 'dark', minimized: true });
  await page.waitForTimeout(1000);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'wide_full_minimized.png') });
  console.log('  Saved: wide_full_minimized.png');
  console.log('  Saved: full_minimized.png');

  // --- 8. Full page (Light, RESIZED for Promo 05) ---
  console.log('--- 8. Full page (light, resized for scale demo) ---');
  await fitOverlayToPlayer({ theme: 'light', minimized: false, width: 600, height: 400 });
  await page.waitForTimeout(1000);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'wide_full_light_resized.png') });
  console.log('  Saved: wide_full_light_resized.png');
  console.log('  Saved: full_light_resized.png');

  // =================================================================
  console.log('\n=== All screenshots captured! ===');
  await ctx.close();
  captureContext = null;
  fs.rmSync(PROFILE_DIR, { recursive: true, force: true });
}

run().catch(async e => {
  console.error('FATAL:', e);
  if (captureContext) await captureContext.close().catch(() => {});
  fs.rmSync(PROFILE_DIR, { recursive: true, force: true });
  process.exit(1);
});
