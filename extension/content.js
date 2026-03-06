const FC_EARLY_GUARD_INSTALLED = '__fanza_comment_early_guard_installed__';
const VIDEO_MEMO_COMMENTS_PREFIX = 'video_memo_comments_';
const VIDEO_MEMO_META_PREFIX = 'video_memo_meta_';
const BACKUP_SCHEMA_VERSION = 2;
const COMMENT_SCHEMA_VERSION = 1;
const FREE_COMMENT_LIMIT = 50;
const BETA_PERIOD_END_ISO = '2026-04-02T14:59:59.000Z'; // 2026-04-02 23:59:59 JST
const LICENSE_API_BASE_URL = 'https://wzinimxikcihdqqdvppa.supabase.co/functions/v1/license-api';
const CHECKOUT_POLL_INTERVAL_MS = 5000;
const CHECKOUT_POLL_MAX_ATTEMPTS = 60; // 5 min
const ENTITLEMENT_KEY_FIRST_SEEN_AT = 'fanza_memo_first_seen_at';
const ENTITLEMENT_KEY_BETA_GRANDFATHERED = 'fanza_memo_is_beta_grandfathered';
const ENTITLEMENT_KEY_PRO_PURCHASED = 'fanza_memo_is_pro_purchased';
const ENTITLEMENT_KEYS = [
  ENTITLEMENT_KEY_FIRST_SEEN_AT,
  ENTITLEMENT_KEY_BETA_GRANDFATHERED,
  ENTITLEMENT_KEY_PRO_PURCHASED
];
const BACKUP_MANAGED_KEY_PREFIXES = [VIDEO_MEMO_COMMENTS_PREFIX, VIDEO_MEMO_META_PREFIX];
const BACKUP_MANAGED_EXACT_KEYS = [
  'fanza_mock_shortcut',
  'fanza_mock_ui_pos',
  'fanza_mock_default_auto_min',
  ENTITLEMENT_KEY_FIRST_SEEN_AT,
  ENTITLEMENT_KEY_BETA_GRANDFATHERED,
  ENTITLEMENT_KEY_PRO_PURCHASED
];

function isBackupManagedKey(key) {
  if (typeof key !== 'string' || key.length === 0) return false;
  if (BACKUP_MANAGED_EXACT_KEYS.includes(key)) return true;
  return BACKUP_MANAGED_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}

function pickManagedBackupData(storageObject) {
  const src = (storageObject && typeof storageObject === 'object') ? storageObject : {};
  return Object.fromEntries(
    Object.entries(src).filter(([key]) => isBackupManagedKey(key))
  );
}

function getStorageLocalAll() {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (all) => resolve(all || {}));
  });
}

function setStorageLocal(items) {
  return new Promise((resolve) => {
    const payload = (items && typeof items === 'object') ? items : {};
    if (Object.keys(payload).length === 0) {
      resolve();
      return;
    }
    chrome.storage.local.set(payload, () => resolve());
  });
}

function removeStorageLocal(keys) {
  return new Promise((resolve) => {
    if (!Array.isArray(keys) || keys.length === 0) {
      resolve();
      return;
    }
    chrome.storage.local.remove(keys, () => resolve());
  });
}

function getStorageLocal(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => resolve(result || {}));
  });
}

function getStorageSync(keys) {
  return new Promise((resolve) => {
    chrome.storage.sync.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        resolve({});
        return;
      }
      resolve(result || {});
    });
  });
}

function setStorageSync(items) {
  return new Promise((resolve) => {
    const payload = (items && typeof items === 'object') ? items : {};
    if (Object.keys(payload).length === 0) {
      resolve();
      return;
    }
    chrome.storage.sync.set(payload, () => resolve());
  });
}

function getDeviceFingerprint() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['fanza_memo_device_fingerprint'], (res) => {
      let fp = res.fanza_memo_device_fingerprint;
      if (!fp) {
        fp = crypto.randomUUID();
        chrome.storage.local.set({ fanza_memo_device_fingerprint: fp });
      }
      resolve(fp);
    });
  });
}

function saveTextAsFile(filename, content) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function toBackupDateStamp(date = new Date()) {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}_${hh}${mi}${ss}`;
}

function buildBackupFileName() {
  return `kamishine_memo_backup_${toBackupDateStamp()}.json`;
}

function generateCommentId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `c_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

function normalizeCommentTimestamp(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Number(parsed.toFixed(2));
}

function getCommentMigrationContext() {
  const { siteKey, videoId } = getStorageKeys();
  return { siteKey, videoId };
}

function normalizeCommentRecord(raw, context) {
  const src = (raw && typeof raw === 'object') ? raw : {};
  const text = String(src.text ?? '').trim();
  if (!text) return { comment: null, changed: true };

  const commentId = String(src.comment_id || src.share_id || src.id || '').trim() || generateCommentId();
  const legacyId = (src.id !== undefined && src.id !== null) ? src.id : commentId;
  const createdAtRaw = String(src.created_at || src.createdAt || '').trim();
  const updatedAtRaw = String(src.updated_at || src.updatedAt || '').trim();
  const createdAt = createdAtRaw || new Date().toISOString();
  const updatedAt = updatedAtRaw || createdAt;
  const visibility = (src.visibility === 'shared') ? 'shared' : 'private';
  const comment = {
    id: legacyId,
    comment_id: commentId,
    schema_version: COMMENT_SCHEMA_VERSION,
    site: String(src.site || context.siteKey || ''),
    video_id: String(src.video_id || context.videoId || ''),
    t: normalizeCommentTimestamp(src.t),
    text,
    work_key: String(src.work_key || context.videoId || 'mock'),
    isLocal: src.isLocal !== false,
    visibility,
    share_id: String(src.share_id || ''),
    created_at: createdAt,
    updated_at: updatedAt
  };

  const changed = !src.comment_id
    || src.schema_version !== COMMENT_SCHEMA_VERSION
    || String(src.site || '') !== comment.site
    || String(src.video_id || '') !== comment.video_id
    || String(src.visibility || 'private') !== visibility
    || normalizeCommentTimestamp(src.t) !== Number(src.t)
    || String(src.created_at || src.createdAt || '') !== createdAt
    || String(src.updated_at || src.updatedAt || '') !== updatedAt;

  return { comment, changed };
}

function normalizeCommentsArray(rawComments, context) {
  if (!Array.isArray(rawComments)) {
    return { comments: [], changed: true };
  }
  const normalized = [];
  let changed = false;
  rawComments.forEach((item) => {
    const { comment, changed: rowChanged } = normalizeCommentRecord(item, context);
    if (!comment) {
      changed = true;
      return;
    }
    if (rowChanged) changed = true;
    normalized.push(comment);
  });
  normalized.sort((a, b) => a.t - b.t);
  if (normalized.length > 300) {
    changed = true;
    return { comments: normalized.slice(-300), changed };
  }
  return { comments: normalized, changed };
}

function createLocalComment(text, timestamp, context) {
  const nowIso = new Date().toISOString();
  return {
    id: Date.now() + Math.random(),
    comment_id: generateCommentId(),
    schema_version: COMMENT_SCHEMA_VERSION,
    site: context.siteKey,
    video_id: context.videoId,
    t: normalizeCommentTimestamp(timestamp),
    text: String(text || '').trim(),
    work_key: context.videoId || 'mock',
    isLocal: true,
    visibility: 'private',
    share_id: '',
    created_at: nowIso,
    updated_at: nowIso
  };
}

// Share payload boundary:
// keep comment text local by default and only export timeline markers.
function serializeCommentForShare(rawComment) {
  const src = (rawComment && typeof rawComment === 'object') ? rawComment : {};
  return {
    comment_id: String(src.comment_id || ''),
    site: String(src.site || ''),
    video_id: String(src.video_id || ''),
    t: normalizeCommentTimestamp(src.t),
    visibility: (src.visibility === 'shared') ? 'shared' : 'private',
    share_id: String(src.share_id || ''),
    created_at: String(src.created_at || ''),
    updated_at: String(src.updated_at || '')
  };
}

function buildShareableMarkers(rawComments) {
  if (!Array.isArray(rawComments)) return [];
  return rawComments
    .filter((c) => c && c.visibility === 'shared')
    .map((c) => serializeCommentForShare(c))
    .filter((c) => c.comment_id && c.site && c.video_id && Number.isFinite(c.t));
}

function normalizeImportedBackup(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.data && typeof raw.data === 'object') {
    return {
      version: Number(raw.version) || BACKUP_SCHEMA_VERSION,
      data: pickManagedBackupData(raw.data)
    };
  }
  return {
    version: BACKUP_SCHEMA_VERSION,
    data: pickManagedBackupData(raw)
  };
}

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
    width: 380px;
    height: 440px;
    min-width: 320px;
    min-height: 200px;
    background: rgba(30, 30, 35, 0.82); /* Match actual UI transparency (ref: Step Id: 2096) */
    color: #f1f5f9;
    z-index: 2147483647;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    pointer-events: auto;
    overflow: hidden;
    backdrop-filter: blur(24px); 
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.12); 
    resize: both;
  }
  
  /* --- Light Theme --- */
  #fanza-comment-overlay.fc-light-theme {
    background: rgba(255, 255, 255, 0.9);
    color: #2c3e50;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  }
  #fanza-comment-overlay.fc-light-theme .fc-header {
    background: rgba(0, 0, 0, 0.04);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }
  #fanza-comment-overlay.fc-light-theme .fc-header-btns button {
    color: #64748b !important;
  }
  #fanza-comment-overlay.fc-light-theme .fc-header-btns button:hover {
    background: rgba(0, 0, 0, 0.08) !important;
    color: #1e293b !important;
  }
  #fanza-comment-overlay.fc-light-theme .fc-settings h4 { color: #1e293b; }
  #fanza-comment-overlay.fc-light-theme #fc-video-summary { color: #64748b !important; }
  #fanza-comment-overlay.fc-light-theme .fc-comment {
    background: rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }
  #fanza-comment-overlay.fc-light-theme .fc-comment:hover {
    background: rgba(0, 0, 0, 0.06);
    border-color: rgba(0, 0, 0, 0.08);
  }
  #fanza-comment-overlay.fc-light-theme .fc-comment.active {
    background: linear-gradient(90deg, rgba(225, 48, 108, 0.08) 0%, rgba(0, 0, 0, 0.02) 100%);
    border-color: rgba(225, 48, 108, 0.3);
  }
  #fanza-comment-overlay.fc-light-theme .fc-time {
    background: rgba(0, 0, 0, 0.06);
    color: #475569;
  }
  #fanza-comment-overlay.fc-light-theme .fc-input-area,
  #fanza-comment-overlay.fc-light-theme .fc-search-area {
    background: rgba(0, 0, 0, 0.02);
    border-bottom-color: rgba(0, 0, 0, 0.06);
    border-top-color: rgba(0, 0, 0, 0.06);
  }
  #fanza-comment-overlay.fc-light-theme .fc-input,
  #fanza-comment-overlay.fc-light-theme .fc-search-input {
    background: #fff;
    color: #1e293b;
    border: 1px solid rgba(0, 0, 0, 0.15);
  }
  #fanza-comment-overlay.fc-light-theme .fc-input:focus,
  #fanza-comment-overlay.fc-light-theme .fc-search-input:focus {
    background: #fff;
    border-color: #e1306c;
    box-shadow: 0 0 0 2px rgba(225, 48, 108, 0.15);
  }
  #fanza-comment-overlay.fc-light-theme .fc-btn {
    background: #fff;
    color: #64748b;
    border: 1px solid rgba(0, 0, 0, 0.15);
  }
  #fanza-comment-overlay.fc-light-theme .fc-btn:hover {
    background: #f8fafc;
    color: #1e293b;
    border-color: rgba(0, 0, 0, 0.25);
  }
  #fanza-comment-overlay.fc-light-theme #fc-video-index {
    background: rgba(0,0,0,0.02) !important;
    border-color: rgba(0,0,0,0.08) !important;
  }
  #fanza-comment-overlay.fc-light-theme .fc-video-index-item {
    background: #ffffff !important;
    border: 1px solid rgba(0,0,0,0.04) !important;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }
  #fanza-comment-overlay.fc-light-theme .fc-video-index-item.fc-current-video {
    background: #f0f9ff !important;
    border-color: #bae6fd !important;
  }
  #fanza-comment-overlay.fc-light-theme .fc-video-index-item * { color: #475569 !important; }
  #fanza-comment-overlay.fc-light-theme .fc-video-index-delete { background: rgba(0,0,0,0.05) !important; border-color: rgba(0,0,0,0.08) !important; color: #64748b !important; }
  #fanza-comment-overlay.fc-light-theme .fc-video-index-delete:hover { background: rgba(239,68,68,0.1) !important; color: #ef4444 !important; }
  
  /* --- End Light Theme --- */
  
  .fc-header {
    padding: 12px 14px;
    background: rgba(255, 255, 255, 0.08);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: grab;
    height: 46px;
    box-sizing: border-box;
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.02em;
    color: inherit;
    gap: 10px;
  }
  #fc-status {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .fc-header:active {
    cursor: grabbing;
  }
  .fc-list {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .fc-settings {
    flex: 1;
    padding: 14px;
    display: none;
    flex-direction: column;
    gap: 12px;
    font-size: 13px;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .fc-settings h4 {
    margin: 0 0 4px 0;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
  }
  .fc-settings::-webkit-scrollbar, .fc-list::-webkit-scrollbar { width: 6px; }
  .fc-settings::-webkit-scrollbar-track, .fc-list::-webkit-scrollbar-track { background: transparent; }
  .fc-settings::-webkit-scrollbar-thumb, .fc-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
  .fc-settings::-webkit-scrollbar-thumb:hover, .fc-list::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
  
  .fc-comment {
    background: rgba(255, 255, 255, 0.06);
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.4;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  .fc-comment:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.12);
  }
  .fc-comment.active {
    border-left: 3px solid #e1306c;
    background: linear-gradient(90deg, rgba(225, 48, 108, 0.18) 0%, rgba(255, 255, 255, 0.08) 100%);
    border-color: rgba(225, 48, 108, 0.35);
  }
  .fc-time {
    font-size: 11px;
    font-weight: 600;
    color: #cbd5e1;
    margin-right: 8px;
    background: rgba(0,0,0,0.4);
    padding: 2px 6px;
    border-radius: 4px;
  }
  .fc-input-area {
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    display: flex;
    gap: 8px;
  }
  .fc-input {
    flex: 1;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 8px 12px;
    border-radius: 6px;
    outline: none;
    font-size: 13px;
    transition: all 0.2s ease;
  }
  .fc-input:focus {
    border-color: #e1306c;
    box-shadow: 0 0 0 2px rgba(225, 48, 108, 0.3);
    background: rgba(0, 0, 0, 0.7);
  }
  .fc-btn {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #f1f5f9;
    padding: 8px 14px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    font-size: 13px;
    transition: all 0.2s ease;
  }
  .fc-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.25);
  }
  .fc-btn-pro {
    background: rgba(225, 48, 108, 0.08);
    border: 1px solid rgba(225, 48, 108, 0.25);
    color: #fda4af;
  }
  .fc-btn-pro:hover {
    background: rgba(225, 48, 108, 0.12);
    color: #fff;
  }
  
  .fc-delete-btn {
    float: right;
    color: #64748b;
    cursor: pointer;
    font-size: 16px;
    line-height: 12px;
    margin-left: 8px;
    display: none;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s;
  }
  .fc-comment:hover .fc-delete-btn { display: block; }
  .fc-delete-btn:hover {
    color: #ef4444; /* Red 500 */
    background: rgba(239, 68, 68, 0.15);
  }

  /* Minimized state */
  #fanza-comment-overlay.minimized {
    height: 46px !important;
    width: 380px !important;
    min-height: 0 !important;
    min-width: 0 !important;
    overflow: hidden;
    border-radius: 12px; /* Match expanded state */
    resize: none !important;
  }
  #fanza-comment-overlay.minimized .fc-header {
    border-bottom: none;
  }
  #fanza-comment-overlay.minimized .fc-list,
  #fanza-comment-overlay.minimized .fc-input-area,
  #fanza-comment-overlay.minimized .fc-search-area,
  #fanza-comment-overlay.minimized .fc-settings { display: none !important; }
  
  .fc-header-btns {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-shrink: 0;
  }
  .fc-auto-min-label {
    font-size: 10px;
    color: #94a3b8;
    margin-right: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }
  .fc-header-btns button {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background 0.2s, color 0.2s;
    color: #94a3b8 !important; /* Slate 400 */
  }
  .fc-header-btns button:hover {
    background: rgba(255,255,255,0.1) !important;
    color: #fff !important;
  }
  
  .fc-edit-btn {
    float: right;
    color: #64748b;
    cursor: pointer;
    font-size: 14px;
    line-height: 12px;
    margin-left: 8px;
    display: none;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s;
  }
  .fc-comment:hover .fc-edit-btn { display: block; }
  .fc-edit-btn:hover { color: #38bdf8; background: rgba(56, 189, 248, 0.15); }
  
  .fc-edit-input {
    width: 100%;
    background: rgba(0,0,0,0.5);
    border: 1px solid #38bdf8;
    color: white;
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 13px;
    outline: none;
    box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
    box-sizing: border-box;
    margin-top: 4px;
  }
  
  .fc-search-area {
    padding: 8px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
    display: flex;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;
  }
  .fc-search-input {
    flex: 1;
    min-width: 0;
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.1);
    color: #f1f5f9;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    outline: none;
    transition: all 0.2s;
    box-sizing: border-box;
  }
  .fc-search-input:focus, .fc-search-input.fc-search-active {
    border-color: #38bdf8;
    background: rgba(0,0,0,0.5);
    box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
  }
  
  .fc-search-clear {
    width: 26px;
    height: 26px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: #94a3b8;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: all 0.2s;
  }
  .fc-search-clear:hover {
    color: #f87171;
    background: rgba(248, 113, 113, 0.15);
  }
  .fc-search-clear.is-hidden { opacity: 0; pointer-events: none; }
  
  .fc-jump-preview {
    position: absolute;
    z-index: 2147483647;
    max-width: 320px;
    background: rgba(15, 15, 20, 0.85);
    backdrop-filter: blur(8px);
    color: #fff;
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    line-height: 1.5;
    pointer-events: none;
    opacity: 0;
    transform: translate(-50%, 8px);
    transition: opacity .2s cubic-bezier(0.4, 0, 0.2, 1), transform .2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: none;
    box-sizing: border-box;
  }
  .fc-jump-preview.show {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  .fc-jump-preview-time { color: #38bdf8; font-weight: 600; margin-right: 6px; }
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
let refreshVideoIndex = null;
let refreshLimitStatus = null;
let findVideoIntervalId = null;
let renderIntervalId = null;
let videoTimeUpdateHandler = null;
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

let entitlementState = {
  firstSeenAt: 0,
  isBetaGrandfathered: false,
  isProPurchased: false
};

function hasUnlimitedAccess() {
  return !!(entitlementState.isBetaGrandfathered || entitlementState.isProPurchased);
}

function getRemainingCommentSlots() {
  return Math.max(0, FREE_COMMENT_LIMIT - comments.length);
}

function isFreeLimitReached() {
  return !hasUnlimitedAccess() && comments.length >= FREE_COMMENT_LIMIT;
}

function getEntitlementLabel() {
  if (entitlementState.isProPurchased) return 'Pro';
  if (entitlementState.isBetaGrandfathered) return 'ベータ特典';
  return '無料';
}

function getHeaderStatusLabel() {
  if (entitlementState.isProPurchased) return 'シーン・メモ (Pro)';
  return 'シーン・メモ';
}

async function loadEntitlements() {
  const [syncValues, localValues] = await Promise.all([
    getStorageSync(ENTITLEMENT_KEYS),
    getStorageLocal(ENTITLEMENT_KEYS)
  ]);

  const now = Date.now();
  const betaEndAt = Date.parse(BETA_PERIOD_END_ISO);
  let firstSeenAt = Number(syncValues[ENTITLEMENT_KEY_FIRST_SEEN_AT] || localValues[ENTITLEMENT_KEY_FIRST_SEEN_AT] || 0);
  let isBetaGrandfathered = !!(syncValues[ENTITLEMENT_KEY_BETA_GRANDFATHERED] || localValues[ENTITLEMENT_KEY_BETA_GRANDFATHERED]);
  const isProPurchased = !!(syncValues[ENTITLEMENT_KEY_PRO_PURCHASED] || localValues[ENTITLEMENT_KEY_PRO_PURCHASED]);

  if (!firstSeenAt) {
    firstSeenAt = now;
  }
  if (!isBetaGrandfathered && firstSeenAt <= betaEndAt) {
    isBetaGrandfathered = true;
  }

  const canonical = {
    [ENTITLEMENT_KEY_FIRST_SEEN_AT]: firstSeenAt,
    [ENTITLEMENT_KEY_BETA_GRANDFATHERED]: isBetaGrandfathered,
    [ENTITLEMENT_KEY_PRO_PURCHASED]: isProPurchased
  };

  await Promise.all([
    setStorageLocal(canonical),
    setStorageSync(canonical)
  ]);

  entitlementState = {
    firstSeenAt,
    isBetaGrandfathered,
    isProPurchased
  };
}

async function verifyDeviceEntitlement() {
  const fp = await getDeviceFingerprint();
  const response = await fetch(`${LICENSE_API_BASE_URL}/verify-device`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ device_fingerprint: fp })
  });
  if (!response.ok) return false;
  const data = await response.json();
  return !!(data && data.ok && data.is_pro);
}

async function persistProEntitlement() {
  const patch = { [ENTITLEMENT_KEY_PRO_PURCHASED]: true };
  await Promise.all([setStorageLocal(patch), setStorageSync(patch)]);
  entitlementState = { ...entitlementState, isProPurchased: true };
  refreshLimitStatus?.();
}

// Video ID Extraction
function getSiteKey() {
  const host = window.location.hostname;
  if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
  if (host.includes('tv.dmm.com')) return 'dmmtv';
  if (host.includes('dmm.co.jp')) return 'dmm';
  return host.replace(/[^\w.-]/g, '_') || 'site';
}

function isSupportedPlaybackPage() {
  const siteKey = getSiteKey();
  const path = window.location.pathname || '';
  if (siteKey === 'youtube') {
    if (path === '/watch') return true;
    if (path.startsWith('/shorts/')) return true;
    if (path.startsWith('/live/')) return true;
    return false;
  }
  if (siteKey === 'dmmtv') {
    return path.startsWith('/vod/playback/');
  }
  return true;
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

  if (siteKey === 'dmmtv') {
    const contentId = String(params.get('content') || '').trim();
    const seasonId = String(params.get('season') || '').trim();
    if (contentId && seasonId) return `dmmtv_${contentId}__${seasonId}`;
    if (contentId) return `dmmtv_${contentId}`;
    if (seasonId) return `dmmtv_season_${seasonId}`;
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
  const suffix = `${siteKey}_${videoId}`;
  return {
    siteKey,
    videoId,
    suffix,
    storageKey: `${VIDEO_MEMO_COMMENTS_PREFIX}${suffix}`,
    metaKey: `${VIDEO_MEMO_META_PREFIX}${suffix}`,
    legacyStorageKey: `fanza_mock_comments_${videoId}`
  };
}

function getSiteLabel(site) {
  if (site === 'youtube') return 'YouTube';
  if (site === 'dmmtv') return 'DMM TV';
  if (site === 'dmm') return 'FANZA';
  return site;
}

function normalizeVideoTitle(rawTitle, fallback) {
  const t = String(rawTitle || '').trim();
  if (!t) return fallback;
  if (/^https?:\/\//i.test(t) || /^www\./i.test(t)) return fallback;
  return t;
}

function isPlaceholderTitle(site, title) {
  const t = String(title || '').trim();
  if (!t) return true;
  if (/^https?:\/\//i.test(t)) return true;

  if (site === 'youtube') {
    return /^YouTube$/i.test(t) || /^- YouTube$/i.test(t);
  }
  if (site === 'dmmtv') {
    return /^DMM\s*TV$/i.test(t) || /^DMM\s*TV\s*プレイヤー$/i.test(t);
  }
  if (site === 'dmm') {
    return /^(DMM|FANZA)\s*Player$/i.test(t) || /^(DMM|FANZA)\s*プレイヤー$/i.test(t);
  }
  return false;
}

function pickBestTitle(site, candidates, fallback) {
  for (const c of candidates) {
    const t = String(c || '').trim();
    if (!t) continue;
    if (isPlaceholderTitle(site, t)) continue;
    return t;
  }
  return fallback;
}

function getCurrentPageTitle(site, fallback) {
  const candidates = [];

  if (site === 'youtube') {
    const h1Title = document.querySelector('h1.ytd-watch-metadata yt-formatted-string')?.textContent?.trim();
    candidates.push(h1Title);
  }

  // Common metadata
  candidates.push(
    document.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim(),
    document.querySelector('meta[name="og:title"]')?.getAttribute('content')?.trim(),
    document.querySelector('meta[name="twitter:title"]')?.getAttribute('content')?.trim(),
    document.querySelector('meta[name="title"]')?.getAttribute('content')?.trim()
  );

  if (site === 'dmm' || site === 'dmmtv') {
    // Player DOM variants: pick likely work title nodes if available.
    const dmmTitleSelectors = [
      'h1',
      '[class*="title"]',
      '[class*="Title"]',
      '[data-title]',
      '[data-work-title]'
    ];
    for (const sel of dmmTitleSelectors) {
      const node = document.querySelector(sel);
      const txt = node?.getAttribute?.('data-title') || node?.getAttribute?.('data-work-title') || node?.textContent;
      if (txt) candidates.push(String(txt).trim());
    }
  }

  candidates.push((document.title || '').trim());

  let title = pickBestTitle(site, candidates, fallback);
  if (site === 'youtube') {
    title = title.replace(/\s*-\s*YouTube\s*$/i, '').trim();
  }
  if (site === 'dmmtv') {
    title = title
      .replace(/\s*[\-|｜]\s*DMM\s*TV\s*$/i, '')
      .replace(/^\s*DMM\s*TV\s*[\-|｜]\s*/i, '')
      .trim();
  }
  if (site === 'dmm') {
    title = title
      .replace(/\s*-\s*(DMM|FANZA)\s*(Player|プレイヤー)\s*$/i, '')
      .trim();
  }
  return normalizeVideoTitle(title, fallback);
}

function getCurrentVideoMeta() {
  const { siteKey, videoId } = getStorageKeys();
  const fallbackTitle = `${getSiteLabel(siteKey)} / ${videoId}`;
  return {
    site: siteKey,
    videoId,
    title: getCurrentPageTitle(siteKey, fallbackTitle),
    url: window.location.href,
    updatedAt: Date.now()
  };
}

function normalizeStoredVideoId(site, rawId) {
  let id = String(rawId || '').trim();
  if (!id) return '';

  if (site === 'youtube') {
    // Normalize accidental prefixes from older keys like "youtube_yt_xxx".
    id = id.replace(/^youtube_+/i, '');
    const markerMatch = id.match(/(yt_(?:shorts_|live_)?[A-Za-z0-9_-]+)/);
    if (markerMatch && markerMatch[1]) id = markerMatch[1];
  } else if (site === 'dmmtv') {
    id = id.replace(/^dmmtv_+/i, 'dmmtv_');
  } else if (site === 'dmm') {
    id = id.replace(/^dmm_+/i, '');
  }
  return id;
}

function buildVideoUrlFromEntry(entry) {
  const site = String(entry.site || '');
  const id = normalizeStoredVideoId(site, entry.videoId);

  if (site === 'youtube') {
    if (!id) {
      const fallbackUrl = String(entry.url || '').trim();
      return fallbackUrl;
    }
    if (id.startsWith('yt_shorts_')) return `https://www.youtube.com/shorts/${id.replace('yt_shorts_', '')}`;
    if (id.startsWith('yt_live_')) return `https://www.youtube.com/live/${id.replace('yt_live_', '')}`;
    if (id.startsWith('yt_')) return `https://www.youtube.com/watch?v=${id.replace('yt_', '')}`;
    return `https://www.youtube.com/watch?v=${id}`;
  }

  if (site === 'dmmtv') {
    if (id.startsWith('dmmtv_')) {
      const payload = id.replace(/^dmmtv_/, '');
      const [contentId, seasonId] = payload.split('__');
      if (contentId && seasonId) {
        return `https://tv.dmm.com/vod/playback/on-demand/?season=${encodeURIComponent(seasonId)}&content=${encodeURIComponent(contentId)}`;
      }
      if (contentId) {
        return `https://tv.dmm.com/vod/playback/on-demand/?content=${encodeURIComponent(contentId)}`;
      }
    }
    const fallbackUrl = String(entry.url || '').trim();
    if (fallbackUrl) return fallbackUrl;
  }

  const url = String(entry.url || '').trim();
  if (url) return url;
  if (!id) return '';
  if (site === 'dmm') {
    return `https://www.dmm.co.jp/digital/-/player/=/player=html5/act=playlist/pid=${encodeURIComponent(id)}/`;
  }
  return '';
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseStoredCommentSuffix(suffix) {
  const firstUnderscore = suffix.indexOf('_');
  const site = firstUnderscore > -1 ? suffix.slice(0, firstUnderscore) : 'site';
  const rawVideoId = firstUnderscore > -1 ? suffix.slice(firstUnderscore + 1) : suffix;
  const videoId = normalizeStoredVideoId(site, rawVideoId);
  return { site, rawVideoId, videoId };
}

function findCommentsKeyByCanonicalId(all, targetSite, targetVideoId) {
  const keys = Object.keys(all || {});
  for (const key of keys) {
    if (!key.startsWith(VIDEO_MEMO_COMMENTS_PREFIX)) continue;
    const suffix = key.slice(VIDEO_MEMO_COMMENTS_PREFIX.length);
    const parsed = parseStoredCommentSuffix(suffix);
    if (parsed.site === targetSite && parsed.videoId === targetVideoId) {
      return key;
    }
  }
  return null;
}

const youtubeTitleCache = new Map();
const pageTitleCache = new Map();

async function fetchYouTubeTitleFromVideoId(videoId) {
  const normalized = normalizeStoredVideoId('youtube', videoId);
  if (!normalized) return '';

  let watchId = normalized;
  if (watchId.startsWith('yt_shorts_')) watchId = watchId.replace(/^yt_shorts_/, '');
  else if (watchId.startsWith('yt_live_')) watchId = watchId.replace(/^yt_live_/, '');
  else if (watchId.startsWith('yt_')) watchId = watchId.replace(/^yt_/, '');
  if (!watchId) return '';

  if (youtubeTitleCache.has(watchId)) return youtubeTitleCache.get(watchId);

  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${watchId}`)}&format=json`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`oembed status: ${res.status}`);
    const json = await res.json();
    const title = normalizeVideoTitle(json?.title || '', '');
    youtubeTitleCache.set(watchId, title);
    return title;
  } catch {
    youtubeTitleCache.set(watchId, '');
    return '';
  }
}

async function fetchTitleFromUrl(url, site, fallbackTitle = '') {
  const targetUrl = String(url || '').trim();
  if (!targetUrl) return fallbackTitle;
  if (pageTitleCache.has(targetUrl)) return pageTitleCache.get(targetUrl);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(targetUrl, { signal: controller.signal, credentials: 'omit' });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`title fetch status: ${res.status}`);
    const html = await res.text();

    const ogMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const raw = (ogMatch && ogMatch[1]) || (titleMatch && titleMatch[1]) || '';
    const decoded = raw
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    const normalized = normalizeVideoTitle(decoded, fallbackTitle);
    const result = isPlaceholderTitle(site, normalized) ? fallbackTitle : normalized;
    pageTitleCache.set(targetUrl, result);
    return result;
  } catch {
    pageTitleCache.set(targetUrl, fallbackTitle);
    return fallbackTitle;
  }
}

function loadCommentedVideos() {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (all) => {
      const entries = [];
      const keys = Object.keys(all);
      keys.forEach((key) => {
        if (!key.startsWith(VIDEO_MEMO_COMMENTS_PREFIX)) return;
        const commentsData = all[key];
        if (!Array.isArray(commentsData) || commentsData.length === 0) return;
        const suffix = key.slice(VIDEO_MEMO_COMMENTS_PREFIX.length);
        const meta = all[`${VIDEO_MEMO_META_PREFIX}${suffix}`] || {};
        const parsed = parseStoredCommentSuffix(suffix);
        const resolvedSite = meta.site || parsed.site;
        const resolvedVideoId = normalizeStoredVideoId(resolvedSite, meta.videoId || parsed.rawVideoId);
        entries.push({
          keySuffix: suffix,
          site: resolvedSite,
          videoId: resolvedVideoId,
          title: meta.title || '',
          url: meta.url || '',
          count: commentsData.length,
          updatedAt: Number(meta.updatedAt || 0)
        });
      });

      entries.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      resolve(entries);
    });
  });
}

// Persistence
async function loadComments() {
  const { siteKey, videoId, storageKey, metaKey } = getStorageKeys();
  const context = getCommentMigrationContext();
  
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (result) => {
      const matchedCommentKey = result[storageKey]
        ? storageKey
        : findCommentsKeyByCanonicalId(result, siteKey, videoId);
      const matchedSuffix = matchedCommentKey
        ? matchedCommentKey.slice(VIDEO_MEMO_COMMENTS_PREFIX.length)
        : '';
      const matchedMetaKey = matchedSuffix ? `${VIDEO_MEMO_META_PREFIX}${matchedSuffix}` : metaKey;
      const legacyStorageKey = `fanza_mock_comments_${videoId}`;
      let shouldPersistNormalizedComments = false;

      if (matchedCommentKey && result[matchedCommentKey]) {
        try {
          const normalized = normalizeCommentsArray(result[matchedCommentKey], context);
          comments = normalized.comments;
          shouldPersistNormalizedComments = normalized.changed;
          console.log(`Loaded comments for ${videoId} from chrome.storage:`, comments.length);
        } catch (e) {
          console.error("Failed to parse comments", e);
          comments = [];
        }
        if (matchedCommentKey !== storageKey) {
          chrome.storage.local.set({ [storageKey]: comments });
          shouldPersistNormalizedComments = false;
        }
      } else if (result[legacyStorageKey]) {
        try {
          const normalized = normalizeCommentsArray(result[legacyStorageKey], context);
          comments = normalized.comments;
          console.log(`Migrated comments for ${videoId} from legacy key:`, comments.length);
          chrome.storage.local.set({ [storageKey]: comments });
          shouldPersistNormalizedComments = false;
        } catch (e) {
          console.error("Failed to parse legacy comments", e);
          comments = [];
        }
      } else {
        // Fallback to localStorage (Migration)
        const saved = localStorage.getItem(storageKey) || localStorage.getItem(legacyStorageKey);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const normalized = normalizeCommentsArray(parsed, context);
            comments = normalized.comments;
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
      if (comments.length > 0) {
        const baseMeta = result[matchedMetaKey] || {};
        chrome.storage.local.set({
          [metaKey]: {
            ...baseMeta,
            ...getCurrentVideoMeta(),
            videoId
          }
        });
      }
      if (shouldPersistNormalizedComments) {
        saveComments();
      }
      resolve();
    });
  });
}

function saveComments(onSaved) {
  const { storageKey, metaKey } = getStorageKeys();
  if (comments.length > 0) {
    chrome.storage.local.set({
      [storageKey]: comments,
      [metaKey]: getCurrentVideoMeta()
    }, () => {
      if (typeof onSaved === 'function') onSaved();
      refreshVideoIndex?.();
    });
    return;
  }
  chrome.storage.local.remove([storageKey, metaKey], () => {
    if (typeof onSaved === 'function') onSaved();
    refreshVideoIndex?.();
  });
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
      <span id="fc-status">シーン・メモ</span>
      <div class="fc-header-btns">
        <label class="fc-auto-min-label">
            <input type="checkbox" id="fc-auto-min"> 自動最小化
        </label>
        <button id="fc-settings-btn" style="background:none;border:none;cursor:pointer;" title="設定">⚙</button>
        <button id="fc-minimize-btn" style="background:none;border:none;cursor:pointer;" title="最小化">_</button>
        <button id="fc-close-btn" style="background:none;border:none;cursor:pointer;" title="非表示">×</button>
      </div>
    </div>
    
    <div class="fc-search-area">
      <input type="text" id="fc-search-input" class="fc-search-input" placeholder="コメント検索...">
      <button type="button" id="fc-search-clear" class="fc-search-clear is-hidden" title="検索をクリア">×</button>
    </div>
    
    <div class="fc-list" id="fc-list"></div>
    
    <div class="fc-settings" id="fc-settings">
        <h4>設定</h4>
        <div id="fc-video-summary" style="font-size: 11px; color: #cbd5e1; line-height: 1.4; margin-bottom: 12px;"></div>
        <button id="fc-upgrade-btn" class="fc-btn fc-btn-pro" style="margin-bottom:12px; display:none; width:100%; font-size:12px;" title="買い切り500円で制限解除">Pro版アップグレード (制限なし)</button>
        <input type="text" id="fc-video-filter" class="fc-input" placeholder="コメント済み動画を検索..." style="font-size:12px;">
        <div id="fc-video-index" style="min-height:160px;max-height:220px;overflow:auto;border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:6px;background:rgba(0,0,0,0.2);"></div>
        <button id="fc-video-more-btn" class="fc-btn" style="width:100%;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);box-shadow:none;font-size:12px;margin-top:8px;">もっと見る</button>
        <div>
            <label>表示切替ショートカット:</label>
            <input type="text" id="fc-shortcut-input" class="fc-input" readonly value="${shortcutConfig.label}" style="cursor:pointer; text-align:center;">
            <p style="font-size:10px;color:#aaa;">クリック後にキーを押して設定</p>
        </div>
        <div style="margin-top:6px; display:flex; flex-direction:column; gap:6px;">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                <input type="checkbox" id="fc-default-auto-min">
                自動最小化をデフォルトでON
            </label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                <input type="checkbox" id="fc-theme-toggle">
                ライトテーマを使用する
            </label>
        </div>
        <div style="display:flex;gap:6px;margin-top:4px;">
            <button id="fc-export-json-btn" class="fc-btn" type="button" style="flex:1;font-size:12px;">JSON保存</button>
            <button id="fc-import-json-btn" class="fc-btn" type="button" style="flex:1;font-size:12px;">JSON復元</button>
            <input id="fc-import-json-file" type="file" accept="application/json,.json" style="display:none;">
        </div>
        <div id="fc-settings-footer" style="padding-top:16px; margin-top:auto; background: none;">
             <button id="fc-generate-dummy-btn" class="fc-btn" style="width:100%; font-size:12px; display:none; margin-bottom:10px;">+ ダミーコメント100件追加</button>
             <button id="fc-clear-all-btn" class="fc-btn" style="width:100%; background:rgba(239, 68, 68, 0.04); border-color:rgba(239, 68, 68, 0.12); color:#fca5a5; font-size:12px;">全コメント削除</button>
             <button class="fc-btn" id="fc-settings-back" style="margin-top:16px; width:100%;">戻る</button>
        </div>
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
  const videoSummaryDiv = overlay.querySelector('#fc-video-summary');
  const videoFilterInput = overlay.querySelector('#fc-video-filter');
  const videoIndexDiv = overlay.querySelector('#fc-video-index');
  const videoMoreBtn = overlay.querySelector('#fc-video-more-btn');
  const listDiv = overlay.querySelector('#fc-list');
  const inputAreaDiv = overlay.querySelector('.fc-input-area');
  const settingsBackBtn = overlay.querySelector('#fc-settings-back');
  const shortcutInput = overlay.querySelector('#fc-shortcut-input');
  const searchInput = overlay.querySelector('#fc-search-input');
  const searchClearBtn = overlay.querySelector('#fc-search-clear');
  const defaultAutoMinCheckbox = overlay.querySelector('#fc-default-auto-min');
  const themeToggleCheckbox = overlay.querySelector('#fc-theme-toggle');
  const exportJsonBtn = overlay.querySelector('#fc-export-json-btn');
  const importJsonBtn = overlay.querySelector('#fc-import-json-btn');
  const importJsonFileInput = overlay.querySelector('#fc-import-json-file');
  const statusEl = overlay.querySelector('#fc-status');
  let videoIndexQuery = '';
  let showAllVideoCards = false;

  const updateLimitStatus = () => {
    if (!statusEl) return;
    const upgradeBtn = overlay.querySelector('#fc-upgrade-btn');
    if (hasUnlimitedAccess()) {
      statusEl.textContent = getHeaderStatusLabel();
      if (upgradeBtn) upgradeBtn.style.display = 'none';
      return;
    }
    statusEl.textContent = `シーン・メモ 残り${getRemainingCommentSlots()}/${FREE_COMMENT_LIMIT}`;
    if (upgradeBtn) upgradeBtn.style.display = 'block';
  };
  refreshLimitStatus = updateLimitStatus;
  updateLimitStatus();

  const upgradeBtn = overlay.querySelector('#fc-upgrade-btn');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const setUpgradeButtonIdle = () => {
        upgradeBtn.textContent = 'Pro版アップグレード';
        upgradeBtn.disabled = false;
      };
      try {
        const fp = await getDeviceFingerprint();
        upgradeBtn.textContent = '処理中...';
        upgradeBtn.disabled = true;
        
        const response = await fetch(`${LICENSE_API_BASE_URL}/create-checkout-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ device_fingerprint: fp })
        });
        const data = await response.json();
        
        if (data.ok && data.url) {
           const width = 500;
           const height = 700;
           const left = Math.round((window.screen.width - width) / 2);
           const top = Math.round((window.screen.height - height) / 2);
           const checkoutWindow = window.open(data.url, 'stripe_checkout', `width=${width},height=${height},left=${left},top=${top},status=no,location=no,menubar=no,toolbar=no`);
           upgradeBtn.textContent = '決済確認中...';
           let attempts = 0;
           const pollTimer = setInterval(async () => {
             attempts += 1;
             try {
               const isPro = await verifyDeviceEntitlement();
               if (isPro) {
                 clearInterval(pollTimer);
                 if (checkoutWindow && !checkoutWindow.closed) {
                   checkoutWindow.close();
                 }
                 await persistProEntitlement();
                 setUpgradeButtonIdle();
                 return;
               }
             } catch (_) {
               // best effort polling
             }
             const popupClosed = checkoutWindow && checkoutWindow.closed;
             if (attempts >= CHECKOUT_POLL_MAX_ATTEMPTS || popupClosed) {
               clearInterval(pollTimer);
               setUpgradeButtonIdle();
             }
           }, CHECKOUT_POLL_INTERVAL_MS);
        } else {
           alert("決済画面のURL取得に失敗しました。");
           setUpgradeButtonIdle();
        }
      } catch (err) {
        alert("通信エラーが発生しました。");
        setUpgradeButtonIdle();
      }
    });
  }

  const renderVideoIndex = async () => {
    if (!videoSummaryDiv || !videoIndexDiv) return;
    const { siteKey, videoId, suffix, metaKey } = getStorageKeys();
    const currentSiteLabel = getSiteLabel(siteKey);
    let currentTitle = getCurrentPageTitle(siteKey, `${currentSiteLabel} / ${videoId}`);
    if (siteKey === 'youtube') {
      const titleByVideoId = await fetchYouTubeTitleFromVideoId(videoId);
      if (titleByVideoId) currentTitle = titleByVideoId;
    }

    chrome.storage.local.get([metaKey], (r) => {
      chrome.storage.local.set({
        [metaKey]: {
          ...(r[metaKey] || {}),
          site: siteKey,
          videoId,
          title: currentTitle,
          url: window.location.href,
          updatedAt: Date.now()
        }
      });
    });
    const allEntries = await loadCommentedVideos();
    const siteEntries = allEntries.filter((entry) => entry.site === siteKey);
    const normalizedQuery = videoIndexQuery.trim().toLowerCase();

    videoSummaryDiv.innerHTML = `
      <div><strong>現在:</strong> ${escapeHtml(currentTitle)}</div>
      <div style="color:#bbb;">${escapeHtml(currentSiteLabel)} / ${escapeHtml(videoId)}</div>
      <div style="margin-top:4px;"><strong>コメント済み動画:</strong> ${siteEntries.length} 件</div>
    `;

    if (siteEntries.length === 0) {
      videoIndexDiv.innerHTML = '<div style="font-size:11px;color:#bbb;">まだコメント保存はありません。</div>';
      if (videoMoreBtn) videoMoreBtn.style.display = 'none';
      return;
    }

    const enrichedEntries = await Promise.all(siteEntries.map(async (entry) => {
      const isCurrentEntry = entry.keySuffix === suffix;
      const fallbackLabel = `${getSiteLabel(entry.site)} の動画`;
      let resolvedTitle = normalizeVideoTitle(entry.title, fallbackLabel);
      const entryUrl = buildVideoUrlFromEntry(entry);
      const needsTitleBackfill = !entry.title || isPlaceholderTitle(entry.site, entry.title);

      if (isCurrentEntry && currentTitle) {
        resolvedTitle = currentTitle;
        const metaKey = `${VIDEO_MEMO_META_PREFIX}${entry.keySuffix}`;
        chrome.storage.local.get([metaKey], (r) => {
          chrome.storage.local.set({
            [metaKey]: {
              ...(r[metaKey] || {}),
              site: entry.site,
              videoId: entry.videoId,
              title: currentTitle,
              url: entryUrl || window.location.href,
              updatedAt: Date.now()
            }
          });
        });
      }

      if (needsTitleBackfill && entry.site === 'youtube') {
        const fetchedTitle = await fetchYouTubeTitleFromVideoId(entry.videoId);
        if (fetchedTitle) {
          resolvedTitle = fetchedTitle;
          const metaKey = `${VIDEO_MEMO_META_PREFIX}${entry.keySuffix}`;
          chrome.storage.local.get([metaKey], (r) => {
            chrome.storage.local.set({
              [metaKey]: {
                ...(r[metaKey] || {}),
                site: entry.site,
                videoId: entry.videoId,
                title: fetchedTitle,
                url: entryUrl,
                updatedAt: Date.now()
              }
            });
          });
        }
      }
      if (needsTitleBackfill && !isCurrentEntry && (resolvedTitle === fallbackLabel || isPlaceholderTitle(entry.site, resolvedTitle))) {
        const fetchedFromUrl = await fetchTitleFromUrl(entryUrl, entry.site, fallbackLabel);
        if (fetchedFromUrl && fetchedFromUrl !== fallbackLabel) {
          resolvedTitle = fetchedFromUrl;
          const metaKey = `${VIDEO_MEMO_META_PREFIX}${entry.keySuffix}`;
          chrome.storage.local.get([metaKey], (r) => {
            chrome.storage.local.set({
              [metaKey]: {
                ...(r[metaKey] || {}),
                site: entry.site,
                videoId: entry.videoId,
                title: fetchedFromUrl,
                url: entryUrl,
                updatedAt: Date.now()
              }
            });
          });
        }
      }
      return {
        ...entry,
        url: entryUrl,
        resolvedTitle
      };
    }));

    const filteredEntries = normalizedQuery
      ? enrichedEntries.filter((entry) => {
          const haystack = `${entry.resolvedTitle} ${entry.videoId} ${getSiteLabel(entry.site)}`.toLowerCase();
          return haystack.includes(normalizedQuery);
        })
      : enrichedEntries;

    const visibleEntries = showAllVideoCards ? filteredEntries : filteredEntries.slice(0, 5);

    if (filteredEntries.length === 0) {
      videoIndexDiv.innerHTML = '<div style="font-size:11px;color:#bbb;">一致する動画がありません。</div>';
      if (videoMoreBtn) videoMoreBtn.style.display = 'none';
      return;
    }

    if (videoMoreBtn) {
      if (filteredEntries.length <= 5) {
        videoMoreBtn.style.display = 'none';
      } else {
        videoMoreBtn.style.display = 'block';
        const remain = filteredEntries.length - 5;
        videoMoreBtn.textContent = showAllVideoCards ? '折りたたむ' : `もっと見る（残り${remain}件）`;
      }
    }

    videoIndexDiv.innerHTML = visibleEntries.map((entry) => {
      const label = `${getSiteLabel(entry.site)} の動画`;
      const title = entry.resolvedTitle || label;
      const isCurrent = entry.keySuffix === suffix;
      const targetUrl = entry.url;
      const safeUrl = escapeHtml(targetUrl);
      const safeSuffix = escapeHtml(entry.keySuffix);
      return `
        <div class="fc-video-index-item ${isCurrent ? 'fc-current-video' : ''}" data-url="${safeUrl}" data-suffix="${safeSuffix}" style="position:relative;padding:5px 28px 5px 6px;border-radius:4px;margin-bottom:4px;background:${isCurrent ? 'rgba(68,187,255,0.25)' : 'rgba(255,255,255,0.02)'};cursor:pointer;">
          <button type="button" class="fc-video-index-delete" data-suffix="${safeSuffix}" title="この動画のコメントを削除" style="position:absolute;top:4px;right:4px;width:18px;height:18px;border:1px solid rgba(255,255,255,0.24);border-radius:4px;background:rgba(0,0,0,0.3);color:#ddd;cursor:pointer;line-height:14px;padding:0;font-size:12px;">×</button>
          <div style="font-size:11px;color:${isCurrent ? '#dff3ff' : '#fff'};line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word;">${escapeHtml(title)}${isCurrent ? ' (現在)' : ''}</div>
          <div style="font-size:10px;color:#9ec5ff;">コメント ${entry.count} 件</div>
          <div style="font-size:10px;color:#8fa4b8;">${escapeHtml(getSiteLabel(entry.site))}</div>
        </div>
      `;
    }).join('');

    const navigateToItem = (item) => {
        const targetUrl = item.getAttribute('data-url');
        if (!targetUrl || targetUrl === window.location.href) return;
        window.location.assign(targetUrl);
    };

    videoIndexDiv.querySelectorAll('.fc-video-index-item').forEach((item) => {
      item.addEventListener('click', () => navigateToItem(item));
      item.addEventListener('pointerup', () => navigateToItem(item));
      item.addEventListener('touchend', () => navigateToItem(item), { passive: true });
    });
    videoIndexDiv.querySelectorAll('.fc-video-index-delete').forEach((btn) => {
      const stopDeleteEvent = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };
      btn.addEventListener('pointerdown', stopDeleteEvent);
      btn.addEventListener('pointerup', stopDeleteEvent);
      btn.addEventListener('mousedown', stopDeleteEvent);
      btn.addEventListener('mouseup', stopDeleteEvent);
      btn.addEventListener('touchstart', stopDeleteEvent, { passive: false });
      btn.addEventListener('touchend', stopDeleteEvent, { passive: false });
      btn.addEventListener('click', (e) => {
        stopDeleteEvent(e);
        const keySuffix = btn.getAttribute('data-suffix');
        if (!keySuffix) return;
        if (!confirm('この動画のコメントをすべて削除しますか？')) return;
        const commentsKey = `${VIDEO_MEMO_COMMENTS_PREFIX}${keySuffix}`;
        const metaKey = `${VIDEO_MEMO_META_PREFIX}${keySuffix}`;
        chrome.storage.local.remove([commentsKey, metaKey], () => {
          const parsed = parseStoredCommentSuffix(keySuffix);
          if (parsed.site === siteKey && parsed.videoId === videoId) {
            comments = [];
            lastRenderedCommentCount = 0;
            renderComments(videoElement ? videoElement.currentTime : 0);
          }
          renderVideoIndex();
        });
      });
    });
  };
  refreshVideoIndex = renderVideoIndex;
  if (videoFilterInput) {
    videoFilterInput.addEventListener('input', () => {
      videoIndexQuery = videoFilterInput.value || '';
      showAllVideoCards = false;
      renderVideoIndex();
    });
  }
  if (videoMoreBtn) {
    videoMoreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showAllVideoCards = !showAllVideoCards;
      renderVideoIndex();
    });
  }
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
    
    // リサイズ時にプレイヤーサイズを上回らないように制限
    overlay.style.maxWidth = `${vRect.width}px`;
    overlay.style.maxHeight = `${vRect.height}px`;

    // 一旦現在のサイズを取得 (minimized クラスの付け外しによる影響を反映させるため)
    const oRect = overlay.getBoundingClientRect();
    
    // minX/minY は動画の左上、 maxX/maxY は動画の右下 - オーバーレイ自身の幅/高さ
    const minX = vRect.left;
    const maxX = Math.max(vRect.left, vRect.right - oRect.width);
    
    // maxYは動画の下端を超えないように
    const maxY = Math.max(vRect.top, vRect.bottom - oRect.height);

    let x = oRect.left;
    let y = oRect.top;
    
    x = Math.max(minX, Math.min(maxX, x));
    // ここが重要： もし y が vRect.top（動画の上端）より小さければ無理やり vRect.top に合わせる
    y = Math.max(vRect.top, Math.min(maxY, y));

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
    let isLightTheme = false;

    if (savedPos) {
        try {
            const { left, top, isMin, autoMin, minimizeAnchor: savedAnchor, width, height, theme } = savedPos;
            autoMinState = (typeof autoMin === 'boolean') ? autoMin : defaultAutoMin;
            isLightTheme = !!theme;
            if (savedAnchor === 'top' || savedAnchor === 'bottom') {
              minimizeAnchor = savedAnchor;
            }
            if (width) overlay.style.width = width;
            if (height) overlay.style.height = height;

            if (isMin) {
                isMinimized = true;
                overlay.classList.add('minimized');
                minBtn.textContent = '□';
                
                // 展開時の座標として保存しておく
                overlay._expandedLeft = left;
                overlay._expandedTop = top;

                // 最小化時は左上に吸着させる
                const vRect = videoElement ? videoElement.getBoundingClientRect() : {top:0, left:0};
                overlay.style.left = `${vRect.left + window.scrollX}px`;
                overlay.style.top = `${vRect.top + window.scrollY}px`;
                
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

    if (themeToggleCheckbox) {
        themeToggleCheckbox.checked = isLightTheme;
        if (isLightTheme) {
            overlay.classList.add('fc-light-theme');
        } else {
            overlay.classList.remove('fc-light-theme');
        }
        themeToggleCheckbox.addEventListener('change', () => {
             if (themeToggleCheckbox.checked) {
                 overlay.classList.add('fc-light-theme');
             } else {
                 overlay.classList.remove('fc-light-theme');
             }
             saveUIState();
        });
    }

    const ro = new ResizeObserver(() => {
        if (!isMinimized && overlay.isConnected) {
            saveUIState();
        }
    });
    ro.observe(overlay);

    requestAnimationFrame(() => clampOverlayToVideo());
    renderVideoIndex();
  });

  window.addEventListener('resize', () => {
    if (!overlay.isConnected || overlay.style.display === 'none') return;
    clampOverlayToVideo();
    saveUIState();
  });

  // Save UI State helper
  const saveUIState = () => {
      const state = {
          left: isMinimized ? (overlay._expandedLeft || overlay.style.left) : overlay.style.left,
          top: isMinimized ? (overlay._expandedTop || overlay.style.top) : overlay.style.top,
          width: overlay.style.width,
          height: overlay.style.height,
          isMin: isMinimized,
          autoMin: overlay.querySelector('#fc-auto-min')?.checked,
          theme: overlay.querySelector('#fc-theme-toggle')?.checked
      };
      chrome.storage.local.set({ fanza_mock_ui_pos: state });
  };

  // Minimize/expand with top-left anchor:
  const toggleMinimize = (forceMin = null) => {
      const shouldMin = forceMin !== null ? forceMin : !isMinimized;
      if (shouldMin === isMinimized) return; // No change
      
      const currentScrollY = window.scrollY;
      const currentScrollX = window.scrollX;
      
      // Ensure we have explicit top/left set before animating/changing
      overlay.style.right = 'auto';
      overlay.style.bottom = 'auto';

      if (shouldMin) {
          // 展開時の位置を記憶する
          overlay._expandedLeft = overlay.style.left;
          overlay._expandedTop = overlay.style.top;

          // 動画プレイヤーの左上座標を取得
          const vRect = videoElement ? videoElement.getBoundingClientRect() : {top:0, left:0};

          overlay.style.left = `${vRect.left + currentScrollX}px`;
          overlay.style.top = `${vRect.top + currentScrollY}px`;

          overlay.classList.add('minimized');
          minBtn.textContent = '□';
      } else {
          overlay.classList.remove('minimized');
          
          // 記憶しておいた展開時の位置に戻す
          if (overlay._expandedLeft && overlay._expandedTop) {
              overlay.style.left = overlay._expandedLeft;
              overlay.style.top = overlay._expandedTop;
          }

          minBtn.textContent = '_';
      }

      isMinimized = shouldMin;
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
  
  settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isMinimized && overlay.toggleMinimize) {
          overlay.toggleMinimize(false);
      }
      listDiv.style.display = 'none';
      inputAreaDiv.style.display = 'none';
      overlay.querySelector('.fc-search-area').style.display = 'none';
      settingsDiv.style.display = 'flex';
      renderVideoIndex();
  });
  
  settingsBackBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsDiv.style.display = 'none';
      listDiv.style.display = 'flex';
      inputAreaDiv.style.display = 'flex';
      overlay.querySelector('.fc-search-area').style.display = 'flex';
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
          
          const addableCount = hasUnlimitedAccess() ? 100 : Math.max(0, Math.min(100, getRemainingCommentSlots()));
          if (addableCount === 0) {
              alert(`無料プランの上限（${FREE_COMMENT_LIMIT}件）に達しています。`);
              refreshLimitStatus?.();
              return;
          }

          for(let i=0; i<addableCount; i++) {
              newComments.push(createLocalComment(
                `${phrases[Math.floor(Math.random() * phrases.length)]} ${i + 1}`,
                Math.random() * duration,
                getCommentMigrationContext()
              ));
          }
          
          comments = [...comments, ...newComments].sort((a,b) => a.t - b.t);
          
          // Limit check (300 comments)
          if (comments.length > 300) {
              comments = comments.slice(-300);
          }

          saveComments();
          refreshVideoIndex?.();
          renderComments(videoElement.currentTime);
          refreshLimitStatus?.();
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
              refreshVideoIndex?.();
              renderComments(videoElement ? videoElement.currentTime : 0);
          }
      });
  }

  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        const all = await getStorageLocalAll();
        const managedData = pickManagedBackupData(all);
        const backup = {
          schema: 'kamishine_memo_backup',
          version: BACKUP_SCHEMA_VERSION,
          exportedAt: new Date().toISOString(),
          data: managedData
        };
        saveTextAsFile(buildBackupFileName(), JSON.stringify(backup, null, 2));
      } catch (error) {
        console.error('Failed to export backup', error);
        alert('JSON保存に失敗しました。');
      }
    });
  }

  if (importJsonBtn && importJsonFileInput) {
    importJsonBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      importJsonFileInput.click();
    });

    importJsonFileInput.addEventListener('change', async () => {
      const file = importJsonFileInput.files && importJsonFileInput.files[0];
      importJsonFileInput.value = '';
      if (!file) return;

      try {
        const rawText = await file.text();
        const parsed = JSON.parse(rawText);
        const normalized = normalizeImportedBackup(parsed);
        if (!normalized) throw new Error('Invalid backup object');

        const importData = normalized.data || {};
        const importKeys = Object.keys(importData);
        const currentAll = await getStorageLocalAll();
        const currentManagedKeys = Object.keys(currentAll).filter((key) => isBackupManagedKey(key));

        if (importKeys.length === 0) {
          alert('復元可能なデータがJSONに含まれていません。');
          return;
        }
        if (!confirm(`JSONから ${importKeys.length} 件の設定/コメントを復元します。現在データは置き換えられます。続行しますか？`)) {
          return;
        }

        await removeStorageLocal(currentManagedKeys);
        await setStorageLocal(importData);
        await loadEntitlements();
        await loadComments();
        refreshVideoIndex?.();
        refreshLimitStatus?.();
        lastRenderedCommentCount = 0;
        renderComments(videoElement ? videoElement.currentTime : 0);
        alert('JSON復元が完了しました。');
      } catch (error) {
        console.error('Failed to import backup', error);
        alert('JSON復元に失敗しました。ファイル形式を確認してください。');
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
    if (isFreeLimitReached()) {
      alert(`無料プランは${FREE_COMMENT_LIMIT}件までです。コメントを削除するか、Proをご利用ください。`);
      refreshLimitStatus?.();
      return;
    }
    
    // Add to local mock list
    const newComment = createLocalComment(
      text,
      videoElement.currentTime,
      getCommentMigrationContext()
    );
    
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
    refreshVideoIndex?.();
    refreshLimitStatus?.();
    
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
  refreshLimitStatus?.();

  const NEAR_THRESHOLD = 0.75; // seconds
  
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
                  c.updated_at = new Date().toISOString();
                  saveComments();
                  refreshVideoIndex?.();
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
                  refreshVideoIndex?.();
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
  if (!isSupportedPlaybackPage()) {
    if (findVideoIntervalId) {
      clearInterval(findVideoIntervalId);
      findVideoIntervalId = null;
    }
    if (renderIntervalId) {
      clearInterval(renderIntervalId);
      renderIntervalId = null;
    }
    if (videoElement && videoTimeUpdateHandler) {
      videoElement.removeEventListener('timeupdate', videoTimeUpdateHandler);
      videoTimeUpdateHandler = null;
    }
    const existingOverlay = document.getElementById('fanza-comment-overlay');
    if (existingOverlay) existingOverlay.remove();
    const existingPreview = document.getElementById('fc-jump-preview');
    if (existingPreview) existingPreview.remove();
    refreshVideoIndex = null;
    refreshLimitStatus = null;
    videoElement = null;
    return;
  }

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
  if (videoElement && videoTimeUpdateHandler) {
    videoElement.removeEventListener('timeupdate', videoTimeUpdateHandler);
    videoTimeUpdateHandler = null;
  }

  const existingOverlay = document.getElementById('fanza-comment-overlay');
  if (existingOverlay) existingOverlay.remove();
  const existingPreview = document.getElementById('fc-jump-preview');
  if (existingPreview) existingPreview.remove();
  refreshVideoIndex = null;
  refreshLimitStatus = null;
  videoElement = null;
  editingCommentId = null;
  searchQuery = '';
  lastRenderedCommentCount = 0;
  lastRenderedSearchQuery = '';

  await loadEntitlements();
  await loadComments();
  
  findVideoIntervalId = setInterval(() => {
    const v = document.querySelector('video');
    if (!v) return;

    console.log("Video Memo: Video found", v);
    videoElement = v;
    videoTimeUpdateHandler = () => {
      if (document.getElementById('fc-list')) {
        renderComments(v.currentTime);
      }
    };
    v.addEventListener('timeupdate', videoTimeUpdateHandler);
    clearInterval(findVideoIntervalId);
    findVideoIntervalId = null;
    createOverlay();
    
    renderIntervalId = setInterval(() => {
      if (document.getElementById('fc-list')) {
         renderComments(v.currentTime);
      }
    }, 500);
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
