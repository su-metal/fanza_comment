const FC_EARLY_GUARD_INSTALLED = '__fanza_comment_early_guard_installed__';

function isOverlayInputTarget(target) {
  if (!(target instanceof Element)) return false;
  return target.id === 'fc-search-input';
}

function installEarlyInputGuards() {
  if (window[FC_EARLY_GUARD_INSTALLED]) return;
  window[FC_EARLY_GUARD_INSTALLED] = true;

  const guardEvent = (e) => {
    if (!isOverlayInputTarget(e.target)) return;
    // Stop page/player listeners (especially early capture handlers) from stealing focus/keys.
    e.stopImmediatePropagation();
    e.stopPropagation();
  };

  const guardedEvents = [];

  guardedEvents.forEach((type) => {
    window.addEventListener(type, guardEvent, true);
  });
}

installEarlyInputGuards();

// Basic style for the overlay
const style = document.createElement('style');
style.id = 'fanza-comment-inline-style';
style.textContent = `
  #fanza-comment-overlay {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 300px;
    height: 400px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    z-index: 2147483647; /* Max z-index */
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    font-family: sans-serif;
    pointer-events: auto;
    overflow: hidden;
    backdrop-filter: blur(4px);
  }
  .fc-header {
    padding: 10px;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: move; /* Drag handle placeholder */
    height: 40px;
    box-sizing: border-box;
  }
  .fc-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .fc-settings {
    flex: 1;
    padding: 10px;
    display: none;
    flex-direction: column;
    gap: 10px;
    font-size: 14px;
  }
  .fc-comment {
    background: rgba(255, 255, 255, 0.1);
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .fc-comment:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  .fc-comment.active {
    border-left: 3px solid #e1306c; /* DMM pink-ish */
    background: rgba(225, 48, 108, 0.2);
  }
  .fc-time {
    font-size: 11px;
    color: #ccc;
    margin-right: 6px;
  }
  .fc-input-area {
    padding: 10px;
    border-top: 1px solid rgba(255,255,255,0.1);
    display: flex;
    gap: 5px;
  }
  .fc-input {
    flex: 1;
    background: rgba(0,0,0,0.5);
    border: 1px solid #555;
    color: white;
    padding: 5px;
    border-radius: 4px;
    outline: none;
  }
  .fc-btn {
    background: #e1306c;
    border: none;
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
  }
  /* Scrollbar */
  .fc-list::-webkit-scrollbar { width: 6px; }
  .fc-list::-webkit-scrollbar-thumb { background: #555; border-radius: 3px; }
  
  .fc-delete-btn {
    float: right;
    color: #999;
    cursor: pointer;
    font-size: 16px;
    line-height: 12px;
    margin-left: 8px;
    display: none; /* Show on hover */
  }
  .fc-comment:hover .fc-delete-btn {
    display: block;
  }
  .fc-delete-btn:hover {
    color: #ff4444;
  }

  /* Minimized state */
  #fanza-comment-overlay.minimized {
    height: 40px !important;
    width: 300px; /* Increased from 200px to fit content */
    overflow: hidden;
  }
  #fanza-comment-overlay.minimized .fc-header {
    white-space: nowrap;
  }
  #fanza-comment-overlay.minimized .fc-list,
  #fanza-comment-overlay.minimized .fc-input-area,
  #fanza-comment-overlay.minimized .fc-settings {
    display: none;
  }
  .fc-header-btns {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .fc-edit-btn {
    float: right;
    color: #999;
    cursor: pointer;
    font-size: 14px;
    line-height: 12px;
    margin-left: 8px;
    display: none;
  }
  .fc-comment:hover .fc-edit-btn {
    display: block;
  }
  .fc-edit-btn:hover {
    color: #44bbff;
  }
  .fc-edit-input {
    width: 100%;
    background: rgba(255,255,255,0.1);
    border: 1px solid #777;
    color: white;
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
  }
  .fc-search-area {
    padding: 5px 10px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    display: flex;
    align-items: center;
    gap: 6px;
    box-sizing: border-box;
  }
  .fc-search-input {
    flex: 1;
    min-width: 0;
    background: rgba(0,0,0,0.3);
    border: 1px solid #444;
    color: #eee;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    outline: none;
    box-sizing: border-box;
  }
  .fc-search-clear {
    width: 22px;
    height: 22px;
    border: 1px solid #555;
    border-radius: 4px;
    background: rgba(255,255,255,0.1);
    color: #ddd;
    cursor: pointer;
    line-height: 18px;
    font-size: 14px;
    padding: 0;
    flex: 0 0 22px;
  }
  .fc-search-clear:hover {
    border-color: #777;
    color: #fff;
    background: rgba(255,255,255,0.18);
  }
  .fc-search-clear.is-hidden {
    opacity: 0.4;
  }
  .fc-search-input.fc-search-active {
    border-color: #44bbff;
    box-shadow: 0 0 0 1px rgba(68, 187, 255, 0.45);
  }
  .fc-jump-preview {
    position: absolute;
    z-index: 2147483647;
    max-width: 320px;
    background: rgba(0, 0, 0, 0.82);
    color: #fff;
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 8px;
    padding: 8px 10px;
    font-size: 12px;
    line-height: 1.4;
    pointer-events: none;
    opacity: 0;
    transform: translate(-50%, 4px);
    transition: opacity .14s ease, transform .14s ease;
    box-sizing: border-box;
  }
  .fc-jump-preview.show {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  .fc-jump-preview-time {
    color: #9ec5ff;
    margin-right: 6px;
  }
`;

function mountInlineStyle() {
  if (document.getElementById(style.id)) return;
  const parent = document.head || document.documentElement;
  if (!parent) return;
  parent.appendChild(style);
}

mountInlineStyle();

// Mock Data
const MOCK_COMMENTS = [];

let comments = [...MOCK_COMMENTS];
let videoElement = null;
let isMinimized = false;
let editingCommentId = null;
let searchQuery = '';
let showJumpPreview = null;
let findVideoIntervalId = null;
let renderIntervalId = null;
let lastPageHref = window.location.href;
let lastVideoId = '';

// Settings State
let shortcutConfig = {
    altKey: true,
    ctrlKey: false,
    shiftKey: false,
    key: 'KeyC', // Code
    label: 'Alt + C' // Display
};

// Video ID Extraction
function getSiteKey() {
  const host = window.location.hostname;
  if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
  if (host.includes('dmm.co.jp')) return 'dmm';
  return host.replace(/[^\w.-]/g, '_') || 'site';
}

function getVideoId() {
  const siteKey = getSiteKey();
  const params = new URLSearchParams(window.location.search);

  if (siteKey === 'youtube') {
    const watchId = params.get('v');
    if (watchId) return `yt_${watchId}`;

    const shortMatch = window.location.pathname.match(/^\/shorts\/([^/?#]+)/);
    if (shortMatch && shortMatch[1]) return `yt_shorts_${shortMatch[1]}`;

    const liveMatch = window.location.pathname.match(/^\/live\/([^/?#]+)/);
    if (liveMatch && liveMatch[1]) return `yt_live_${liveMatch[1]}`;
  }

  // FANZA / fallback
  if (params.get('work_id')) return params.get('work_id');

  let videoId = 'default';
  
  const matchPid = window.location.href.match(/pid=([^/]+)/);
  if (matchPid && matchPid[1]) {
    videoId = matchPid[1];
  } else {
    const matchParent = window.location.href.match(/parent_product_id=([^/]+)/);
    if (matchParent && matchParent[1]) {
      videoId = matchParent[1];
    } else {
      const matchCid = window.location.href.match(/cid=([^/]+)/); 
      if (matchCid && matchCid[1]) {
        videoId = matchCid[1];
      }
    }
  }

  // Check for part= (split files)
  const matchPart = window.location.href.match(/part=([^/]+)/);
  if (matchPart && matchPart[1]) {
    videoId += `_${matchPart[1]}`;
  }
  
  return videoId;
}

function getStorageKeys() {
  const siteKey = getSiteKey();
  const videoId = getVideoId();
  return {
    videoId,
    storageKey: `video_memo_comments_${siteKey}_${videoId}`,
    legacyStorageKey: `fanza_mock_comments_${videoId}`
  };
}

// Persistence
async function loadComments() {
  const { videoId, storageKey, legacyStorageKey } = getStorageKeys();
  
  return new Promise((resolve) => {
    // 1. Try chrome.storage.local
    chrome.storage.local.get([storageKey, legacyStorageKey, 'fanza_mock_shortcut'], (result) => {
      if (result[storageKey]) {
        try {
          comments = result[storageKey];
          console.log(`Loaded comments for ${videoId} from chrome.storage:`, comments.length);
        } catch (e) {
          console.error("Failed to parse comments", e);
          comments = [];
        }
      } else if (result[legacyStorageKey]) {
        try {
          comments = result[legacyStorageKey];
          console.log(`Migrated comments for ${videoId} from legacy key:`, comments.length);
          chrome.storage.local.set({ [storageKey]: comments });
        } catch (e) {
          console.error("Failed to parse legacy comments", e);
          comments = [];
        }
      } else {
        // Fallback to localStorage (Migration)
        const saved = localStorage.getItem(storageKey) || localStorage.getItem(legacyStorageKey);
        if (saved) {
          try {
            comments = JSON.parse(saved);
            console.log(`Migrated comments for ${videoId} from localStorage`);
            saveComments(); // Persist to new storage
          } catch(e) { comments = []; }
        } else {
          console.log(`No saved comments for ${videoId}, initializing mock.`);
          comments = [...MOCK_COMMENTS].map(c => ({...c, work_key: videoId}));
        }
      }

      if (result['fanza_mock_shortcut']) {
          shortcutConfig = result['fanza_mock_shortcut'];
      } else {
          // Fallback migration for shortcut
          const savedShortcut = localStorage.getItem('fanza_mock_shortcut');
          if (savedShortcut) {
              try {
                  shortcutConfig = JSON.parse(savedShortcut);
                  chrome.storage.local.set({fanza_mock_shortcut: shortcutConfig});
              } catch(e) {}
          }
      }
      resolve();
    });
  });
}

function saveComments() {
  const { storageKey } = getStorageKeys();
  chrome.storage.local.set({ [storageKey]: comments });
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function createOverlay() {
  if (document.getElementById('fanza-comment-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'fanza-comment-overlay';
  overlay.innerHTML = `
    <div class="fc-header">
      <span id="fc-status">同期コメント</span>
      <div class="fc-header-btns">
        <label style="font-size:10px;color:#aaa;margin-right:5px;cursor:pointer;">
            <input type="checkbox" id="fc-auto-min"> 自動最小化
        </label>
        <button id="fc-settings-btn" style="background:none;border:none;color:#aaa;cursor:pointer;" title="設定">⚙</button>
        <button id="fc-minimize-btn" style="background:none;border:none;color:#aaa;cursor:pointer;" title="最小化">_</button>
        <button id="fc-close-btn" style="background:none;border:none;color:#aaa;cursor:pointer;" title="非表示">x</button>
      </div>
    </div>
    
    <div class="fc-search-area">
      <input type="text" id="fc-search-input" class="fc-search-input" placeholder="コメント検索...">
      <button type="button" id="fc-search-clear" class="fc-search-clear is-hidden" title="検索をクリア">×</button>
    </div>
    
    <div class="fc-list" id="fc-list"></div>
    
    <div class="fc-settings" id="fc-settings">
        <h4>設定</h4>
        <div>
            <label>表示切替ショートカット:</label>
            <input type="text" id="fc-shortcut-input" class="fc-input" readonly value="${shortcutConfig.label}" style="cursor:pointer; text-align:center;">
            <p style="font-size:10px;color:#aaa;">クリック後にキーを押して設定</p>
        </div>
        <div style="margin-top:6px;">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                <input type="checkbox" id="fc-default-auto-min">
                自動最小化をデフォルトでON
            </label>
        </div>
        <div style="margin-top: 10px; border-top: 1px solid #444; padding-top: 10px;">
             <button id="fc-generate-dummy-btn" class="fc-btn" style="width:100%; background:#444; font-size:12px; display:none;">+ ダミーコメント100件追加</button>
             <button id="fc-clear-all-btn" class="fc-btn" style="width:100%; background:#822; font-size:12px; margin-top:5px;">全コメント削除</button>
        </div>
        <button class="fc-btn" id="fc-settings-back" style="margin-top:10px;">戻る</button>
    </div>

    <div class="fc-input-area">
      <input type="text" class="fc-input" placeholder="コメント..." maxlength="120">
      <button class="fc-btn">+</button>
    </div>
  `;
  
  // Append to body (or player container if possible, but body is safer for z-index)
  document.body.appendChild(overlay);

  // Input setup
  const btn = overlay.querySelector('.fc-btn'); // This selects the first one (Post button? No, first one is in settings now? NO settings button has class fc-btn too!)
  // Wait, querySelector returns first match. The settings back button has class fc-btn but comes BEFORE the post button? No, afterwards in HTML structure but wait.
  // "fc-settings" is before "fc-input-area". "fc-input-area" has "fc-btn".
  // "fc-settings" has "fc-settings-back".
  
  // Let's rely on IDs or structure
  const postBtn = overlay.querySelector('.fc-input-area .fc-btn');
  const input = overlay.querySelector('.fc-input-area .fc-input');
  
  const minBtn = overlay.querySelector('#fc-minimize-btn');
  const closeBtn = overlay.querySelector('#fc-close-btn');
  const settingsBtn = overlay.querySelector('#fc-settings-btn');
  const header = overlay.querySelector('.fc-header'); // Drag handle
  
  const settingsDiv = overlay.querySelector('#fc-settings');
  const listDiv = overlay.querySelector('#fc-list');
  const inputAreaDiv = overlay.querySelector('.fc-input-area');
  const settingsBackBtn = overlay.querySelector('#fc-settings-back');
  const shortcutInput = overlay.querySelector('#fc-shortcut-input');
  const searchInput = overlay.querySelector('#fc-search-input');
  const searchClearBtn = overlay.querySelector('#fc-search-clear');
  const defaultAutoMinCheckbox = overlay.querySelector('#fc-default-auto-min');
  let minimizeAnchor = 'bottom';
  let jumpPreviewTimer = null;
  let jumpPreviewEl = document.getElementById('fc-jump-preview');
  if (!jumpPreviewEl) {
    jumpPreviewEl = document.createElement('div');
    jumpPreviewEl.id = 'fc-jump-preview';
    jumpPreviewEl.className = 'fc-jump-preview';
    jumpPreviewEl.style.display = 'none';
    document.body.appendChild(jumpPreviewEl);
  }

  const placeOverlayInsideVideo = () => {
    if (!videoElement) return;
    const vRect = videoElement.getBoundingClientRect();
    const oRect = overlay.getBoundingClientRect();
    const margin = 20;
    const left = (vRect.right - oRect.width - margin) + window.scrollX;
    const top = (vRect.bottom - oRect.height - margin) + window.scrollY;
    overlay.style.right = 'auto';
    overlay.style.bottom = 'auto';
    overlay.style.left = `${left}px`;
    overlay.style.top = `${top}px`;
  };

  const clampOverlayToVideo = () => {
    if (!videoElement) return;
    const vRect = videoElement.getBoundingClientRect();
    const oRect = overlay.getBoundingClientRect();
    const minX = vRect.left;
    const maxX = vRect.right - oRect.width;
    const minY = vRect.top;
    const maxY = vRect.bottom - oRect.height;
    let x = oRect.left;
    let y = oRect.top;
    x = Math.max(minX, Math.min(maxX, x));
    y = Math.max(minY, Math.min(maxY, y));
    overlay.style.right = 'auto';
    overlay.style.bottom = 'auto';
    overlay.style.left = `${x + window.scrollX}px`;
    overlay.style.top = `${y + window.scrollY}px`;
  };

  showJumpPreview = (comment) => {
    if (!isMinimized || !comment || !jumpPreviewEl) return;
    const overlayRect = overlay.getBoundingClientRect();
    const vRect = videoElement ? videoElement.getBoundingClientRect() : {
      top: 0,
      left: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      height: window.innerHeight
    };
    const text = String(comment.text ?? '');
    const t = Number(comment.t ?? 0);
    jumpPreviewEl.innerHTML = `<span class="fc-jump-preview-time">[${formatTime(t)}]</span><span>${text}</span>`;
    jumpPreviewEl.style.display = 'block';
    jumpPreviewEl.classList.remove('show');
    jumpPreviewEl.style.left = `${overlayRect.left + (overlayRect.width / 2)}px`;
    jumpPreviewEl.style.top = '0px';

    // Measure after content update.
    const pRect = jumpPreviewEl.getBoundingClientRect();
    const isTopHalf = overlayRect.top < (vRect.top + (vRect.height / 2));
    let top = isTopHalf ? (overlayRect.bottom + 8) : (overlayRect.top - pRect.height - 8);
    const minTop = vRect.top + 4;
    const maxTop = vRect.bottom - pRect.height - 4;
    top = Math.max(minTop, Math.min(maxTop, top));
    jumpPreviewEl.style.top = `${top}px`;
    jumpPreviewEl.classList.add('show');

    if (jumpPreviewTimer) clearTimeout(jumpPreviewTimer);
    jumpPreviewTimer = setTimeout(() => {
      jumpPreviewEl.classList.remove('show');
      setTimeout(() => {
        jumpPreviewEl.style.display = 'none';
      }, 150);
    }, 1500);
  };

  // Load UI State
  chrome.storage.local.get(['fanza_mock_ui_pos', 'fanza_mock_default_auto_min'], (result) => {
    const savedPos = result.fanza_mock_ui_pos;
    const defaultAutoMin = !!result.fanza_mock_default_auto_min;
    let autoMinState = defaultAutoMin;

    if (savedPos) {
        try {
            const { left, top, isMin, autoMin, minimizeAnchor: savedAnchor } = savedPos;
            autoMinState = (typeof autoMin === 'boolean') ? autoMin : defaultAutoMin;
            if (savedAnchor === 'top' || savedAnchor === 'bottom') {
              minimizeAnchor = savedAnchor;
            }

            if (isMin) {
                isMinimized = true;
                overlay.classList.add('minimized');
                minBtn.textContent = '□';
                overlay.style.left = left;
                overlay.style.top = top;
                overlay.style.bottom = 'auto';
                overlay.style.right = 'auto';
            } else {
                overlay.style.bottom = 'auto';
                overlay.style.right = 'auto';
                overlay.style.left = left;
                overlay.style.top = top;
            }
        } catch(e) {}
    } else {
        placeOverlayInsideVideo();
    }

    // Auto-min checkbox logic
    const autoMinCheckbox = overlay.querySelector('#fc-auto-min');
    if (autoMinCheckbox) {
        autoMinCheckbox.checked = autoMinState;
        autoMinCheckbox.addEventListener('change', saveUIState);
    }
    if (defaultAutoMinCheckbox) {
        defaultAutoMinCheckbox.checked = defaultAutoMin;
        defaultAutoMinCheckbox.addEventListener('change', () => {
            const checked = !!defaultAutoMinCheckbox.checked;
            chrome.storage.local.set({ fanza_mock_default_auto_min: checked });
            if (autoMinCheckbox) {
                autoMinCheckbox.checked = checked;
                saveUIState();
            }
        });
    }

    requestAnimationFrame(() => clampOverlayToVideo());
  });

  window.addEventListener('resize', () => {
    if (!overlay.isConnected || overlay.style.display === 'none') return;
    clampOverlayToVideo();
    saveUIState();
  });

  // Save UI State helper
  const saveUIState = () => {
      const state = {
          left: overlay.style.left,
          top: overlay.style.top,
          isMin: isMinimized,
          autoMin: overlay.querySelector('#fc-auto-min')?.checked,
          minimizeAnchor
      };
      chrome.storage.local.set({ fanza_mock_ui_pos: state });
  };

  const decideMinimizeAnchor = (overlayRect) => {
    const referenceRect = videoElement
      ? videoElement.getBoundingClientRect()
      : { top: 0, bottom: window.innerHeight, height: window.innerHeight };
    // Choose the nearest edge so behavior stays intuitive for tall expanded panels.
    const distanceToTop = Math.abs(overlayRect.top - referenceRect.top);
    const distanceToBottom = Math.abs(referenceRect.bottom - overlayRect.bottom);
    return distanceToBottom < distanceToTop ? 'bottom' : 'top';
  };
  
  // Minimize/expand with dynamic anchor:
  // upper-half overlay => collapse to top, lower-half overlay => collapse to bottom
  const toggleMinimize = (forceMin = null) => {
      const shouldMin = forceMin !== null ? forceMin : !isMinimized;
      if (shouldMin === isMinimized) return; // No change
      
      const rect = overlay.getBoundingClientRect();
      const currentScrollY = window.scrollY;
      const currentScrollX = window.scrollX;
      
      // Ensure we have explicit top/left set before animating/changing
      // (Convert from bottom/right if necessary, though drag logic usually sets top/left)
      overlay.style.right = 'auto';
      overlay.style.bottom = 'auto';
      overlay.style.left = (rect.left + currentScrollX) + 'px';
      overlay.style.top = (rect.top + currentScrollY) + 'px';
      
      const fullHeight = 400; // From CSS
      const minHeight = 40;   // From CSS
      const delta = fullHeight - minHeight;
      
      isMinimized = shouldMin;
      
      if (isMinimized) {
        minimizeAnchor = decideMinimizeAnchor(rect);
        const newTop = minimizeAnchor === 'bottom'
          ? (rect.top + currentScrollY) + delta
          : (rect.top + currentScrollY);
        overlay.style.top = newTop + 'px';
        
        overlay.classList.add('minimized');
        minBtn.textContent = '□';
      } else {
        const newTop = minimizeAnchor === 'bottom'
          ? (rect.top + currentScrollY) - delta
          : (rect.top + currentScrollY);
        overlay.style.top = newTop + 'px';
        
        overlay.classList.remove('minimized');
        minBtn.textContent = '_';
      }
      requestAnimationFrame(() => {
        clampOverlayToVideo();
        saveUIState();
      });
  };

  // Close Logic
  closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      overlay.style.display = 'none';
  });

  // Minimize Logic
  minBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMinimize();
  });
  
  // Settings Logic
  settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      listDiv.style.display = 'none';
      inputAreaDiv.style.display = 'none';
      settingsDiv.style.display = 'flex';
  });
  
  settingsBackBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsDiv.style.display = 'none';
      listDiv.style.display = 'flex';
      inputAreaDiv.style.display = 'flex';
  });
  
  // Shortcut Recording
  shortcutInput.addEventListener('keydown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Ignore modifier-only presses
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;
      
      const newConfig = {
          altKey: e.altKey,
          ctrlKey: e.ctrlKey,
          shiftKey: e.shiftKey,
          key: e.code,
          label: ''
      };
      
      const parts = [];
      if (e.ctrlKey) parts.push('Ctrl');
      if (e.altKey) parts.push('Alt');
      if (e.shiftKey) parts.push('Shift');
      parts.push(e.key.toUpperCase());
      
      newConfig.label = parts.join(' + ');
      shortcutConfig = newConfig;
      
      shortcutInput.value = newConfig.label;
      chrome.storage.local.set({fanza_mock_shortcut: shortcutConfig});
  });

  // Dummy Generator
  const dummyBtn = overlay.querySelector('#fc-generate-dummy-btn');
  if (dummyBtn) {
      dummyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!videoElement) return;
          
          const duration = videoElement.duration || 1800; // Default 30min if unknown
          const newComments = [];
          const phrases = [
              "Awesome!", "Good job", "LOL", "Wait for it...", "Here it comes!",
              "Nice angle", "Surprise!", "Test comment", "Hello world", "Fanza mock"
          ];
          
          for(let i=0; i<100; i++) {
              newComments.push({
                  id: Date.now() + Math.random(),
                  t: Math.random() * duration,
                  text: phrases[Math.floor(Math.random() * phrases.length)] + " " + (i+1),
                  work_key: "mock",
                  isLocal: true
              });
          }
          
          comments = [...comments, ...newComments].sort((a,b) => a.t - b.t);
          
          // Limit check (300 comments)
          if (comments.length > 300) {
              comments = comments.slice(-300);
          }

          saveComments();
          renderComments(videoElement.currentTime);
          alert(`ダミーコメントを ${newComments.length} 件追加しました`);
      });
  }

  // Clear All
  const clearBtn = overlay.querySelector('#fc-clear-all-btn');
  if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm('この動画のコメントをすべて削除しますか？')) {
              comments = [];
              saveComments();
              renderComments(videoElement ? videoElement.currentTime : 0);
          }
      });
  }


  // Drag Logic
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  header.addEventListener('mousedown', (e) => {
      // Ignore if clicking UI controls
      if (['BUTTON', 'INPUT', 'LABEL'].includes(e.target.tagName)) return;
      e.preventDefault(); // Prevent text selection
      
      isDragging = true;
      const rect = overlay.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      
      // Ensure we switch to left/top positioning if not already
      overlay.style.bottom = 'auto';
      overlay.style.right = 'auto';
      overlay.style.width = getComputedStyle(overlay).width; // Fix width before moving
      
      if (!isMinimized) {
           // Reset width if it was weird, but let's rely on CSS
           overlay.style.width = '300px'; 
      }
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
  });

  const onMouseMove = (e) => {
      if (!isDragging) return;
      
      let clientX = e.clientX - dragOffsetX;
      let clientY = e.clientY - dragOffsetY;
      
      // Constrain to video area (Reverted to strict bounds)
      if (videoElement) {
          const vRect = videoElement.getBoundingClientRect();
          const oRect = overlay.getBoundingClientRect();
          
          const minX = vRect.left;
          const maxX = vRect.right - oRect.width;
          const minY = vRect.top;
          const maxY = vRect.bottom - oRect.height; 
          
          clientX = Math.max(minX, Math.min(maxX, clientX));
          clientY = Math.max(minY, Math.min(maxY, clientY));
      }

      overlay.style.left = `${clientX + window.scrollX}px`;
      overlay.style.top = `${clientY + window.scrollY}px`;
  };

  const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      saveUIState();
  };

  const postComment = () => {
    const text = input.value.trim();
    console.log("Attempting to post:", text); // Debug
    if (!text || !videoElement) return;
    
    // Add to local mock list
    const newComment = {
      id: Date.now(), // Simple mock ID
      t: Math.floor(videoElement.currentTime),
      text: text,
      work_key: "mock",
      isLocal: true
    };
    
    comments.push(newComment);
    comments.sort((a, b) => a.t - b.t);
    
    // Limit check (FIFO: 300 comments)
    if (comments.length > 300) {
        console.log(`Limit reached (${comments.length}). Removing oldest.`);
        // Note: comments are sorted by time, but FIFO usually means "oldest added".
        // However, in this time-sync context, let's treat it as FIFO for the whole list
        // if we want to be strict. For simplicity, just trim to 300.
        // If we want exact FIFO (creation order), we'd need a createdAt field.
        // Let's just keep the latest 300 based on time for now as it's most common.
        if (comments.length > 300) {
            comments = comments.slice(-300);
        }
    }

    saveComments();
    
    input.value = '';
    renderComments(videoElement.currentTime);
    
    console.log("Posted:", newComment);
  };

  postBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    postComment();
  });

  let lastCommentPointerDownAt = 0;
  let commentRefocusTried = false;

  input.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    lastCommentPointerDownAt = Date.now();
    commentRefocusTried = false;
    if (videoElement && !videoElement.paused) {
      videoElement.pause();
    }
    if (document.activeElement !== input) {
      e.preventDefault();
      input.focus({ preventScroll: true });
    }
  }, { capture: true });

  input.addEventListener('keydown', (e) => {
    e.stopPropagation(); // Stop player from stealing keys (e.g. Space to pause)
    if (e.key === 'Enter') {
      postComment();
      return;
    }
    if (e.key === 'Escape' || e.key === 'Esc') {
      input.blur();
      if (videoElement && videoElement.paused) {
        videoElement.play().catch(() => {});
      }
      e.preventDefault();
    }
  }, { capture: true }); // Use capture to beat player global listeners
  
  input.addEventListener('focus', () => {
    if (videoElement && !videoElement.paused) {
      videoElement.pause();
    }
  });

  input.addEventListener('blur', () => {
    // Player can steal focus immediately after first tap; retry once only.
    if (commentRefocusTried) return;
    if (Date.now() - lastCommentPointerDownAt > 700) return;
    commentRefocusTried = true;
    setTimeout(() => {
      if (document.activeElement !== input) {
        input.focus({ preventScroll: true });
      }
    }, 0);
  });

  input.addEventListener('keyup', (e) => e.stopPropagation(), { capture: true });
  input.addEventListener('keypress', (e) => e.stopPropagation(), { capture: true });
  
  // Stop clicks from pausing video if it bubbles up
  overlay.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  overlay.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  });

  // Store toggleMinimize for reuse in renderComments if needed (or just make it global/reachable)
  overlay.toggleMinimize = toggleMinimize;

  // Search Logic
  if (searchInput) {
    let isSearchMode = false;
    let wasPlayingBeforeSearch = false;
    searchInput.readOnly = false;
    searchInput.placeholder = 'コメント検索...';

    const updateSearchFromInput = () => {
      searchQuery = searchInput.value.toLowerCase();
      lastRenderedCommentCount = 0;
      renderComments(videoElement ? videoElement.currentTime : 0);
      if (searchClearBtn) {
        searchClearBtn.classList.toggle('is-hidden', searchInput.value.length === 0);
      }
    };

    const setSearchMode = (enabled) => {
      isSearchMode = enabled;
      if (isSearchMode) {
        searchInput.classList.add('fc-search-active');
      } else {
        searchInput.classList.remove('fc-search-active');
      }
    };

    const endSearchMode = () => {
      setSearchMode(false);
      if (document.activeElement === searchInput) {
        searchInput.blur();
      }
      if (wasPlayingBeforeSearch && videoElement && videoElement.paused) {
        videoElement.play().catch(() => {});
      }
      wasPlayingBeforeSearch = false;
    };

    const beginSearchMode = () => {
      if (!isSearchMode) {
        wasPlayingBeforeSearch = !!(videoElement && !videoElement.paused);
      }
      setSearchMode(true);
      if (wasPlayingBeforeSearch && videoElement && !videoElement.paused) {
        videoElement.pause();
      }
    };

    // Click/tap starts search mode and pauses video for stable IME input.
    searchInput.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      beginSearchMode();
    }, { capture: true });
    searchInput.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      beginSearchMode();
    }, { capture: true });
    searchInput.addEventListener('click', (e) => {
      e.stopPropagation();
      beginSearchMode();
      searchInput.focus({ preventScroll: true });
    }, { capture: true });

    if (searchClearBtn) {
      searchClearBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, { capture: true });
      searchClearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        searchInput.value = '';
        updateSearchFromInput();
        endSearchMode();
        if (videoElement) {
          videoElement.play().catch(() => {});
        }
      }, { capture: true });
    }

    window.addEventListener('pointerdown', (e) => {
      if (e.target !== searchInput && e.target !== searchClearBtn) {
        endSearchMode();
      }
    }, true);

    searchInput.addEventListener('input', updateSearchFromInput);
    searchInput.addEventListener('keydown', (e) => {
      e.stopImmediatePropagation();
      e.stopPropagation();

      if (e.key === 'Escape' || e.key === 'Esc') {
        endSearchMode();
        e.preventDefault();
      } else if (e.key === 'Enter' || e.code === 'NumpadEnter') {
        endSearchMode();
        e.preventDefault();
      }
    }, { capture: true });
    window.addEventListener('keydown', (e) => {
      if (!isSearchMode) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (!(e.key === 'Escape' || e.key === 'Esc' || e.key === 'Enter' || e.code === 'NumpadEnter')) return;
      endSearchMode();
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
    }, true);
    searchInput.addEventListener('keyup', (e) => e.stopPropagation(), { capture: true });
    searchInput.addEventListener('keypress', (e) => e.stopPropagation(), { capture: true });
    searchInput.addEventListener('compositionstart', (e) => e.stopPropagation(), { capture: true });
    searchInput.addEventListener('compositionupdate', (e) => e.stopPropagation(), { capture: true });
    searchInput.addEventListener('compositionend', (e) => e.stopPropagation(), { capture: true });

    if (searchClearBtn) {
      searchClearBtn.classList.toggle('is-hidden', searchInput.value.length === 0);
    }
  }
}

// Global shortcut for toggling visibility
window.addEventListener('keydown', (e) => {
    const activeEl = document.activeElement;
    const isTypingInOverlayInput = !!(activeEl && (
      activeEl.id === 'fc-search-input' ||
      activeEl.id === 'fc-shortcut-input' ||
      activeEl.classList?.contains('fc-edit-input') ||
      activeEl.classList?.contains('fc-input')
    ));

    // Comment jump: Ctrl + Left/Right
    if (!isTypingInOverlayInput && videoElement && e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
            const isRight = e.key === 'ArrowRight' || e.code === 'ArrowRight';
            const current = Number(videoElement.currentTime || 0);
            const EPS = 0.001;
            const timeline = comments
              .map(c => Number(c.t))
              .filter(t => Number.isFinite(t))
              .sort((a, b) => a - b)
              .filter((t, i, arr) => i === 0 || Math.abs(t - arr[i - 1]) > EPS);

            let target = null;
            if (isRight) {
              target = timeline.find(t => t > current + EPS) ?? null;
            } else {
              // Jump to previous comment from the current comment anchor.
              let currentIdx = -1;
              for (let i = 0; i < timeline.length; i++) {
                if (timeline[i] <= current + EPS) currentIdx = i;
                else break;
              }
              if (currentIdx > 0) target = timeline[currentIdx - 1];
            }

            if (target !== null) {
              videoElement.currentTime = target;
              const targetComment = comments.find(c => Math.abs(Number(c.t) - target) <= EPS);
              if (targetComment && typeof showJumpPreview === 'function') {
                showJumpPreview(targetComment);
              }
            }

            e.preventDefault();
            e.stopPropagation();
            return;
        }
    }

    // Check config
    if (
        e.code === shortcutConfig.key &&
        e.altKey === shortcutConfig.altKey &&
        e.ctrlKey === shortcutConfig.ctrlKey &&
        e.shiftKey === shortcutConfig.shiftKey
    ) {
        e.preventDefault();
        e.stopPropagation();

        const overlay = document.getElementById('fanza-comment-overlay');
        if (overlay) {
            if (overlay.style.display === 'none') {
                overlay.style.display = 'flex';
                // Try to focus input (only if not minimized and visible)
                if (!overlay.classList.contains('minimized')) {
                    const input = overlay.querySelector('.fc-input-area .fc-input');
                    if (input) input.focus();
                }
            } else {
                overlay.style.display = 'none';
                
                // Return focus to video/body so spacebar still works for player
                if (document.activeElement && overlay.contains(document.activeElement)) {
                    document.activeElement.blur();
                }
                
                if (videoElement) {
                    videoElement.focus();
                } else {
                    if (!document.body.getAttribute('tabindex')) {
                        document.body.setAttribute('tabindex', '-1');
                    }
                    document.body.focus();
                }
            }
        }
    }
}, true); // Capture phase to ensure we get it

// Keep track of last rendered state to avoid full DOM rebuilds
let lastRenderedCommentCount = 0;
let lastRenderedSearchQuery = '';

function renderComments(currentTime) {
  const list = document.getElementById('fc-list');
  const overlay = document.getElementById('fanza-comment-overlay');
  if (!list || !overlay) return;

  const NEAR_THRESHOLD = 2; // seconds
  
  // Filter comments based on search query
  const filteredComments = searchQuery 
    ? comments.filter(c => c.text.toLowerCase().includes(searchQuery))
    : comments;

  const needsRebuild = filteredComments.length !== lastRenderedCommentCount || searchQuery !== lastRenderedSearchQuery;
  
  if (needsRebuild) {
    list.innerHTML = '';
    
    filteredComments.forEach(c => {
      const isEditing = editingCommentId === c.id;
      const item = document.createElement('div');
      item.className = 'fc-comment';
      item.dataset.time = c.t; 
      item.dataset.id = c.id;
      
      if (isEditing) {
          const editInput = document.createElement('input');
          editInput.type = 'text';
          editInput.className = 'fc-edit-input';
          editInput.value = c.text;
          
          item.appendChild(editInput);
          
          // Focus after append
          setTimeout(() => editInput.focus(), 0);
          
          const saveEdit = () => {
              const newText = editInput.value.trim();
              if (newText) {
                  c.text = newText;
                  saveComments();
              }
              editingCommentId = null;
              lastRenderedCommentCount = 0; // Force rebuild
              renderComments(videoElement ? videoElement.currentTime : 0);
          };
          
          editInput.addEventListener('keydown', (e) => {
              e.stopPropagation();
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape' || e.key === 'Esc') {
                  editingCommentId = null;
                  lastRenderedCommentCount = 0;
                  renderComments(videoElement ? videoElement.currentTime : 0);
              }
          }, { capture: true });
          editInput.addEventListener('keyup', (e) => e.stopPropagation(), { capture: true });
          editInput.addEventListener('keypress', (e) => e.stopPropagation(), { capture: true });
          editInput.addEventListener('mousedown', (e) => e.stopPropagation(), { capture: true });
          editInput.addEventListener('click', (e) => e.stopPropagation(), { capture: true });
      } else {
          const timeSpan = document.createElement('span');
          timeSpan.className = 'fc-time';
          timeSpan.textContent = formatTime(c.t);
          
          const textSpan = document.createElement('span');
          textSpan.textContent = c.text;
          
          const delBtn = document.createElement('span');
          delBtn.className = 'fc-delete-btn';
          delBtn.innerHTML = '&times;';
          delBtn.title = '削除';
          delBtn.onclick = (e) => {
              e.stopPropagation();
              if (confirm('このコメントを削除しますか？')) {
                  comments = comments.filter(comm => comm.id !== c.id);
                  saveComments();
                  renderComments(videoElement ? videoElement.currentTime : 0);
              }
          };

          const editBtn = document.createElement('span');
          editBtn.className = 'fc-edit-btn';
          editBtn.innerHTML = '✎';
          editBtn.title = '編集';
          editBtn.onclick = (e) => {
              e.stopPropagation();
              if (videoElement) {
                videoElement.currentTime = c.t;
                videoElement.pause();
              }
              editingCommentId = c.id;
              lastRenderedCommentCount = 0; // Force rebuild to show input
              renderComments(videoElement ? videoElement.currentTime : 0);
          };
          
          item.appendChild(delBtn);
          item.appendChild(editBtn);
          item.appendChild(timeSpan);
          item.appendChild(textSpan);
          
          item.addEventListener('click', () => {
            if(videoElement) {
              videoElement.currentTime = c.t;
              videoElement.play().catch(()=>{});
              
              const autoMin = overlay.querySelector('#fc-auto-min');
              if (autoMin && autoMin.checked && overlay.toggleMinimize) {
                   overlay.toggleMinimize(true);
              }
            }
          });
      }
  
      list.appendChild(item);
    });
    lastRenderedCommentCount = filteredComments.length;
    lastRenderedSearchQuery = searchQuery;
  }

  // Update active status only
  const items = list.children;
  let activeItem = null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const t = parseFloat(item.dataset.time);
    const diff = Math.abs(t - currentTime);
    
    if (diff <= NEAR_THRESHOLD) {
      item.classList.add('active');
      if (!activeItem) activeItem = item; // First active one is primary
    } else {
      item.classList.remove('active');
    }
  }

  // Auto scroll to active?
  const activeEl = document.activeElement;
  const isTypingInOverlayInput = !!(activeEl && (
    activeEl.id === 'fc-search-input' ||
    activeEl.classList?.contains('fc-edit-input') ||
    activeEl.classList?.contains('fc-input')
  ));

  if (activeItem && !isMinimized && !isTypingInOverlayInput) {
    // Only scroll if we are not manually scrolling? 
    // For now, simple behavior:
    activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

async function init() {
  const currentVideoId = getVideoId();
  console.log("Video Memo: Init", getSiteKey(), currentVideoId);

  if (lastVideoId === currentVideoId && document.getElementById('fanza-comment-overlay')) {
    return;
  }
  lastVideoId = currentVideoId;

  if (findVideoIntervalId) {
    clearInterval(findVideoIntervalId);
    findVideoIntervalId = null;
  }
  if (renderIntervalId) {
    clearInterval(renderIntervalId);
    renderIntervalId = null;
  }

  const existingOverlay = document.getElementById('fanza-comment-overlay');
  if (existingOverlay) existingOverlay.remove();
  const existingPreview = document.getElementById('fc-jump-preview');
  if (existingPreview) existingPreview.remove();
  videoElement = null;
  editingCommentId = null;
  searchQuery = '';
  lastRenderedCommentCount = 0;
  lastRenderedSearchQuery = '';

  await loadComments();
  
  findVideoIntervalId = setInterval(() => {
    const v = document.querySelector('video');
    if (!v) return;

    console.log("Video Memo: Video found", v);
    videoElement = v;
    clearInterval(findVideoIntervalId);
    findVideoIntervalId = null;
    createOverlay();
    
    renderIntervalId = setInterval(() => {
      if (document.getElementById('fc-list')) {
         renderComments(v.currentTime);
      }
    }, 1000);
  }, 1000);
}

function setupRouteObserver() {
  const handleRouteChange = () => {
    if (lastPageHref === window.location.href) return;
    lastPageHref = window.location.href;
    init();
  };

  setInterval(handleRouteChange, 800);
  window.addEventListener('popstate', handleRouteChange, true);
  window.addEventListener('yt-navigate-finish', handleRouteChange, true);
  window.addEventListener('yt-page-data-updated', handleRouteChange, true);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupRouteObserver();
      init();
    });
} else {
    setupRouteObserver();
    init();
}
