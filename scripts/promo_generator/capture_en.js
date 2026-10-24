const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const EXTENSION_PATH = path.join(__dirname, '..', '..', 'extension');
const OUT_DIR = path.join(__dirname, 'screenshots');

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

  const ctx = await chromium.launchPersistentContext('', {
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
      const p = await ctx.newPage();
      await p.goto('https://www.example.com');
      await p.waitForTimeout(3000);
      extensionId = findId();
      await p.close();
    }
  }
  console.log('Extension ID:', extensionId);
  if (!extensionId) { await ctx.close(); return; }

  // --- Inject dummy comments ---
  console.log('Injecting dummy comments (English)...');
  const popup = await ctx.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await popup.waitForTimeout(1000);

  await popup.evaluate(async (comments) => {
    const COMMENTS_PREFIX = 'video_memo_comments_';
    const META_PREFIX = 'video_memo_meta_';
    const ENTITLEMENT_KEY_PRO_PURCHASED = 'fanza_memo_is_pro_purchased';

    // Clear UI state
    await new Promise(r => chrome.storage.local.remove([
      'fanza_ui_pos', 'fanza_ui_minimized', 'fanza_ui_theme',
      'fanza_default_auto_min', 'fanza_shortcut'
    ], r));

    // Enable Pro mode and force English locale
    await new Promise(r => chrome.storage.local.set({ 
      [ENTITLEMENT_KEY_PRO_PURCHASED]: true,
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

  await popup.close();

  // --- Navigate to YouTube ---
  const page = await ctx.newPage();
  console.log('Navigating to YouTube...');
  await page.goto('https://www.youtube.com/watch?v=aqz-KE-bpKQ', { waitUntil: 'networkidle' });

  // Handle cookies
  for (const label of ['Reject all', 'すべて拒否', 'Accept all', '同意する']) {
    try {
      const btn = await page.$(`button:has-text("${label}")`);
      if (btn) { await btn.click(); break; }
    } catch (e) {}
  }

  // Prep video
  await page.evaluate(async () => {
    const v = document.querySelector('video');
    if (!v) return;
    v.pause();
    v.currentTime = 15;
  });

  await page.waitForTimeout(5000); 
  await page.waitForSelector('#fanza-comment-overlay', { timeout: 30000 });

  // UI labels cleanup (match user screenshot)
  await page.addStyleTag({ content: `
    #fc-upgrade-btn, .fc-badge-beta, .fc-badge-pro { display: none !important; }
    #secondary { display: none !important; }
    ytd-watch-flexy[flexy] #primary.ytd-watch-flexy { max-width: 100% !important; min-width: 100% !important; }
  `});

  // Force actual English labels
  await page.evaluate(() => {
    const status = document.querySelector('#fc-status');
    if (status) status.textContent = 'Epic Moments';
  });

  // Helper functions
  async function fitOverlayToPlayer(options = {}) {
    await page.evaluate((opts) => {
      const video = document.querySelector('video');
      const overlay = document.getElementById('fanza-comment-overlay');
      if (video && overlay) {
        const vRect = video.getBoundingClientRect();
        const padding = 20;

        if (opts.minimized) overlay.classList.add('minimized');
        else overlay.classList.remove('minimized');

        if (opts.theme === 'light') overlay.classList.add('fc-light-theme');
        else overlay.classList.remove('fc-light-theme');

        const targetWidth = opts.width || 320;
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
    const el = await page.$('#fanza-comment-overlay');
    if (el) {
      const box = await el.boundingBox();
      if (box) {
        await page.screenshot({ path: path.join(OUT_DIR, filename), clip: box });
        console.log(`  Saved: ${filename}`);
      }
    }
  }

  // Capture loop
  console.log('Generating screenshots...');

  // 1. Full page (dark, input)
  await fitOverlayToPlayer({ theme: 'dark' });
  await page.evaluate(() => {
    const input = document.querySelector('#fanza-comment-overlay .fc-input-area .fc-input');
    if (input) { input.value = "This part is the best..."; input.dispatchEvent(new Event('input', { bubbles: true })); }
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'wide_full_dark_input_en.png') });

  // 2. Closeup (dark list)
  await page.evaluate(() => {
    const input = document.querySelector('#fanza-comment-overlay .fc-input-area .fc-input');
    if (input) input.value = "";
  });
  await screenshotOverlay('closeup_dark_burst_en.png');

  // 3. Closeup (dark settings)
  await page.evaluate(() => document.querySelector('#fc-settings-btn')?.click());
  await page.waitForTimeout(1000);
  await screenshotOverlay('closeup_dark_settings_en.png');

  // 4. Closeup (light settings)
  await page.evaluate(() => document.querySelector('#fc-theme-toggle')?.click());
  await page.waitForTimeout(1000);
  await screenshotOverlay('closeup_light_settings_en.png');

  // 5. Closeup (light list)
  await page.evaluate(() => document.querySelector('#fc-settings-back')?.click());
  await page.waitForTimeout(1000);
  await screenshotOverlay('closeup_light_list_en.png');

  // 6. Full resized (light)
  await fitOverlayToPlayer({ theme: 'light', width: 600, height: 400 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'wide_full_light_resized_en.png') });

  await ctx.close();
  console.log('Capture Done.');
}

run();
