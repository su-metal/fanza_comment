const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');

const EXTENSION_PATH = path.join(__dirname, '..', '..', 'extension');
const OUT_DIR = path.join(__dirname, 'screenshots');
const PROFILE_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'scene-memo-capture-en-'));
const LICENSE_VERIFY_URL = 'https://asia-northeast1-fanza-comment-lic-20260303.cloudfunctions.net/licenseApi/verify-device';
let captureContext;

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

const DUMMY_COMMENTS_EN = [
  { text: "This part is the best...", t: 15 },
  { text: "★Love this expression", t: 80 },
  { text: "Perfect camera angle", t: 160 },
  { text: "Outfit looks amazing", t: 250 },
  { text: "[Important] Literal goosebumps", t: 330 },
  { text: "I'll rewatch this for sure", t: 375 },
  { text: "Great lighting sense", t: 420 },
  { text: "★Must-save scene", t: 500 }
];

async function run() {
  console.log('=== English Screenshot Capture (Headless) ===');

  const ctx = captureContext = await chromium.launchPersistentContext(PROFILE_DIR, {
    timezoneId: 'America/Los_Angeles',
    headless: false, // Use non-headless for extension support
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      `--window-size=1600,1000`,
      '--disable-blink-features=AutomationControlled'
    ],
    viewport: { width: 1600, height: 1000 }
  });

  // --- Get extension ID ---
  console.log('Finding extension ID...');
  let extensionId;
  
  const findId = () => {
    const sw = ctx.serviceWorkers().find(w => w.url().startsWith('chrome-extension://'));
    if (sw) return sw.url().split('/')[2];
    return null;
  };

  extensionId = findId();
  if (!extensionId) {
    console.log('Waiting for service worker...');
    try {
      const worker = await ctx.waitForEvent('serviceworker', { timeout: 10000 });
      extensionId = worker.url().split('/')[2];
    } catch (e) {
      console.log('Service worker wait failed, trying to trigger via page...');
      throw e;
    }
  }
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
  console.log('Injecting dummy comments (English)...');
  const popup = await ctx.newPage();
  console.log('Opening extension popup page...');
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await popup.waitForTimeout(1000);
  console.log('Writing sample comments to extension storage...');

  await popup.evaluate(async (comments) => {
    const COMMENTS_PREFIX = 'video_memo_comments_';
    const META_PREFIX = 'video_memo_meta_';
    const ENTITLEMENT_KEY_PRO_PURCHASED = 'fanza_memo_is_pro_purchased';
    const ENTITLEMENT_KEY_BETA = 'fanza_memo_is_beta_grandfathered';

    // Clear UI state
    await new Promise(r => chrome.storage.local.remove([
      'fanza_ui_pos', 'fanza_ui_minimized', 'fanza_ui_theme',
      'fanza_default_auto_min', 'fanza_shortcut'
    ], r));

    // Use the free beta entitlement for sample comments without a license API call.
    await new Promise(r => chrome.storage.local.set({ 
      [ENTITLEMENT_KEY_PRO_PURCHASED]: false,
      [ENTITLEMENT_KEY_BETA]: true,
      'fanza_memo_dev_force_locale': 'en'
    }, r));

    const siteKey = "youtube";
    const vid1 = 'yt_aqz-KE-bpKQ';
    const suffix1 = `${siteKey}_${vid1}`;
    
    const buildComment = (text, t, videoId) => ({
      id: Math.random(),
      comment_id: `c_${Date.now()}_${Math.random()}`,
      schema_version: 1,
      site: siteKey,
      video_id: videoId,
      t: t,
      text: text,
      work_key: videoId,
      isLocal: true,
      visibility: 'private',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const fullComments1 = comments.map(c => buildComment(c.text, c.t, vid1));

    await new Promise(r => chrome.storage.local.set({
      [`${COMMENTS_PREFIX}${suffix1}`]: fullComments1,
      [`${META_PREFIX}${suffix1}`]: {
        title: "Big Buck Bunny 60fps 4K - Official Blender Short Film",
        url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
        site: siteKey,
        videoId: vid1,
        updatedAt: Date.now()
      }
    }, r));

    const sampleVideos = [
      { id: 'yt_YE7VzlLtp-4', title: 'Spring - Blender Animation', comments: 12, offset: 86400000 },
      { id: 'yt_WhWc3b3KhnY', title: 'Sintel - Full Movie', comments: 8, offset: 172800000 },
      { id: 'yt_mN0zPOpADL4', title: 'Caminandes 3: Llamigos', comments: 5, offset: 259200000 }
    ];

    for (const v of sampleVideos) {
      const vid = v.id;
      const suffix = `${siteKey}_${vid}`;
      const mockComments = Array.from({ length: v.comments }, (_, i) => buildComment(`Sample comment ${ i + 1 }`, i * 30, vid));
      await new Promise(r => chrome.storage.local.set({
        [`${COMMENTS_PREFIX}${suffix}`]: mockComments,
        [`${META_PREFIX}${suffix}`]: {
          title: v.title,
          url: `https://www.youtube.com/watch?v=${ v.id.replace('yt_', '') }`,
          site: siteKey,
          videoId: vid,
          updatedAt: Date.now() - v.offset
        }
      }, r));
    }
  }, DUMMY_COMMENTS_EN);

  console.log('Sample comments written.');
  await popup.reload({ waitUntil: 'domcontentloaded' });
  await popup.evaluate(() => window.extI18n?.ready);
  await popup.waitForFunction(() => !/checking|確認中/i.test(document.querySelector('#license-status')?.textContent || ''), null, { timeout: 10000 });
  await popup.locator('body').screenshot({ path: path.join(OUT_DIR, 'popup_dark_en.png'), animations: 'disabled' });
  await popup.setViewportSize({ width: 1365, height: 900 });
  await popup.goto(`chrome-extension://${extensionId}/onboarding.html`, { waitUntil: 'domcontentloaded' });
  await popup.evaluate(() => window.extI18n?.ready);
  await popup.waitForFunction(() => {
    const status = document.querySelector('#license-status')?.textContent || '';
    const restoreCard = document.querySelector('#restore-card');
    return !/checking|確認中/i.test(status) && restoreCard?.style.display === 'none';
  }, null, { timeout: 10000 });
  await popup.screenshot({ path: path.join(OUT_DIR, 'onboarding_en.png'), fullPage: true, animations: 'disabled' });
  await popup.close();

  // --- Navigate to a local YouTube-shaped player page ---
  const page = await ctx.newPage();
  await page.route('https://www.youtube.com/watch**', route => route.fulfill({
    status: 200,
    contentType: 'text/html; charset=utf-8',
      body: `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Big Buck Bunny - Scene Memo sample</title>
      <style>html,body{margin:0;background:#09070a;color:#fff;font:16px system-ui,sans-serif}#movie_player{position:relative;width:1280px;height:720px;margin:110px auto 0;overflow:hidden;background:radial-gradient(ellipse at 68% 35%,#8aa477 0,#58745f 24%,#253b39 55%,#10191e 100%)}#movie_player:before{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(5,7,8,.65),transparent 38%),radial-gradient(ellipse at 25% 82%,#b09c6c 0,transparent 30%)}video{position:absolute;inset:0;width:100%;height:100%;opacity:.01}</style></head>
      <body><main id="movie_player" class="html5-video-player"><video playsinline></video></main></body></html>`
  }));
  console.log('Navigating to local sample player...');
  await page.goto('https://www.youtube.com/watch?v=aqz-KE-bpKQ', { waitUntil: 'domcontentloaded' });

  // Prep video
  await page.evaluate(async () => {
    const v = document.querySelector('video');
    if (!v) return;
    v.pause();
    try { v.currentTime = 15; } catch (_) {}
  });

  await page.waitForTimeout(1200);
  await page.waitForSelector('#fanza-comment-overlay', { timeout: 30000 });

  // UI labels cleanup (match user screenshot)
  await page.addStyleTag({ content: `
    #secondary { display: none !important; }
    ytd-watch-flexy[flexy] #primary.ytd-watch-flexy { max-width: 100% !important; min-width: 100% !important; }
  `});

  // Helper functions
  async function fitOverlayToPlayer(options = {}) {
    await page.locator('#fanza-comment-overlay').evaluate((overlay, opts) => {
      const video = document.querySelector('video');
      if (video && overlay) {
        const vRect = video.getBoundingClientRect();
        const padding = 20;

        if (opts.minimized) overlay.classList.add('minimized');
        else overlay.classList.remove('minimized');

        if (opts.theme === 'light') overlay.classList.add('fc-light-theme');
        else overlay.classList.remove('fc-light-theme');

        const targetWidth = opts.width || 360;
        const targetHeight = opts.height || 440;
        
        overlay.style.width = `${targetWidth}px`;
        if (!opts.minimized) overlay.style.height = `${targetHeight}px`;

        const x = vRect.left + window.scrollX + padding;
        const y = vRect.top + window.scrollY + padding;
        
        overlay.style.position = 'absolute';
        overlay.style.left = `${x}px`;
        overlay.style.top = `${y}px`;
      }
    }, options);
  }

  async function screenshotOverlay(filename) {
    const overlay = page.locator('#fanza-comment-overlay').first();
    if (!await overlay.count()) return;
    await overlay.screenshot({ path: path.join(OUT_DIR, filename), animations: 'disabled' });
    console.log(`  Saved: ${filename}`);
  }

  // Capture loop
  console.log('Generating screenshots...');

  // 1. Full page (dark, input)
  await fitOverlayToPlayer({ theme: 'dark' });
  await page.locator('#fanza-comment-overlay .fc-input-area .fc-input').fill('This part is the best...');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'wide_full_dark_input_en.png') });

  // 2. Closeup (dark list)
  await page.locator('#fanza-comment-overlay .fc-input-area .fc-input').fill('');
  await screenshotOverlay('closeup_dark_list_en.png');

  // 3. Closeup (dark settings)
  await page.locator('#fc-settings-btn').click();
  await page.waitForTimeout(1000);
  await screenshotOverlay('closeup_dark_settings_en.png');

  // 4. Closeup (light settings)
  await page.locator('#fc-theme-toggle').check({ force: true });
  await page.waitForTimeout(1000);
  await screenshotOverlay('closeup_light_settings_en.png');

  // 5. Closeup (light list)
  await page.locator('#fc-settings-close').click();
  await page.waitForTimeout(1000);
  await screenshotOverlay('closeup_light_list_en.png');

  // 6. Full resized (light)
  await fitOverlayToPlayer({ theme: 'light', width: 600, height: 400 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'wide_full_light_resized_en.png') });

  await ctx.close();
  captureContext = null;
  fs.rmSync(PROFILE_DIR, { recursive: true, force: true });
  console.log('Capture Done.');
}

run().catch(async error => {
  console.error('FATAL:', error);
  if (captureContext) await captureContext.close().catch(() => {});
  fs.rmSync(PROFILE_DIR, { recursive: true, force: true });
  process.exit(1);
});
