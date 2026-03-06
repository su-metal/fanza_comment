const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const EXTENSION_PATH = path.join(__dirname, '..', '..', 'extension');
const OUT_DIR = path.join(__dirname, 'screenshots');

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

  const ctx = await chromium.launchPersistentContext('', {
    headless: false,
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
  const extPage = await ctx.newPage();
  await extPage.goto('chrome://extensions');
  await extPage.waitForTimeout(2000);
  const extensionId = await extPage.evaluate(() => {
    const mgr = document.querySelector('extensions-manager');
    if (!mgr?.shadowRoot) return null;
    const list = mgr.shadowRoot.querySelector('extensions-item-list');
    if (!list?.shadowRoot) return null;
    const items = list.shadowRoot.querySelectorAll('extensions-item');
    return Array.from(items).map(i => i.getAttribute('id')).find(id => id);
  });
  await extPage.close();
  console.log('Extension ID:', extensionId);
  if (!extensionId) { await ctx.close(); return; }

  // --- Inject dummy comments ---
  console.log('Injecting dummy comments...');
  const popup = await ctx.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await popup.waitForTimeout(1000);

  await popup.evaluate(async (comments) => {
    // --- Correct storage keys for the extension ---
    const COMMENTS_PREFIX = 'video_memo_comments_';
    const META_PREFIX = 'video_memo_meta_';
    const ENTITLEMENT_KEY_PRO_PURCHASED = 'fanza_memo_is_pro_purchased';

    // Clear UI state - Use correct keys from content.js
    await new Promise(r => chrome.storage.local.remove([
      'fanza_ui_pos', 'fanza_ui_minimized', 'fanza_ui_theme',
      'fanza_default_auto_min', 'fanza_shortcut'
    ], r));

    // Enable Pro mode for screenshots (unlimited, no upgrade ads)
    await new Promise(r => chrome.storage.local.set({ [ENTITLEMENT_KEY_PRO_PURCHASED]: true }, r));


    const siteKey = "youtube";
    const vid1 = 'yt_aqz-KE-bpKQ'; // Restore yt_ prefix
    const suffix1 = `${siteKey}_${vid1}`;
    
    // Helper to build a "real" comment object
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
        title: "Big Buck Bunny 60fps 4K - Blender公式短編",
        url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
        site: siteKey,
        videoId: vid1,
        updatedAt: Date.now()
      }
    }, r));

    // Add many videos for the video index to make it look "dense"
    const sampleVideos = [
      { id: 'yt_YE7VzlLtp-4', title: 'Spring - Blender Animation', comments: 12, offset: 86400000 },
      { id: 'yt_WhWc3b3KhnY', title: 'Sintel - Full Movie', comments: 8, offset: 172800000 },
      { id: 'yt_mN0zPOpADL4', title: 'Caminandes 3: Llamigos', comments: 5, offset: 259200000 },
      { id: 'yt_3wzW2shAdf4', title: 'Cosmos Laundromat', comments: 24, offset: 345600000 },
      { id: 'yt_v2X98V0T9yM', title: 'Coffee Run - Short Film', comments: 3, offset: 432000000 },
      { id: 'yt_dpv65XN7rF8', title: 'Hero - 2D Animation', comments: 15, offset: 518400000 },
      { id: 'yt_vYenZAbT7X4', title: 'Elephant Dream', comments: 7, offset: 604800000 },
      { id: 'yt_aqz-KE-bpKQ_old', title: 'Big Buck Bunny (Previous)', comments: 20, offset: 691200000 }
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
  }, DUMMY_COMMENTS);

  await popup.close();
  console.log('Done. UI state cleared to force top-left default.');

  // --- Navigate to YouTube ---
  const page = await ctx.newPage();
  
  // PAGE CONSOLE LOGGING
  page.on('console', msg => {
    console.log(`[PAGE LOG ${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  console.log('Navigating to YouTube...');
  // Use networkidle to ensure heavy JS is mostly loaded
  await page.goto('https://www.youtube.com/watch?v=aqz-KE-bpKQ', { waitUntil: 'networkidle' });

  // Dismiss YouTube popups early
  console.log('Handling cookies/popups...');
  for (const label of ['すべて拒否', 'Reject all', 'Accept all', '同意する']) {
    try {
      const btn = await page.$(`button:has-text("${label}")`);
      if (btn) { await btn.click(); break; }
    } catch (e) {}
  }

  // Wait for video and set up playback
  console.log('Waiting for video and readyState...');
  await page.evaluate(async () => {
    const v = document.querySelector('video');
    if (!v) return;
    
    // helper to wait with timeout
    const withTimeout = (promise, ms) => Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
    ]);

    try {
      if (v.readyState < 3) {
        await withTimeout(new Promise(r => {
          v.oncanplay = r;
          // Also check if already ready
          if (v.readyState >= 3) r();
        }), 5000);
      }
      
      v.pause();
      v.currentTime = 15; // Back to lush forest scenery (0:15)
      
      await withTimeout(new Promise(r => {
        v.onseeked = r;
        // If already seeked
        if (!v.seeking) r();
      }), 5000);
    } catch (e) {
      console.log('Video wait error (proceeding anyway):', e.message);
    }
  });

  // CRITICAL: Extra wait for Chromium to actually render the frame after seeked event
  await page.waitForTimeout(5000); 

  console.log('Waiting for overlay...');
  await page.waitForSelector('#fanza-comment-overlay', { timeout: 30000 });
  await page.waitForTimeout(2000);

  // Helper: Force Move and Resize UI to fit within Video Player Region
  async function fitOverlayToPlayer(options = {}) {
    await page.evaluate((opts) => {
      const video = document.querySelector('video');
      const overlay = document.getElementById('fanza-comment-overlay');
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
        const targetWidth = opts.width || 320;
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
    #fc-upgrade-btn, .fc-badge-beta, .fc-badge-pro { display: none !important; }
    #secondary { display: none !important; }
    ytd-watch-flexy[flexy] #primary.ytd-watch-flexy { max-width: 100% !important; min-width: 100% !important; }
  `});
  // Force status text to be clean
  await page.evaluate(() => {
    const status = document.querySelector('#fc-status');
    if (status) status.textContent = 'シーン・メモ';
  });

  // Helper: take full-page clipped screenshot to include video background
  async function screenshotOverlay(filename) {
    const el = await page.$('#fanza-comment-overlay');
    if (el) {
      // Temporarily remove border-radius and border to get a clean rectangular fill for the panel
      await page.evaluate(() => {
        const overlay = document.getElementById('fanza-comment-overlay');
        if (overlay) {
          overlay.dataset.originalRadius = overlay.style.borderRadius;
          overlay.dataset.originalBorder = overlay.style.border;
          overlay.style.borderRadius = '0';
          overlay.style.border = 'none';
        }
      });

      const box = await el.boundingBox();
      if (box) {
        // Use exact bounding box with NO margin
        const clip = {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height
        };
        await page.screenshot({ path: path.join(OUT_DIR, filename), clip });
        console.log(`  Clipped screenshot saved: ${filename}`);
      }

      // Restore style
      await page.evaluate(() => {
        const overlay = document.getElementById('fanza-comment-overlay');
        if (overlay) {
          overlay.style.borderRadius = overlay.dataset.originalRadius;
          overlay.style.border = overlay.dataset.originalBorder;
        }
      });
    } else {
      console.log(`  WARNING: overlay not found for ${filename}`);
    }
  }

  // =================================================================

  // =================================================================
  // 1) Full page + dark theme with comment input
  // =================================================================
  console.log('--- 1. Full page (dark, input) ---');
  
  // Wait for the specific dummy comments to be rendered by extension
  await page.waitForSelector('.fc-comment', { timeout: 10000 }).catch(() => console.log("  Timeout waiting for comments (proceeding)"));
  
  // Robust wait for comments
  let commentsLoaded = false;
  for (let i = 0; i < 10; i++) {
    const count = await page.evaluate(() => document.querySelectorAll('#fanza-comment-overlay .fc-comment').length);
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
    await page.evaluate(() => {
       document.querySelector('#fc-settings-btn')?.click();
       setTimeout(() => document.querySelector('#fc-settings-back')?.click(), 1000);
    });
    await page.waitForTimeout(2000);
  }

  // Force move and fit UI to player
  await fitOverlayToPlayer({ theme: 'dark' });

  await page.evaluate(() => {
    const input = document.querySelector('#fanza-comment-overlay .fc-input-area .fc-input');
    if (input) { input.value = "ここほんと最高…"; input.dispatchEvent(new Event('input', { bubbles: true })); }
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'wide_full_dark_input.png') });
  console.log('  Saved: wide_full_dark_input.png');

  // =================================================================
  // 2) Overlay closeup - dark theme burst (at 280s)
  // =================================================================
  console.log('--- 2. Closeup (dark, burst at 280s) ---');
  await page.evaluate(() => {
    const v = document.querySelector('video');
    if (v) { v.currentTime = 280; v.pause(); }
    const input = document.querySelector('#fanza-comment-overlay .fc-input-area .fc-input');
    if (input) input.value = "";
  });
  // Wait for seeks and potential list updates
  await page.waitForTimeout(3000);
  await fitOverlayToPlayer({ theme: 'dark' });
  await screenshotOverlay('closeup_dark_burst.png');

  // =================================================================
  // 3) Overlay closeup - dark theme settings (video index)
  // =================================================================
  console.log('--- 3. Closeup (dark, settings) ---');
  await page.evaluate(() => document.querySelector('#fc-settings-btn')?.click());
  await page.waitForTimeout(1500);
  await fitOverlayToPlayer({ theme: 'dark' });
  await screenshotOverlay('closeup_dark_settings.png');

  // =================================================================
  // 4) Switch to light theme - settings
  // =================================================================
  console.log('--- 4. Closeup (light, settings) ---');
  await page.evaluate(() => document.querySelector('#fc-theme-toggle')?.click());
  await page.waitForTimeout(1000);
  await fitOverlayToPlayer({ theme: 'light' });
  await screenshotOverlay('closeup_light_settings.png');

  // =================================================================
  // 5) Closeup - light theme comment list
  // =================================================================
  console.log('--- 5. Closeup (light, comment list) ---');
  await page.evaluate(() => document.querySelector('#fc-settings-back')?.click());
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
  await page.evaluate(() => document.querySelector('#fc-theme-toggle')?.click()); // switch back
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('#fc-settings-btn')?.click()); // close settings
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
}

run().catch(e => { console.error('FATAL:', e); process.exit(1); });
