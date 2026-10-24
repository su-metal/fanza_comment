const FC_EARLY_GUARD_INSTALLED = '__fanza_comment_early_guard_installed__';
const VIDEO_MEMO_COMMENTS_PREFIX = 'video_memo_comments_';
const VIDEO_MEMO_META_PREFIX = 'video_memo_meta_';
const BACKUP_SCHEMA_VERSION = 2;
const COMMENT_SCHEMA_VERSION = 1;
const FREE_COMMENT_LIMIT = 50;
const BETA_PERIOD_END_ISO = '2026-04-02T14:59:59.000Z'; // 2026-04-02 23:59:59 JST
const LICENSE_API_BASE_URL = 'https://wzinimxikcihdqqdvppa.supabase.co/functions/v1/license-api';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_qBIjjA5UN3H62B8dWdqo0w_PRTqVZCq';
const CHECKOUT_POLL_INTERVAL_MS = 2000;
const CHECKOUT_POLL_MAX_ATTEMPTS = 150; // 5 min
const ENTITLEMENT_KEY_FIRST_SEEN_AT = 'fanza_memo_first_seen_at';
const ENTITLEMENT_KEY_BETA_GRANDFATHERED = 'fanza_memo_is_beta_grandfathered';
const ENTITLEMENT_KEY_PRO_PURCHASED = 'fanza_memo_is_pro_purchased';
const INPUT_SHORTCUT_KEY = 'fanza_mock_input_shortcut';
const DEV_DISABLE_BETA_FOR_CHECKOUT_TEST = 'fanza_memo_disable_beta_for_checkout_test';
const AUTO_BACKUP_INDEX_KEY = 'fanza_memo_auto_backup_index';
const AUTO_BACKUP_LAST_SIGNATURE_KEY = 'fanza_memo_auto_backup_last_signature';
const AUTO_BACKUP_PREFIX = 'fanza_memo_auto_backup_';
const AUTO_BACKUP_MAX_COUNT = 5;
const NAVIGATION_FORCE_MINIMIZE_SESSION_KEY = 'fanza_memo_force_minimize_on_navigation';
const OVERLAY_HOST_ID = 'fanza-comment-overlay-host';
const DEFAULT_I18N_FALLBACK = '';
const CONTENT_LOCALE_MESSAGES = {
  ja: {
    contentAutoBackupNotCreated: '未作成',
    contentEntitlementBeta: 'ベータ特典',
    contentEntitlementFree: '無料',
    contentHeaderDefault: 'シーン・メモ',
    contentHeaderPro: 'シーン・メモ (Pro)',
    contentOverlayLoopClear: 'ABリピ解除',
    contentOverlayLoopClearTitle: 'A/Bリピート解除',
    contentOverlayAutoMin: '自動最小化',
    contentOverlaySettings: '設定',
    contentOverlayMinimize: '最小化',
    contentOverlayHide: '非表示',
    contentOverlaySearchPlaceholder: 'コメント検索...',
    contentOverlaySearchClear: '検索をクリア',
    contentOverlaySettingsTitle: '設定',
    contentOverlaySettingsClose: '設定を閉じる',
    contentOverlayUpgradeTitle: '買い切り500円で制限解除',
    contentOverlayUpgradeButton: 'Pro版アップグレード (制限なし)',
    contentOverlayVideoFilterPlaceholder: 'コメント済み動画を検索...',
    contentOverlayVideoMore: 'もっと見る',
    contentOverlayVideoMoreRemaining: 'もっと見る（残り$1件）',
    contentOverlayVideoLess: '折りたたむ',
    contentOverlayToggleShortcut: '表示切替ショートカット:',
    contentOverlayShortcutHelp: 'クリック後にキーを押して設定',
    contentOverlayInputShortcut: 'コメント入力ショートカット:',
    contentOverlayInputShortcutHelp: '最小化中でも入力欄を開いてフォーカス',
    contentOverlayDefaultAutoMin: '自動最小化をデフォルトでON',
    contentOverlayMinimizePosition: '最小化位置',
    contentOverlayMinimizeTopLeft: '左上（既定）',
    contentOverlayMinimizeCurrent: '現在位置',
    contentOverlayMinimizeTopRight: '右上',
    contentOverlayMinimizeBottomLeft: '左下',
    contentOverlayMinimizeBottomRight: '右下',
    contentOverlayLightTheme: 'ライトテーマを使用する',
    contentOverlayExportJson: 'JSON保存',
    contentOverlayImportJson: 'JSON復元',
    contentOverlayBackupNote: '大事なメモは定期的にJSON保存してください。',
    contentOverlayAutoBackupChecking: '自動バックアップ: 確認中...',
    contentOverlayAutoBackupNone: '自動バックアップ: まだありません',
    contentOverlayAutoBackupLabel: '自動バックアップ: $1',
    contentOverlayExportAutoBackup: '最新自動バックアップを書き出す',
    contentOverlayDummyComments: '+ ダミーコメント100件追加',
    contentOverlayClearAll: '全コメント削除',
    contentOverlayCommentPlaceholder: 'コメント...',
    contentOverlayFreeRemaining: '無料枠 残り $1/$2',
    contentOverlayCheckoutUrlError: '決済画面のURL取得に失敗しました: $1',
    contentSummaryCurrent: '現在:',
    contentSummaryCommentedVideos: 'コメント済み動画:',
    contentSummarySiteComments: 'このサイトの保存コメント:',
    contentSummaryAllComments: '全サイト合計:',
    contentSummaryItemCount: '$1 件',
    contentNoSavedVideos: 'まだコメント保存はありません。',
    contentNoMatchingVideos: '一致する動画がありません。',
    contentVideoLabel: '$1 の動画',
    contentVideoDeleteTitle: 'この動画のコメントを削除',
    contentCurrentSuffix: ' (現在)',
    contentCommentCount: 'コメント $1 件',
    contentDeleteVideoConfirm: 'この動画のコメントをすべて削除しますか？',
    contentShortcutConflictInput: 'コメント入力ショートカットと同じキーは設定できません。',
    contentShortcutConflictToggle: '表示切替ショートカットと同じキーは設定できません。',
    contentFreeLimitReached: '無料プランの上限（$1件）に達しています。',
    contentDummyAdded: 'ダミーコメントを $1 件追加しました',
    contentExportJsonFailed: 'JSON保存に失敗しました。',
    contentNoAutoBackupToExport: '書き出せる自動バックアップがありません。',
    contentExportAutoBackupFailed: '自動バックアップの書き出しに失敗しました。',
    contentImportNoData: '復元可能なデータがJSONに含まれていません。',
    contentImportConfirm: 'JSONから $1 件の設定/コメントを復元します。現在データは置き換えられます。続行しますか？',
    contentImportSuccess: 'JSON復元が完了しました。',
    contentImportFailed: 'JSON復元に失敗しました。ファイル形式を確認してください。',
    contentFreePlanLimitMessage: '無料プランは$1件までです。コメントを削除するか、Proをご利用ください。',
    contentLoopStart: '開始',
    contentLoopEnd: '終了',
    contentLoopPending: '開始候補',
    contentDeleteTitle: '削除',
    contentEditTitle: '編集',
    contentDeleteCommentConfirm: 'このコメントを削除しますか？',
    contentLoopStartTitle: 'リピート開始点にする',
    contentLoopEndTitle: 'リピート終了点にする',
    contentLoopChooseStartFirst: '先に開始点 A を選択',
    upgradeButtonProcessing: '処理中...',
    upgradeButtonChecking: '決済確認中...',
    networkErrorWithMessage: '通信エラーが発生しました: $1',
    networkErrorSimple: '通信エラーが発生しました',
    unknownError: '不明なエラー'
  },
  en: {
    contentAutoBackupNotCreated: 'Not created',
    contentEntitlementBeta: 'Beta perk',
    contentEntitlementFree: 'Free',
    contentHeaderDefault: 'Scene Memo',
    contentHeaderPro: 'Scene Memo (Pro)',
    contentOverlayLoopClear: 'Clear AB loop',
    contentOverlayLoopClearTitle: 'Clear A/B repeat',
    contentOverlayAutoMin: 'Auto minimize',
    contentOverlaySettings: 'Settings',
    contentOverlayMinimize: 'Minimize',
    contentOverlayHide: 'Hide',
    contentOverlaySearchPlaceholder: 'Search comments...',
    contentOverlaySearchClear: 'Clear search',
    contentOverlaySettingsTitle: 'Settings',
    contentOverlaySettingsClose: 'Close settings',
    contentOverlayUpgradeTitle: 'Unlock limits for a one-time $3.99',
    contentOverlayUpgradeButton: 'Upgrade to Pro (Unlimited)',
    contentOverlayVideoFilterPlaceholder: 'Search commented videos...',
    contentOverlayVideoMore: 'Show more',
    contentOverlayVideoMoreRemaining: 'Show more ($1 left)',
    contentOverlayVideoLess: 'Collapse',
    contentOverlayToggleShortcut: 'Toggle shortcut:',
    contentOverlayShortcutHelp: 'Click, then press the key you want to use',
    contentOverlayInputShortcut: 'Comment input shortcut:',
    contentOverlayInputShortcutHelp: 'Open and focus the input even while minimized',
    contentOverlayDefaultAutoMin: 'Enable auto minimize by default',
    contentOverlayMinimizePosition: 'Minimized position',
    contentOverlayMinimizeTopLeft: 'Top left (default)',
    contentOverlayMinimizeCurrent: 'Current position',
    contentOverlayMinimizeTopRight: 'Top right',
    contentOverlayMinimizeBottomLeft: 'Bottom left',
    contentOverlayMinimizeBottomRight: 'Bottom right',
    contentOverlayLightTheme: 'Use light theme',
    contentOverlayExportJson: 'Export JSON',
    contentOverlayImportJson: 'Import JSON',
    contentOverlayBackupNote: 'Back up important memos as JSON on a regular basis.',
    contentOverlayAutoBackupChecking: 'Auto backup: checking...',
    contentOverlayAutoBackupNone: 'Auto backup: none yet',
    contentOverlayAutoBackupLabel: 'Auto backup: $1',
    contentOverlayExportAutoBackup: 'Export latest auto backup',
    contentOverlayDummyComments: '+ Add 100 dummy comments',
    contentOverlayClearAll: 'Delete all comments',
    contentOverlayCommentPlaceholder: 'Comment...',
    contentOverlayFreeRemaining: 'Free slots left $1/$2',
    contentOverlayCheckoutUrlError: 'Failed to get checkout URL: $1',
    contentSummaryCurrent: 'Current:',
    contentSummaryCommentedVideos: 'Commented videos:',
    contentSummarySiteComments: 'Saved comments on this site:',
    contentSummaryAllComments: 'All sites total:',
    contentSummaryItemCount: '$1 items',
    contentNoSavedVideos: 'No saved comments yet.',
    contentNoMatchingVideos: 'No matching videos found.',
    contentVideoLabel: '$1 video',
    contentVideoDeleteTitle: 'Delete comments for this video',
    contentCurrentSuffix: ' (Current)',
    contentCommentCount: '$1 comments',
    contentDeleteVideoConfirm: 'Delete all comments for this video?',
    contentShortcutConflictInput: 'You cannot use the same key as the comment input shortcut.',
    contentShortcutConflictToggle: 'You cannot use the same key as the visibility toggle shortcut.',
    contentFreeLimitReached: 'You have reached the free plan limit ($1 comments).',
    contentDummyAdded: 'Added $1 dummy comments',
    contentExportJsonFailed: 'Failed to export JSON.',
    contentNoAutoBackupToExport: 'There is no auto backup available to export.',
    contentExportAutoBackupFailed: 'Failed to export the auto backup.',
    contentImportNoData: 'No restorable data was found in the JSON file.',
    contentImportConfirm: 'Restore $1 settings/comments from JSON? Current data will be replaced.',
    contentImportSuccess: 'JSON restore completed.',
    contentImportFailed: 'Failed to restore JSON. Check the file format.',
    contentFreePlanLimitMessage: 'The free plan allows up to $1 comments. Delete some comments or use Pro.',
    contentLoopStart: 'Start',
    contentLoopEnd: 'End',
    contentLoopPending: 'Start candidate',
    contentDeleteTitle: 'Delete',
    contentEditTitle: 'Edit',
    contentDeleteCommentConfirm: 'Delete this comment?',
    contentLoopStartTitle: 'Set as repeat start',
    contentLoopEndTitle: 'Set as repeat end',
    contentLoopChooseStartFirst: 'Pick start point A first',
    upgradeButtonProcessing: 'Processing...',
    upgradeButtonChecking: 'Checking purchase...',
    networkErrorWithMessage: 'A network error occurred: $1',
    networkErrorSimple: 'A network error occurred.',
    unknownError: 'Unknown error'
  }
};
let contentLocale = 'ja';
const ENTITLEMENT_KEYS = [
  ENTITLEMENT_KEY_FIRST_SEEN_AT,
  ENTITLEMENT_KEY_BETA_GRANDFATHERED,
  ENTITLEMENT_KEY_PRO_PURCHASED
];
const BACKUP_MANAGED_KEY_PREFIXES = [VIDEO_MEMO_COMMENTS_PREFIX, VIDEO_MEMO_META_PREFIX];
const BACKUP_MANAGED_EXACT_KEYS = [
  'fanza_mock_shortcut',
  INPUT_SHORTCUT_KEY,
  'fanza_mock_ui_pos',
  'fanza_mock_default_auto_min',
  ENTITLEMENT_KEY_FIRST_SEEN_AT,
  ENTITLEMENT_KEY_BETA_GRANDFATHERED,
  ENTITLEMENT_KEY_PRO_PURCHASED
];

function normalizeI18nSubstitutions(substitutions) {
  if (substitutions === undefined || substitutions === null) return [];
  return Array.isArray(substitutions) ? substitutions : [substitutions];
}

function substituteContentMessage(template, substitutions) {
  const values = normalizeI18nSubstitutions(substitutions);
  return String(template || '').replace(/\$(\d)/g, (_, indexText) => {
    const index = Number(indexText) - 1;
    return values[index] !== undefined ? String(values[index]) : '';
  });
}

function isJapaneseLocaleHint(locale) {
  const normalized = String(locale || '').trim().toLowerCase();
  return normalized.startsWith('ja') || normalized.endsWith('-jp');
}

function isJapaneseTimezoneHint() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Tokyo';
  } catch (_) {
    return false;
  }
}

async function resolveContentLocale() {
  return isJapaneseTimezoneHint() ? 'ja' : 'en';
}

function t(key, substitutions, fallback = DEFAULT_I18N_FALLBACK) {
  const contentMessage = CONTENT_LOCALE_MESSAGES[contentLocale]?.[key];
  if (contentMessage) {
    return substituteContentMessage(contentMessage, substitutions);
  }
  const runtimeTranslator = window.extI18n?.t;
  if (typeof runtimeTranslator === 'function') {
    return runtimeTranslator(key, substitutions, fallback);
  }
  const message = chrome?.i18n?.getMessage?.(key, normalizeI18nSubstitutions(substitutions));
  return message || fallback || key;
}

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

function markForceMinimizeOnNextNavigation() {
  try {
    sessionStorage.setItem(NAVIGATION_FORCE_MINIMIZE_SESSION_KEY, '1');
  } catch (_) {}
}

function consumeForceMinimizeOnNavigation() {
  try {
    const shouldForce = sessionStorage.getItem(NAVIGATION_FORCE_MINIMIZE_SESSION_KEY) === '1';
    if (shouldForce) {
      sessionStorage.removeItem(NAVIGATION_FORCE_MINIMIZE_SESSION_KEY);
    }
    return shouldForce;
  } catch (_) {
    return false;
  }
}

function getOverlayHostElement() {
  return document.getElementById(OVERLAY_HOST_ID);
}

function getOverlayShadowRoot() {
  return getOverlayHostElement()?.shadowRoot || null;
}

function getOverlayElement() {
  return getOverlayShadowRoot()?.querySelector('#fanza-comment-overlay') || document.getElementById('fanza-comment-overlay');
}

function getJumpPreviewElement() {
  return getOverlayShadowRoot()?.querySelector('#fc-jump-preview') || document.getElementById('fc-jump-preview');
}

function setBootDebugState(state, detail = '') {
  try {
    document.documentElement.setAttribute('data-fanza-memo-boot', state);
    if (detail) {
      document.documentElement.setAttribute('data-fanza-memo-boot-detail', detail);
    } else {
      document.documentElement.removeAttribute('data-fanza-memo-boot-detail');
    }
  } catch (_) {}
}

function removeExistingOverlayUi() {
  const overlayHost = getOverlayHostElement();
  if (overlayHost) {
    overlayHost.remove();
  }
  const fallbackOverlay = document.getElementById('fanza-comment-overlay');
  if (fallbackOverlay) {
    fallbackOverlay.remove();
  }
  const fallbackPreview = document.getElementById('fc-jump-preview');
  if (fallbackPreview) {
    fallbackPreview.remove();
  }
}

function getDocumentFullscreenHost() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement ||
    null
  );
}

function resolvePreferredVideoElement() {
  const candidates = Array.from(document.querySelectorAll('video'));
  if (candidates.length === 0) return null;

  const fullscreenHost = getDocumentFullscreenHost();
  let bestVideo = null;
  let bestScore = -Infinity;

  for (const candidate of candidates) {
    if (!candidate || !candidate.isConnected) continue;
    const rect = candidate.getBoundingClientRect();
    const area = Math.max(0, rect.width) * Math.max(0, rect.height);
    if (area <= 0) continue;

    let score = area;
    if (candidate.readyState > 0) score += 1_000_000;
    if (!candidate.paused) score += 500_000;
    if (fullscreenHost && fullscreenHost.contains(candidate)) score += 10_000_000_000;
    if (candidate === videoElement) score += 10_000;

    if (score > bestScore) {
      bestScore = score;
      bestVideo = candidate;
    }
  }

  return bestVideo || null;
}

function detachVideoTimeUpdateHandler() {
  if (videoElement && videoTimeUpdateHandler) {
    videoElement.removeEventListener('timeupdate', videoTimeUpdateHandler);
  }
  videoTimeUpdateHandler = null;
}

function handleActiveVideoTimeUpdate() {
  const activeVideo = videoElement;
  if (!activeVideo) return;
  syncActiveCommentLoop();
  if (activeCommentLoop && Number.isFinite(activeVideo.currentTime) && activeVideo.currentTime >= activeCommentLoop.end - 0.05) {
    activeVideo.currentTime = activeCommentLoop.start;
    if (activeVideo.paused) {
      activeVideo.play().catch(() => {});
    }
  }
  if (getOverlayElement()?.querySelector('#fc-list')) {
    renderComments(activeVideo.currentTime);
  }
}

function bindVideoElement(nextVideo) {
  if (!nextVideo) return false;
  if (videoElement === nextVideo && videoTimeUpdateHandler) return false;

  detachVideoTimeUpdateHandler();
  videoElement = nextVideo;
  videoTimeUpdateHandler = handleActiveVideoTimeUpdate;
  videoElement.addEventListener('timeupdate', videoTimeUpdateHandler);
  return true;
}

function syncActiveVideoElement() {
  const nextVideo = resolvePreferredVideoElement();
  if (!nextVideo) return false;
  return bindVideoElement(nextVideo);
}

function getActiveVideoElement() {
  syncActiveVideoElement();
  return videoElement;
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

function buildLicenseApiHeaders() {
  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_PUBLISHABLE_KEY,
  };
}

function generateCheckoutState() {
  return crypto.randomUUID().replace(/-/g, '');
}

function sendRuntimeMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response || {});
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

function buildAutoBackupFileName(snapshot) {
  const createdAt = snapshot && snapshot.createdAt ? new Date(snapshot.createdAt) : new Date();
  return `kamishine_memo_auto_backup_${toBackupDateStamp(createdAt)}.json`;
}

function formatAutoBackupLabel(isoString) {
  if (!isoString) return t('contentAutoBackupNotCreated', undefined, 'Not created');
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return t('contentAutoBackupNotCreated', undefined, 'Not created');
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function getAutoBackupStorageKey(snapshotId) {
  return `${AUTO_BACKUP_PREFIX}${snapshotId}`;
}

function normalizeAutoBackupIndex(rawIndex) {
  if (!Array.isArray(rawIndex)) return [];
  return rawIndex
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => ({
      id: String(entry.id || '').trim(),
      createdAt: String(entry.createdAt || '').trim(),
      reason: String(entry.reason || '').trim()
    }))
    .filter((entry) => entry.id && entry.createdAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, AUTO_BACKUP_MAX_COUNT);
}

async function createAutoBackupSnapshot(reason = 'manual') {
  const all = await getStorageLocalAll();
  const managedData = pickManagedBackupData(all);
  if (Object.keys(managedData).length === 0) return null;

  const signature = JSON.stringify(managedData);
  if (all[AUTO_BACKUP_LAST_SIGNATURE_KEY] === signature) {
    const existingIndex = normalizeAutoBackupIndex(all[AUTO_BACKUP_INDEX_KEY]);
    return existingIndex[0] || null;
  }

  const snapshot = {
    schema: 'kamishine_memo_auto_backup',
    version: BACKUP_SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    reason,
    data: managedData
  };
  const snapshotId = `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  const nextEntry = { id: snapshotId, createdAt: snapshot.createdAt, reason };
  const currentIndex = normalizeAutoBackupIndex(all[AUTO_BACKUP_INDEX_KEY]);
  const nextIndex = [nextEntry, ...currentIndex].slice(0, AUTO_BACKUP_MAX_COUNT);
  const removeKeys = currentIndex
    .slice(AUTO_BACKUP_MAX_COUNT - 1)
    .map((entry) => getAutoBackupStorageKey(entry.id));

  await setStorageLocal({
    [getAutoBackupStorageKey(snapshotId)]: snapshot,
    [AUTO_BACKUP_INDEX_KEY]: nextIndex,
    [AUTO_BACKUP_LAST_SIGNATURE_KEY]: signature
  });
  await removeStorageLocal(removeKeys);
  return nextEntry;
}

async function getLatestAutoBackupSnapshot() {
  const stored = await getStorageLocal([AUTO_BACKUP_INDEX_KEY]);
  const index = normalizeAutoBackupIndex(stored[AUTO_BACKUP_INDEX_KEY]);
  if (index.length === 0) return null;
  const latest = index[0];
  const snapshotKey = getAutoBackupStorageKey(latest.id);
  const snapshotResult = await getStorageLocal([snapshotKey]);
  const snapshot = snapshotResult[snapshotKey];
  if (!snapshot || typeof snapshot !== 'object') return null;
  return { ...latest, snapshot };
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
    all: initial;
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
    box-sizing: border-box;
    line-height: 1.4;
    text-align: left;
    isolation: isolate;
  }
  #fanza-comment-overlay,
  #fanza-comment-overlay * {
    box-sizing: border-box;
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
  #fanza-comment-overlay.fc-light-theme .fc-settings-close {
    background: rgba(0, 0, 0, 0.04);
    border-color: rgba(0, 0, 0, 0.1);
  }
  #fanza-comment-overlay.fc-light-theme .fc-settings-close:hover {
    background: rgba(0, 0, 0, 0.08);
    border-color: rgba(0, 0, 0, 0.16);
  }
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
  #fanza-comment-overlay.fc-light-theme .fc-btn-pro {
    background: linear-gradient(180deg, #fff8e6 0%, #ffefc2 100%);
    color: #92400e;
    border: 1px solid rgba(217, 119, 6, 0.32);
    box-shadow: 0 2px 8px rgba(217, 119, 6, 0.12);
  }
  #fanza-comment-overlay.fc-light-theme .fc-btn-pro:hover {
    background: linear-gradient(180deg, #ffefc2 0%, #ffe39a 100%);
    color: #78350f;
    border-color: rgba(217, 119, 6, 0.44);
    box-shadow: 0 4px 12px rgba(217, 119, 6, 0.16);
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
    display: flex !important;
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
    display: flex !important;
    flex-direction: column !important;
    gap: 10px;
  }
  .fc-settings {
    flex: 1;
    padding: 0 14px 14px;
    display: none;
    flex-direction: column !important;
    gap: 12px;
    font-size: 13px;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  #fanza-comment-overlay.fc-settings-open .fc-list,
  #fanza-comment-overlay.fc-settings-open .fc-input-area,
  #fanza-comment-overlay.fc-settings-open .fc-search-area {
    display: none !important;
  }
  #fanza-comment-overlay.fc-settings-open .fc-settings {
    display: flex !important;
  }
  .fc-settings h4 {
    margin: 0 0 4px 0;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
  }
  .fc-settings-header {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 14px 0 12px;
    background: inherit;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  .fc-settings-title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: inherit;
  }
  .fc-settings-close {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.06);
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    line-height: 1;
    flex-shrink: 0;
  }
  .fc-settings-close:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.22);
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
  .fc-comment.loop-active {
    border-right: 3px solid #22c55e;
    box-shadow: inset 0 0 0 1px rgba(34, 197, 94, 0.28);
  }
  .fc-comment.loop-end {
    border-right: 3px solid #f59e0b;
    box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.24);
  }
  .fc-loop-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
    padding: 3px 6px;
    border-radius: 999px;
    margin-right: 6px;
    vertical-align: middle;
  }
  .fc-loop-chip-start {
    color: #22c55e;
    background: rgba(34, 197, 94, 0.14);
    border: 1px solid rgba(34, 197, 94, 0.22);
  }
  .fc-loop-chip-end {
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.14);
    border: 1px solid rgba(245, 158, 11, 0.22);
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
    display: flex !important;
    align-items: center !important;
    gap: 8px;
  }
  .fc-input {
    flex: 1 1 auto !important;
    width: auto !important;
    min-width: 0 !important;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 8px 12px;
    border-radius: 6px;
    outline: none;
    font-size: 13px;
    transition: all 0.2s ease;
    margin: 0 !important;
    appearance: none;
    -webkit-appearance: none;
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
    background: linear-gradient(180deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.16) 100%);
    border: 1px solid rgba(251, 191, 36, 0.36);
    color: #fde7b0;
    box-shadow: 0 2px 10px rgba(245, 158, 11, 0.14);
  }
  .fc-btn-pro:hover {
    background: linear-gradient(180deg, rgba(245, 158, 11, 0.28) 0%, rgba(217, 119, 6, 0.22) 100%);
    border-color: rgba(251, 191, 36, 0.5);
    color: #fff7dd;
    box-shadow: 0 4px 14px rgba(245, 158, 11, 0.18);
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
    display: flex !important;
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
    display: flex !important;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background 0.2s, color 0.2s;
    color: #94a3b8 !important; /* Slate 400 */
    margin: 0 !important;
    appearance: none;
    -webkit-appearance: none;
  }
  .fc-header-btns button:hover {
    background: rgba(255,255,255,0.1) !important;
    color: #fff !important;
  }
  .fc-header-btns .fc-loop-clear-btn {
    width: auto;
    min-width: 0;
    height: 24px;
    padding: 0 8px;
    font-size: 10px;
    font-weight: 700;
    border: 1px solid rgba(245, 158, 11, 0.25) !important;
    border-radius: 999px;
    color: #fbbf24 !important;
    background: rgba(245, 158, 11, 0.12) !important;
  }
  .fc-header-btns .fc-loop-clear-btn.is-hidden {
    display: none !important;
  }
  .fc-header-btns .fc-loop-clear-btn:hover {
    color: #fff7ed !important;
    background: rgba(245, 158, 11, 0.22) !important;
    border-color: rgba(245, 158, 11, 0.4) !important;
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
  .fc-loop-point-btn {
    float: right;
    color: #64748b;
    cursor: pointer;
    font-size: 11px;
    font-weight: 700;
    line-height: 12px;
    margin-left: 6px;
    display: none;
    min-width: 22px;
    padding: 4px 6px;
    border-radius: 4px;
    transition: all 0.2s;
  }
  .fc-comment:hover .fc-loop-point-btn { display: block; }
  .fc-loop-point-btn:hover { color: #fff; background: rgba(148, 163, 184, 0.18); }
  .fc-loop-point-btn.is-active {
    display: block;
    color: #fff;
  }
  .fc-loop-point-btn.is-a {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
  }
  .fc-loop-point-btn.is-b {
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
  }
  .fc-loop-point-btn.is-pending {
    background: rgba(34, 197, 94, 0.15);
  }
  
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
    display: flex !important;
    align-items: center !important;
    gap: 8px;
    box-sizing: border-box;
  }
  .fc-search-input {
    flex: 1 1 auto !important;
    width: auto !important;
    min-width: 0 !important;
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.1);
    color: #f1f5f9;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    outline: none;
    transition: all 0.2s;
    box-sizing: border-box;
    margin: 0 !important;
    appearance: none;
    -webkit-appearance: none;
  }
  .fc-input-area .fc-btn {
    flex: 0 0 auto !important;
    width: 44px !important;
    min-width: 44px !important;
    padding: 0 !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    margin: 0 !important;
    appearance: none;
    -webkit-appearance: none;
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
let refreshAutoBackupStatus = null;
let refreshLoopClearButton = null;
let focusCommentInputHandler = null;
let entitlementStorageSyncInFlight = null;
let findVideoIntervalId = null;
let renderIntervalId = null;
let videoTimeUpdateHandler = null;
let activeCommentLoop = null;
let pendingLoopStartCommentId = null;
let lastPageHref = window.location.href;
let lastVideoId = '';
let pendingShortcutCommentFocus = false;

// Settings State
let shortcutConfig = {
    altKey: true,
    ctrlKey: false,
    shiftKey: false,
    key: 'KeyC', // Code
    label: 'Alt + C' // Display
};
let inputShortcutConfig = {
    altKey: true,
    ctrlKey: false,
    shiftKey: true,
    key: 'KeyM',
    label: 'Alt + Shift + M'
};

let entitlementState = {
  firstSeenAt: 0,
  isBetaGrandfathered: false,
  isProPurchased: false
};
let totalStoredCommentCount = 0;

function countStoredComments(storageObject) {
  const all = (storageObject && typeof storageObject === 'object') ? storageObject : {};
  const countsByVideo = new Map();
  for (const [key, value] of Object.entries(all)) {
    if (!key.startsWith(VIDEO_MEMO_COMMENTS_PREFIX)) continue;
    const suffix = key.slice(VIDEO_MEMO_COMMENTS_PREFIX.length);
    const parsedKey = parseStoredCommentSuffix(suffix);
    const canonicalVideoKey = `${parsedKey.site}::${parsedKey.videoId || parsedKey.rawVideoId || suffix}`;
    let entryCount = 0;
    if (Array.isArray(value)) {
      entryCount = value.length;
    } else if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) entryCount = parsed.length;
      } catch (_) {}
    }
    const prev = countsByVideo.get(canonicalVideoKey) || 0;
    if (entryCount > prev) {
      countsByVideo.set(canonicalVideoKey, entryCount);
    }
  }
  let total = 0;
  for (const count of countsByVideo.values()) {
    total += count;
  }
  return total;
}

async function refreshStoredCommentCount() {
  const all = await getStorageLocalAll();
  totalStoredCommentCount = countStoredComments(all);
  refreshLimitStatus?.();
  return totalStoredCommentCount;
}

function hasUnlimitedAccess() {
  return !!(entitlementState.isBetaGrandfathered || entitlementState.isProPurchased);
}

function getRemainingCommentSlots() {
  return Math.max(0, FREE_COMMENT_LIMIT - totalStoredCommentCount);
}

function isFreeLimitReached() {
  return !hasUnlimitedAccess() && totalStoredCommentCount >= FREE_COMMENT_LIMIT;
}

function getEntitlementLabel() {
  if (entitlementState.isProPurchased) return 'Pro';
  if (entitlementState.isBetaGrandfathered) return t('contentEntitlementBeta', undefined, 'Beta perk');
  return t('contentEntitlementFree', undefined, 'Free');
}

function getHeaderStatusLabel() {
  if (entitlementState.isProPurchased) return t('contentHeaderPro', undefined, 'Scene Memo (Pro)');
  return t('contentHeaderDefault', undefined, 'Scene Memo');
}

function getUsedCommentCount() {
  return totalStoredCommentCount;
}

function buildShortcutLabelFromEvent(e) {
  const parts = [];
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');
  parts.push(e.key.toUpperCase());
  return parts.join(' + ');
}

function isShortcutMatch(e, config) {
  return (
    e.code === config.key &&
    e.altKey === config.altKey &&
    e.ctrlKey === config.ctrlKey &&
    e.shiftKey === config.shiftKey
  );
}

function isSameShortcut(a, b) {
  return (
    a.altKey === b.altKey &&
    a.ctrlKey === b.ctrlKey &&
    a.shiftKey === b.shiftKey &&
    a.key === b.key
  );
}

async function loadEntitlements() {
  const [syncValues, localValues] = await Promise.all([
    getStorageSync(ENTITLEMENT_KEYS),
    getStorageLocal([...ENTITLEMENT_KEYS, DEV_DISABLE_BETA_FOR_CHECKOUT_TEST])
  ]);

  const now = Date.now();
  const betaEndAt = Date.parse(BETA_PERIOD_END_ISO);
  let firstSeenAt = Number(syncValues[ENTITLEMENT_KEY_FIRST_SEEN_AT] || localValues[ENTITLEMENT_KEY_FIRST_SEEN_AT] || 0);
  let isBetaGrandfathered = !!(syncValues[ENTITLEMENT_KEY_BETA_GRANDFATHERED] || localValues[ENTITLEMENT_KEY_BETA_GRANDFATHERED]);
  const isProPurchased = !!(syncValues[ENTITLEMENT_KEY_PRO_PURCHASED] || localValues[ENTITLEMENT_KEY_PRO_PURCHASED]);
  const disableBetaForCheckoutTest = !!localValues[DEV_DISABLE_BETA_FOR_CHECKOUT_TEST];

  if (!firstSeenAt) {
    firstSeenAt = now;
  }
  if (!isBetaGrandfathered && firstSeenAt <= betaEndAt) {
    isBetaGrandfathered = true;
  }
  if (disableBetaForCheckoutTest && !isProPurchased) {
    isBetaGrandfathered = false;
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
    headers: buildLicenseApiHeaders(),
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

async function clearProEntitlement() {
  const patch = { [ENTITLEMENT_KEY_PRO_PURCHASED]: false };
  await Promise.all([setStorageLocal(patch), setStorageSync(patch)]);
  entitlementState = { ...entitlementState, isProPurchased: false };
  refreshLimitStatus?.();
}

async function syncProEntitlementFromServer() {
  if (!entitlementState.isProPurchased) {
    return false;
  }

  try {
    const isPro = await verifyDeviceEntitlement();
    if (isPro) {
      return true;
    }

    await clearProEntitlement();
    return false;
  } catch (_) {
    return true;
  }
}

async function syncEntitlementsFromStorage() {
  if (entitlementStorageSyncInFlight) {
    return entitlementStorageSyncInFlight;
  }

  entitlementStorageSyncInFlight = (async () => {
    await loadEntitlements();
    await syncProEntitlementFromServer();
    refreshLimitStatus?.();
  })();

  try {
    await entitlementStorageSyncInFlight;
  } finally {
    entitlementStorageSyncInFlight = null;
  }
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
      if (result[INPUT_SHORTCUT_KEY]) {
          inputShortcutConfig = result[INPUT_SHORTCUT_KEY];
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
      totalStoredCommentCount = countStoredComments(result);
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
    }, async () => {
      await createAutoBackupSnapshot('save_comments');
      await refreshStoredCommentCount();
      if (typeof onSaved === 'function') onSaved();
      refreshVideoIndex?.();
      refreshAutoBackupStatus?.();
    });
    return;
  }
  chrome.storage.local.remove([storageKey, metaKey], async () => {
    await createAutoBackupSnapshot('delete_comments');
    await refreshStoredCommentCount();
    if (typeof onSaved === 'function') onSaved();
    refreshVideoIndex?.();
    refreshAutoBackupStatus?.();
  });
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function createOverlay() {
  if (getOverlayElement()) return;

  const overlayHost = document.createElement('div');
  overlayHost.id = OVERLAY_HOST_ID;
  overlayHost.tabIndex = -1;
  const shadowRoot = overlayHost.attachShadow({ mode: 'open', delegatesFocus: true });
  const shadowStyle = document.createElement('style');
  shadowStyle.id = style.id;
  shadowStyle.textContent = style.textContent;
  shadowRoot.appendChild(shadowStyle);

  const overlay = document.createElement('div');
  overlay.id = 'fanza-comment-overlay';
  overlay.innerHTML = `
    <div class="fc-header">
      <span id="fc-status">${t('contentHeaderDefault', undefined, 'Scene Memo')}</span>
      <div class="fc-header-btns">
        <button id="fc-loop-clear-btn" class="fc-loop-clear-btn" style="background:none;border:none;cursor:pointer;display:none;" title="${t('contentOverlayLoopClearTitle', undefined, 'Clear A/B repeat')}">${t('contentOverlayLoopClear', undefined, 'Clear AB loop')}</button>
        <label class="fc-auto-min-label">
            <input type="checkbox" id="fc-auto-min"> ${t('contentOverlayAutoMin', undefined, 'Auto minimize')}
        </label>
        <button id="fc-settings-btn" style="background:none;border:none;cursor:pointer;" title="${t('contentOverlaySettings', undefined, 'Settings')}">⚙</button>
        <button id="fc-minimize-btn" style="background:none;border:none;cursor:pointer;" title="${t('contentOverlayMinimize', undefined, 'Minimize')}">_</button>
        <button id="fc-close-btn" style="background:none;border:none;cursor:pointer;" title="${t('contentOverlayHide', undefined, 'Hide')}">×</button>
      </div>
    </div>
    
    <div class="fc-search-area">
      <input type="text" id="fc-search-input" class="fc-search-input" placeholder="${t('contentOverlaySearchPlaceholder', undefined, 'Search comments...')}">
      <button type="button" id="fc-search-clear" class="fc-search-clear is-hidden" title="${t('contentOverlaySearchClear', undefined, 'Clear search')}">×</button>
    </div>
    
    <div class="fc-list" id="fc-list"></div>
    
    <div class="fc-settings" id="fc-settings">
        <div class="fc-settings-header">
            <h4 class="fc-settings-title">${t('contentOverlaySettingsTitle', undefined, 'Settings')}</h4>
            <button type="button" id="fc-settings-close" class="fc-settings-close" title="${t('contentOverlaySettingsClose', undefined, 'Close settings')}">×</button>
        </div>
        <div id="fc-video-summary" style="font-size: 11px; color: #cbd5e1; line-height: 1.4; margin-bottom: 12px;"></div>
        <button id="fc-upgrade-btn" class="fc-btn fc-btn-pro" style="margin-bottom:12px; display:none; width:100%; font-size:12px;" title="${t('contentOverlayUpgradeTitle', undefined, 'Unlock limits with a one-time purchase')}">${t('contentOverlayUpgradeButton', undefined, 'Upgrade to Pro (Unlimited)')}</button>
        <input type="text" id="fc-video-filter" class="fc-input" placeholder="${t('contentOverlayVideoFilterPlaceholder', undefined, 'Search commented videos...')}" style="font-size:12px;">
        <div id="fc-video-index" style="min-height:160px;max-height:220px;overflow:auto;border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:6px;background:rgba(0,0,0,0.2);"></div>
        <button id="fc-video-more-btn" class="fc-btn" style="width:100%;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);box-shadow:none;font-size:12px;margin-top:8px;">${t('contentOverlayVideoMore', undefined, 'Show more')}</button>
        <div>
            <label>${t('contentOverlayToggleShortcut', undefined, 'Toggle shortcut:')}</label>
            <input type="text" id="fc-shortcut-input" class="fc-input" readonly value="${shortcutConfig.label}" style="cursor:pointer; text-align:center;">
            <p style="font-size:10px;color:#aaa;">${t('contentOverlayShortcutHelp', undefined, 'Click, then press the key you want to use')}</p>
        </div>
        <div>
            <label>${t('contentOverlayInputShortcut', undefined, 'Comment input shortcut:')}</label>
            <input type="text" id="fc-input-shortcut-input" class="fc-input" readonly value="${inputShortcutConfig.label}" style="cursor:pointer; text-align:center;">
            <p style="font-size:10px;color:#aaa;">${t('contentOverlayInputShortcutHelp', undefined, 'Open and focus the input even while minimized')}</p>
        </div>
        <div style="margin-top:6px; display:flex; flex-direction:column; gap:6px;">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                <input type="checkbox" id="fc-default-auto-min">
                ${t('contentOverlayDefaultAutoMin', undefined, 'Enable auto minimize by default')}
            </label>
            <label style="display:flex;flex-direction:column;gap:4px;">
                <span>${t('contentOverlayMinimizePosition', undefined, 'Minimized position')}</span>
                <select id="fc-minimize-mode" class="fc-input" style="font-size:12px;">
                    <option value="top-left">${t('contentOverlayMinimizeTopLeft', undefined, 'Top left (default)')}</option>
                    <option value="current">${t('contentOverlayMinimizeCurrent', undefined, 'Current position')}</option>
                    <option value="top-right">${t('contentOverlayMinimizeTopRight', undefined, 'Top right')}</option>
                    <option value="bottom-left">${t('contentOverlayMinimizeBottomLeft', undefined, 'Bottom left')}</option>
                    <option value="bottom-right">${t('contentOverlayMinimizeBottomRight', undefined, 'Bottom right')}</option>
                </select>
            </label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                <input type="checkbox" id="fc-theme-toggle">
                ${t('contentOverlayLightTheme', undefined, 'Use light theme')}
            </label>
        </div>
        <div style="display:flex;gap:6px;margin-top:4px;">
            <button id="fc-export-json-btn" class="fc-btn" type="button" style="flex:1;font-size:12px;">${t('contentOverlayExportJson', undefined, 'Export JSON')}</button>
            <button id="fc-import-json-btn" class="fc-btn" type="button" style="flex:1;font-size:12px;">${t('contentOverlayImportJson', undefined, 'Import JSON')}</button>
            <input id="fc-import-json-file" type="file" accept="application/json,.json" style="display:none;">
        </div>
        <div style="margin-top:6px;font-size:11px;line-height:1.5;color:#cbd5e1;">
            ${t('contentOverlayBackupNote', undefined, 'Back up important memos as JSON on a regular basis.')}
        </div>
        <div style="margin-top:8px;padding:8px;border:1px solid rgba(255,255,255,0.12);border-radius:8px;background:rgba(255,255,255,0.04);">
            <div id="fc-auto-backup-status" style="font-size:11px;color:#cbd5e1;">${t('contentOverlayAutoBackupChecking', undefined, 'Auto backup: checking...')}</div>
            <button id="fc-export-auto-backup-btn" class="fc-btn" type="button" style="width:100%;font-size:12px;margin-top:6px;">${t('contentOverlayExportAutoBackup', undefined, 'Export latest auto backup')}</button>
        </div>
        <div id="fc-settings-footer" style="padding-top:16px; margin-top:auto; background: none;">
             <button id="fc-generate-dummy-btn" class="fc-btn" style="width:100%; font-size:12px; display:none; margin-bottom:10px;">${t('contentOverlayDummyComments', undefined, '+ Add 100 dummy comments')}</button>
             <button id="fc-clear-all-btn" class="fc-btn" style="width:100%; background:rgba(239, 68, 68, 0.04); border-color:rgba(239, 68, 68, 0.12); color:#fca5a5; font-size:12px;">${t('contentOverlayClearAll', undefined, 'Delete all comments')}</button>
        </div>
    </div>

    <div class="fc-input-area">
      <input type="text" class="fc-input" placeholder="${t('contentOverlayCommentPlaceholder', undefined, 'Comment...')}" maxlength="120">
      <button class="fc-btn">+</button>
    </div>
  `;
  
  const getFullscreenHost = () => (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement ||
    null
  );

  const isOverlayMountedInFullscreen = () => overlay.dataset.mountContext === 'fullscreen';

  const setOverlayPositionMode = () => {
    overlay.style.position = isOverlayMountedInFullscreen() ? 'fixed' : 'absolute';
  };

  const ensureOverlayMountRoot = () => {
    const fullscreenHost = getFullscreenHost();
    const nextRoot = fullscreenHost || document.body;
    const nextContext = fullscreenHost ? 'fullscreen' : 'document';
    if (overlayHost.parentElement !== nextRoot) {
      nextRoot.appendChild(overlayHost);
    }
    overlay.dataset.mountContext = nextContext;
    setOverlayPositionMode();
  };

  const toOverlayLeft = (clientLeft) => `${clientLeft + (isOverlayMountedInFullscreen() ? 0 : window.scrollX)}px`;
  const toOverlayTop = (clientTop) => `${clientTop + (isOverlayMountedInFullscreen() ? 0 : window.scrollY)}px`;

  shadowRoot.appendChild(overlay);
  ensureOverlayMountRoot();

  // Input setup
  const btn = overlay.querySelector('.fc-btn'); // This selects the first one (Post button? No, first one is in settings now? NO settings button has class fc-btn too!)
  // Wait, querySelector returns first match. The settings back button has class fc-btn but comes BEFORE the post button? No, afterwards in HTML structure but wait.
  // "fc-settings" is before "fc-input-area". "fc-input-area" has "fc-btn".
  // "fc-settings" contains settings-specific controls.
  
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
  const settingsCloseBtn = overlay.querySelector('#fc-settings-close');
  const shortcutInput = overlay.querySelector('#fc-shortcut-input');
  const searchInput = overlay.querySelector('#fc-search-input');
  const searchClearBtn = overlay.querySelector('#fc-search-clear');
  const defaultAutoMinCheckbox = overlay.querySelector('#fc-default-auto-min');
  const minimizeModeSelect = overlay.querySelector('#fc-minimize-mode');
  const themeToggleCheckbox = overlay.querySelector('#fc-theme-toggle');
  const exportJsonBtn = overlay.querySelector('#fc-export-json-btn');
  const importJsonBtn = overlay.querySelector('#fc-import-json-btn');
  const importJsonFileInput = overlay.querySelector('#fc-import-json-file');
  const autoBackupStatusEl = overlay.querySelector('#fc-auto-backup-status');
  const exportAutoBackupBtn = overlay.querySelector('#fc-export-auto-backup-btn');
  const loopClearBtn = overlay.querySelector('#fc-loop-clear-btn');
  const statusEl = overlay.querySelector('#fc-status');
  const inputShortcutInput = overlay.querySelector('#fc-input-shortcut-input');
  let videoIndexQuery = '';
  let showAllVideoCards = false;

  const focusCommentInputWithRetry = (attempt = 0) => {
    if (!overlay.isConnected || overlay.style.display === 'none') return;

    if (document.activeElement !== overlayHost) {
      overlayHost.focus({ preventScroll: true });
    }

    const shadowActiveElement = getOverlayShadowRoot()?.activeElement;
    if (shadowActiveElement !== input) {
      input.focus({ preventScroll: true });
    }

    if (typeof input.setSelectionRange === 'function') {
      const caretPos = input.value.length;
      input.setSelectionRange(caretPos, caretPos);
    } else if (typeof input.select === 'function' && input.value) {
      input.select();
    }

    if (attempt >= 4) return;
    if (getOverlayShadowRoot()?.activeElement === input) return;

    setTimeout(() => {
      requestAnimationFrame(() => {
        focusCommentInputWithRetry(attempt + 1);
      });
    }, [0, 20, 60, 120, 220][attempt] ?? 220);
  };

  const focusCommentInput = () => {
    if (overlay.style.display === 'none') {
      overlay.style.display = 'flex';
    }
    if (overlay.classList.contains('fc-settings-open')) {
      closeSettingsPanel();
    }
    if (isMinimized && overlay.toggleMinimize) {
      overlay.toggleMinimize(false);
    }
    const activeVideo = getActiveVideoElement();
    if (activeVideo && !activeVideo.paused) {
      activeVideo.pause();
    }
    requestAnimationFrame(() => {
      focusCommentInputWithRetry();
    });
  };
  focusCommentInputHandler = focusCommentInput;

  const updateLimitStatus = () => {
    if (!statusEl) return;
    const upgradeBtn = overlay.querySelector('#fc-upgrade-btn');
    if (hasUnlimitedAccess()) {
      statusEl.textContent = getHeaderStatusLabel();
      if (upgradeBtn) upgradeBtn.style.display = 'none';
      return;
    }
    statusEl.textContent = t('contentOverlayFreeRemaining', [String(getRemainingCommentSlots()), String(FREE_COMMENT_LIMIT)], `Free slots left ${getRemainingCommentSlots()}/${FREE_COMMENT_LIMIT}`);
    if (upgradeBtn) upgradeBtn.style.display = 'block';
  };
  refreshLimitStatus = updateLimitStatus;

  const updateLoopClearButton = () => {
    if (!loopClearBtn) return;
    const shouldShow = !!activeCommentLoop;
    loopClearBtn.classList.toggle('is-hidden', !shouldShow);
  };
  refreshLoopClearButton = updateLoopClearButton;

  const updateAutoBackupStatus = async () => {
    if (!autoBackupStatusEl) return;
    const latest = await getLatestAutoBackupSnapshot();
    if (!latest) {
      autoBackupStatusEl.textContent = t('contentOverlayAutoBackupNone', undefined, 'Auto backup: none yet');
      if (exportAutoBackupBtn) exportAutoBackupBtn.disabled = true;
      return;
    }
    autoBackupStatusEl.textContent = t('contentOverlayAutoBackupLabel', [formatAutoBackupLabel(latest.createdAt)], `Auto backup: ${formatAutoBackupLabel(latest.createdAt)}`);
    if (exportAutoBackupBtn) exportAutoBackupBtn.disabled = false;
  };
  refreshAutoBackupStatus = updateAutoBackupStatus;
  updateLimitStatus();
  updateLoopClearButton();

  if (loopClearBtn) {
    loopClearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      activeCommentLoop = null;
      pendingLoopStartCommentId = null;
      updateLoopClearButton();
      lastRenderedCommentCount = 0;
      renderComments(videoElement ? videoElement.currentTime : 0);
    });
  }

  const openSettingsPanel = () => {
    overlay.classList.add('fc-settings-open');
    settingsDiv.scrollTop = 0;
  };

  const closeSettingsPanel = () => {
    overlay.classList.remove('fc-settings-open');
  };

  const upgradeBtn = overlay.querySelector('#fc-upgrade-btn');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const setUpgradeButtonIdle = () => {
        upgradeBtn.textContent = t('contentOverlayUpgradeButton', undefined, 'Upgrade to Pro (Unlimited)');
        upgradeBtn.disabled = false;
      };
      try {
        const fp = await getDeviceFingerprint();
        const checkoutState = generateCheckoutState();
        await sendRuntimeMessage({ type: 'registerCheckoutState', checkoutState });
        upgradeBtn.textContent = t('upgradeButtonProcessing', undefined, 'Processing...');
        upgradeBtn.disabled = true;
        
        const response = await fetch(`${LICENSE_API_BASE_URL}/create-checkout-session`, {
          method: "POST",
          headers: buildLicenseApiHeaders(),
          body: JSON.stringify({
            device_fingerprint: fp,
            checkout_state: checkoutState,
            runtime_locale: contentLocale === 'ja' ? 'ja' : 'en'
          })
        });
        const data = await response.json();
        
        if (data.ok && data.url) {
           const width = 500;
           const height = 700;
           const left = Math.round((window.screen.width - width) / 2);
           const top = Math.round((window.screen.height - height) / 2);
           const checkoutWindow = window.open(data.url, 'stripe_checkout', `width=${width},height=${height},left=${left},top=${top},status=no,location=no,menubar=no,toolbar=no`);
           upgradeBtn.textContent = t('upgradeButtonChecking', undefined, 'Checking purchase...');
           let attempts = 0;
           const pollOnce = async () => {
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
                 return true;
               }
             } catch (_) {
               // best effort polling
             }
             const popupClosed = checkoutWindow && checkoutWindow.closed;
             if (attempts >= CHECKOUT_POLL_MAX_ATTEMPTS || popupClosed) {
               clearInterval(pollTimer);
               sendRuntimeMessage({ type: 'unregisterCheckoutState', checkoutState }).catch(() => {});
               setUpgradeButtonIdle();
             }
             return false;
           };
           const pollTimer = setInterval(pollOnce, CHECKOUT_POLL_INTERVAL_MS);
           await pollOnce();
        } else {
           sendRuntimeMessage({ type: 'unregisterCheckoutState', checkoutState }).catch(() => {});
           alert(t('contentOverlayCheckoutUrlError', [data.message || data.error || t('unknownError', undefined, 'Unknown error')], `Failed to get checkout URL: ${data.message || data.error || 'Unknown error'}`));
           setUpgradeButtonIdle();
        }
      } catch (err) {
        alert(err && err.message
          ? t('networkErrorWithMessage', [err.message], `A network error occurred: ${err.message}`)
          : t('networkErrorSimple', undefined, 'A network error occurred.'));
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
    const siteCommentCount = siteEntries.reduce((sum, entry) => sum + Number(entry.count || 0), 0);
    const normalizedQuery = videoIndexQuery.trim().toLowerCase();

    videoSummaryDiv.innerHTML = `
      <div><strong>${escapeHtml(t('contentSummaryCurrent', undefined, 'Current:'))}</strong> ${escapeHtml(currentTitle)}</div>
      <div style="color:#bbb;">${escapeHtml(currentSiteLabel)} / ${escapeHtml(videoId)}</div>
      <div style="margin-top:4px;"><strong>${escapeHtml(t('contentSummaryCommentedVideos', undefined, 'Commented videos:'))}</strong> ${escapeHtml(t('contentSummaryItemCount', [String(siteEntries.length)], `${siteEntries.length} items`))}</div>
      <div style="margin-top:2px;"><strong>${escapeHtml(t('contentSummarySiteComments', undefined, 'Saved comments on this site:'))}</strong> ${escapeHtml(t('contentSummaryItemCount', [String(siteCommentCount)], `${siteCommentCount} items`))}</div>
      <div style="margin-top:2px;"><strong>${escapeHtml(t('contentSummaryAllComments', undefined, 'All sites total:'))}</strong> ${getUsedCommentCount()} / ${FREE_COMMENT_LIMIT}</div>
    `;

    if (siteEntries.length === 0) {
      videoIndexDiv.innerHTML = `<div style="font-size:11px;color:#bbb;">${escapeHtml(t('contentNoSavedVideos', undefined, 'No saved comments yet.'))}</div>`;
      if (videoMoreBtn) videoMoreBtn.style.display = 'none';
      return;
    }

    const enrichedEntries = await Promise.all(siteEntries.map(async (entry) => {
      const isCurrentEntry = entry.keySuffix === suffix;
      const fallbackLabel = t('contentVideoLabel', [getSiteLabel(entry.site)], `${getSiteLabel(entry.site)} video`);
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
      videoIndexDiv.innerHTML = `<div style="font-size:11px;color:#bbb;">${escapeHtml(t('contentNoMatchingVideos', undefined, 'No matching videos found.'))}</div>`;
      if (videoMoreBtn) videoMoreBtn.style.display = 'none';
      return;
    }

    if (videoMoreBtn) {
      if (filteredEntries.length <= 5) {
        videoMoreBtn.style.display = 'none';
      } else {
        videoMoreBtn.style.display = 'block';
        const remain = filteredEntries.length - 5;
        videoMoreBtn.textContent = showAllVideoCards
          ? t('contentOverlayVideoLess', undefined, 'Collapse')
          : t('contentOverlayVideoMoreRemaining', [String(remain)], `Show more (${remain} left)`);
      }
    }

    videoIndexDiv.innerHTML = visibleEntries.map((entry) => {
      const label = t('contentVideoLabel', [getSiteLabel(entry.site)], `${getSiteLabel(entry.site)} video`);
      const title = entry.resolvedTitle || label;
      const isCurrent = entry.keySuffix === suffix;
      const targetUrl = entry.url;
      const safeUrl = escapeHtml(targetUrl);
      const safeSuffix = escapeHtml(entry.keySuffix);
      return `
        <div class="fc-video-index-item ${isCurrent ? 'fc-current-video' : ''}" data-url="${safeUrl}" data-suffix="${safeSuffix}" style="position:relative;padding:5px 28px 5px 6px;border-radius:4px;margin-bottom:4px;background:${isCurrent ? 'rgba(68,187,255,0.25)' : 'rgba(255,255,255,0.02)'};cursor:pointer;">
          <button type="button" class="fc-video-index-delete" data-suffix="${safeSuffix}" title="${t('contentVideoDeleteTitle', undefined, 'Delete comments for this video')}" style="position:absolute;top:4px;right:4px;width:18px;height:18px;border:1px solid rgba(255,255,255,0.24);border-radius:4px;background:rgba(0,0,0,0.3);color:#ddd;cursor:pointer;line-height:14px;padding:0;font-size:12px;">×</button>
          <div style="font-size:11px;color:${isCurrent ? '#dff3ff' : '#fff'};line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word;">${escapeHtml(title)}${isCurrent ? t('contentCurrentSuffix', undefined, ' (Current)') : ''}</div>
          <div style="font-size:10px;color:#9ec5ff;">${escapeHtml(t('contentCommentCount', [String(entry.count)], `${entry.count} comments`))}</div>
          <div style="font-size:10px;color:#8fa4b8;">${escapeHtml(getSiteLabel(entry.site))}</div>
        </div>
      `;
    }).join('');

    const navigateToItem = (item) => {
        const targetUrl = item.getAttribute('data-url');
        if (!targetUrl || targetUrl === window.location.href) return;
        markForceMinimizeOnNextNavigation();
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
        if (!confirm(t('contentDeleteVideoConfirm', undefined, 'Delete all comments for this video?'))) return;
        const commentsKey = `${VIDEO_MEMO_COMMENTS_PREFIX}${keySuffix}`;
        const metaKey = `${VIDEO_MEMO_META_PREFIX}${keySuffix}`;
        chrome.storage.local.remove([commentsKey, metaKey], () => {
          const parsed = parseStoredCommentSuffix(keySuffix);
          if (parsed.site === siteKey && parsed.videoId === videoId) {
            comments = [];
            lastRenderedCommentCount = 0;
            renderComments(videoElement ? videoElement.currentTime : 0);
          }
          createAutoBackupSnapshot('delete_video_index').finally(async () => {
            await refreshStoredCommentCount();
            refreshAutoBackupStatus?.();
          });
          renderVideoIndex();
        });
      });
    });
  };
  refreshVideoIndex = renderVideoIndex;
  refreshAutoBackupStatus?.();
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
  let minimizeMode = 'top-left';
  const shouldForceMinimizeAfterNavigation = consumeForceMinimizeOnNavigation();
  let jumpPreviewTimer = null;
  let jumpPreviewEl = shadowRoot.querySelector('#fc-jump-preview');
  if (!jumpPreviewEl) {
    jumpPreviewEl = document.createElement('div');
    jumpPreviewEl.id = 'fc-jump-preview';
    jumpPreviewEl.className = 'fc-jump-preview';
    jumpPreviewEl.style.display = 'none';
    shadowRoot.appendChild(jumpPreviewEl);
  }

  const placeOverlayInsideVideo = () => {
    const vRect = getPlaybackBoundsRect();
    const oRect = overlay.getBoundingClientRect();
    const margin = 20;
    const left = vRect.right - oRect.width - margin;
    const top = vRect.bottom - oRect.height - margin;
    overlay.style.right = 'auto';
    overlay.style.bottom = 'auto';
    overlay.style.left = toOverlayLeft(left);
    overlay.style.top = toOverlayTop(top);
  };

  const clampOverlayToVideo = () => {
    const vRect = getPlaybackBoundsRect();
    
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
    overlay.style.left = toOverlayLeft(x);
    overlay.style.top = toOverlayTop(y);
  };

  showJumpPreview = (comment) => {
    if (!isMinimized || !comment || !jumpPreviewEl) return;
    const overlayRect = overlay.getBoundingClientRect();
    const vRect = getPlaybackBoundsRect();
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
    const shouldStartMinimizedOnPlayerOpen = true;

    if (savedPos) {
        try {
            const { left, top, isMin, autoMin, minimizeAnchor: savedAnchor, minimizeMode: savedMode, width, height, theme } = savedPos;
            autoMinState = (typeof autoMin === 'boolean') ? autoMin : defaultAutoMin;
            isLightTheme = !!theme;
            if (savedAnchor === 'top' || savedAnchor === 'bottom') {
              minimizeAnchor = savedAnchor;
            }
            if (['top-left', 'current', 'top-right', 'bottom-left', 'bottom-right'].includes(savedMode)) {
              minimizeMode = savedMode;
            }
            if (width) overlay.style.width = width;
            if (height) overlay.style.height = height;

            if (isMin || shouldForceMinimizeAfterNavigation || shouldStartMinimizedOnPlayerOpen) {
                isMinimized = true;
                overlay.classList.add('minimized');
                minBtn.textContent = '□';
                
                // 展開時の座標として保存しておく
                overlay._expandedLeft = left;
                overlay._expandedTop = top;

                overlay.style.bottom = 'auto';
                overlay.style.right = 'auto';
                requestAnimationFrame(() => applyMinimizedPosition());
            } else {
                overlay.style.bottom = 'auto';
                overlay.style.right = 'auto';
                overlay.style.left = left;
                overlay.style.top = top;
            }
        } catch(e) {}
    } else {
        placeOverlayInsideVideo();
        if (shouldForceMinimizeAfterNavigation || shouldStartMinimizedOnPlayerOpen) {
          isMinimized = true;
          overlay.classList.add('minimized');
          minBtn.textContent = '□';
          overlay._expandedLeft = overlay.style.left;
          overlay._expandedTop = overlay.style.top;
          requestAnimationFrame(() => applyMinimizedPosition());
        }
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
    if (minimizeModeSelect) {
        minimizeModeSelect.value = minimizeMode;
        minimizeModeSelect.addEventListener('change', () => {
            minimizeMode = minimizeModeSelect.value || 'top-left';
            saveUIState();
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
            ensureOverlayMountRoot();
            saveUIState();
        }
    });
    ro.observe(overlay);

    requestAnimationFrame(() => clampOverlayToVideo());
    renderVideoIndex();
  });

  window.addEventListener('resize', () => {
    if (!overlay.isConnected || overlay.style.display === 'none') return;
    ensureOverlayMountRoot();
    if (isMinimized) {
      applyMinimizedPosition();
    } else {
      clampOverlayToVideo();
    }
    if (!getFullscreenHost()) {
      saveUIState();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    syncActiveVideoElement();
    ensureOverlayMountRoot();
    requestAnimationFrame(() => {
      if (!overlay.isConnected || overlay.style.display === 'none') return;
      if (isMinimized) {
        applyMinimizedPosition();
      } else {
        clampOverlayToVideo();
      }
      if (!getFullscreenHost()) {
        saveUIState();
      }
    });
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
          minimizeMode,
          theme: overlay.querySelector('#fc-theme-toggle')?.checked
      };
      if (!getFullscreenHost()) {
        chrome.storage.local.set({ fanza_mock_ui_pos: state });
      }
  };

  const applyMinimizedPosition = () => {
      const vRect = getPlaybackBoundsRect();
      const overlayRect = overlay.getBoundingClientRect();

      if (minimizeMode === 'current') {
          overlay.style.left = overlay._expandedLeft || overlay.style.left;
          overlay.style.top = overlay._expandedTop || overlay.style.top;
          return;
      }

      const positions = {
          'top-left': {
              left: vRect.left,
              top: vRect.top
          },
          'top-right': {
              left: vRect.right - overlayRect.width,
              top: vRect.top
          },
          'bottom-left': {
              left: vRect.left,
              top: vRect.bottom - overlayRect.height
          },
          'bottom-right': {
              left: vRect.right - overlayRect.width,
              top: vRect.bottom - overlayRect.height
          }
      };
      const target = positions[minimizeMode] || positions['top-left'];
      overlay.style.left = toOverlayLeft(target.left);
      overlay.style.top = toOverlayTop(target.top);
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

          overlay.classList.add('minimized');
          minBtn.textContent = '□';
          requestAnimationFrame(() => applyMinimizedPosition());
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
      openSettingsPanel();
      renderVideoIndex();
  });
  
  settingsCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSettingsPanel();
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
          label: buildShortcutLabelFromEvent(e)
      };
      if (isSameShortcut(newConfig, inputShortcutConfig)) {
          alert(t('contentShortcutConflictInput', undefined, 'You cannot use the same key as the comment input shortcut.'));
          return;
      }
      shortcutConfig = newConfig;
      
      shortcutInput.value = newConfig.label;
      chrome.storage.local.set({fanza_mock_shortcut: shortcutConfig});
  });
  inputShortcutInput.addEventListener('keydown', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;

      const newConfig = {
          altKey: e.altKey,
          ctrlKey: e.ctrlKey,
          shiftKey: e.shiftKey,
          key: e.code,
          label: buildShortcutLabelFromEvent(e)
      };
      if (isSameShortcut(newConfig, shortcutConfig)) {
          alert(t('contentShortcutConflictToggle', undefined, 'You cannot use the same key as the visibility toggle shortcut.'));
          return;
      }
      inputShortcutConfig = newConfig;
      inputShortcutInput.value = newConfig.label;
      chrome.storage.local.set({ [INPUT_SHORTCUT_KEY]: inputShortcutConfig });
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
              alert(t('contentFreeLimitReached', [String(FREE_COMMENT_LIMIT)], `You have reached the free plan limit (${FREE_COMMENT_LIMIT} comments).`));
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
          alert(t('contentDummyAdded', [String(newComments.length)], `Added ${newComments.length} dummy comments`));
      });
  }

  // Clear All
  const clearBtn = overlay.querySelector('#fc-clear-all-btn');
  if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(t('contentDeleteVideoConfirm', undefined, 'Delete all comments for this video?'))) {
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
        alert(t('contentExportJsonFailed', undefined, 'Failed to export JSON.'));
      }
    });
  }

  if (exportAutoBackupBtn) {
    exportAutoBackupBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        const latest = await getLatestAutoBackupSnapshot();
        if (!latest || !latest.snapshot) {
          alert(t('contentNoAutoBackupToExport', undefined, 'There is no auto backup available to export.'));
          return;
        }
        saveTextAsFile(buildAutoBackupFileName(latest.snapshot), JSON.stringify(latest.snapshot, null, 2));
      } catch (error) {
        console.error('Failed to export auto backup', error);
        alert(t('contentExportAutoBackupFailed', undefined, 'Failed to export the auto backup.'));
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
          alert(t('contentImportNoData', undefined, 'No restorable data was found in the JSON file.'));
          return;
        }
        if (!confirm(t('contentImportConfirm', [String(importKeys.length)], `Restore ${importKeys.length} settings/comments from JSON? Current data will be replaced.`))) {
          return;
        }

        await createAutoBackupSnapshot('pre_import');
        await removeStorageLocal(currentManagedKeys);
        await setStorageLocal(importData);
        await createAutoBackupSnapshot('import_json');
        await loadEntitlements();
        await loadComments();
        await refreshStoredCommentCount();
        refreshVideoIndex?.();
        refreshLimitStatus?.();
        refreshAutoBackupStatus?.();
        lastRenderedCommentCount = 0;
        renderComments(videoElement ? videoElement.currentTime : 0);
        alert(t('contentImportSuccess', undefined, 'JSON restore completed.'));
      } catch (error) {
        console.error('Failed to import backup', error);
        alert(t('contentImportFailed', undefined, 'Failed to restore JSON. Check the file format.'));
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
      
      // Constrain to playback area
      const vRect = getPlaybackBoundsRect();
      const oRect = overlay.getBoundingClientRect();
      
      const minX = vRect.left;
      const maxX = vRect.right - oRect.width;
      const minY = vRect.top;
      const maxY = vRect.bottom - oRect.height; 
      
      clientX = Math.max(minX, Math.min(maxX, clientX));
      clientY = Math.max(minY, Math.min(maxY, clientY));

      overlay.style.left = toOverlayLeft(clientX);
      overlay.style.top = toOverlayTop(clientY);
  };

  const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      saveUIState();
  };

  const postComment = () => {
    const text = input.value.trim();
    const activeVideo = getActiveVideoElement();
    console.log("Attempting to post:", text); // Debug
    if (!text || !activeVideo) return;
    if (isFreeLimitReached()) {
      alert(t('contentFreePlanLimitMessage', [String(FREE_COMMENT_LIMIT)], `The free plan allows up to ${FREE_COMMENT_LIMIT} comments. Delete some comments or use Pro.`));
      refreshLimitStatus?.();
      return;
    }
    
    // Add to local mock list
    const newComment = createLocalComment(
      text,
      activeVideo.currentTime,
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
    renderComments(activeVideo.currentTime);
    
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
    const activeVideo = getActiveVideoElement();
    if (activeVideo && !activeVideo.paused) {
      activeVideo.pause();
    }
    if (getOverlayShadowRoot()?.activeElement !== input) {
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
      const activeVideo = getActiveVideoElement();
      if (activeVideo && activeVideo.paused) {
        activeVideo.play().catch(() => {});
      }
      e.preventDefault();
    }
  }, { capture: true }); // Use capture to beat player global listeners
  
  input.addEventListener('focus', () => {
    const activeVideo = getActiveVideoElement();
    if (activeVideo && !activeVideo.paused) {
      activeVideo.pause();
    }
  });

  input.addEventListener('blur', () => {
    // Player can steal focus immediately after first tap; retry once only.
    if (commentRefocusTried) return;
    if (Date.now() - lastCommentPointerDownAt > 700) return;
    commentRefocusTried = true;
    setTimeout(() => {
      if (getOverlayShadowRoot()?.activeElement !== input) {
        input.focus({ preventScroll: true });
      }
    }, 0);
  });

  input.addEventListener('keyup', (e) => e.stopPropagation(), { capture: true });
  input.addEventListener('keypress', (e) => e.stopPropagation(), { capture: true });
  overlay.addEventListener('keydown', (e) => {
    if ((e.key === 'Escape' || e.key === 'Esc') && overlay.classList.contains('fc-settings-open')) {
      closeSettingsPanel();
      e.preventDefault();
      e.stopPropagation();
    }
  }, { capture: true });
  
  // Stop clicks from pausing video if it bubbles up
  overlay.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  overlay.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  });

  window.addEventListener('pointerdown', (e) => {
    if (!overlay.isConnected || overlay.style.display === 'none' || isMinimized) return;
    const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
    const clickedInsideOverlay = path.includes(overlay) || overlay.contains(e.target);
    const clickedJumpPreview = !!(jumpPreviewEl && (path.includes(jumpPreviewEl) || jumpPreviewEl.contains(e.target)));
    if (clickedInsideOverlay || clickedJumpPreview) return;
    toggleMinimize(true);
  }, true);

  // Store toggleMinimize for reuse in renderComments if needed (or just make it global/reachable)
  overlay.toggleMinimize = toggleMinimize;

  // Search Logic
  if (searchInput) {
    let isSearchMode = false;
    let wasPlayingBeforeSearch = false;
    searchInput.readOnly = false;
    searchInput.placeholder = t('contentOverlaySearchPlaceholder', undefined, 'Search comments...');

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
      if (getOverlayShadowRoot()?.activeElement === searchInput) {
        searchInput.blur();
      }
      const activeVideo = getActiveVideoElement();
      if (wasPlayingBeforeSearch && activeVideo && activeVideo.paused) {
        activeVideo.play().catch(() => {});
      }
      wasPlayingBeforeSearch = false;
    };

    const beginSearchMode = () => {
      const activeVideo = getActiveVideoElement();
      if (!isSearchMode) {
        wasPlayingBeforeSearch = !!(activeVideo && !activeVideo.paused);
      }
      setSearchMode(true);
      if (wasPlayingBeforeSearch && activeVideo && !activeVideo.paused) {
        activeVideo.pause();
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
        const activeVideo = getActiveVideoElement();
        if (activeVideo) {
          activeVideo.play().catch(() => {});
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
    const activeEl = getOverlayShadowRoot()?.activeElement || document.activeElement;
    const isTypingInOverlayInput = !!(activeEl && (
      activeEl.id === 'fc-search-input' ||
      activeEl.id === 'fc-shortcut-input' ||
      activeEl.classList?.contains('fc-edit-input') ||
      activeEl.classList?.contains('fc-input')
    ));

    // Comment jump: Ctrl + Left/Right
    const activeVideoForJump = getActiveVideoElement();
    if (!isTypingInOverlayInput && activeVideoForJump && e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
            const isRight = e.key === 'ArrowRight' || e.code === 'ArrowRight';
            const current = Number(activeVideoForJump.currentTime || 0);
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
              activeVideoForJump.currentTime = target;
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

    if (isShortcutMatch(e, inputShortcutConfig)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        const overlay = getOverlayElement();
        if (overlay) {
            if (overlay.style.display === 'none') {
                pendingShortcutCommentFocus = true;
                focusCommentInputHandler?.();
            } else if (overlay.classList.contains('minimized')) {
                pendingShortcutCommentFocus = true;
                focusCommentInputHandler?.();
            } else if (overlay.toggleMinimize) {
                overlay.toggleMinimize(true);
                const activeVideo = getActiveVideoElement();
                if (activeVideo && activeVideo.paused) {
                    activeVideo.play().catch(() => {});
                }
                pendingShortcutCommentFocus = false;
            }
        }
        return;
    }

    // Check config
    if (isShortcutMatch(e, shortcutConfig)) {
        e.preventDefault();
        e.stopPropagation();

        const overlay = getOverlayElement();
        if (overlay) {
            if (overlay.style.display === 'none') {
                overlay.style.display = 'flex';
                // Try to focus input (only if not minimized and visible)
                if (!overlay.classList.contains('minimized')) {
                    focusCommentInputHandler?.();
                }
            } else {
                overlay.style.display = 'none';
                
                // Return focus to video/body so spacebar still works for player
                const shadowActiveElement = getOverlayShadowRoot()?.activeElement;
                if (shadowActiveElement && typeof shadowActiveElement.blur === 'function') {
                    shadowActiveElement.blur();
                } else if (document.activeElement && getOverlayHostElement()?.contains(document.activeElement)) {
                    document.activeElement.blur();
                }
                
                const activeVideo = getActiveVideoElement();
                if (activeVideo) {
                    activeVideo.focus();
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

window.addEventListener('keyup', (e) => {
    if (!pendingShortcutCommentFocus) return;
    if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) return;
    if (e.key === 'Alt' || e.key === 'Shift' || e.key === 'Control' || e.key === 'Meta') {
        pendingShortcutCommentFocus = false;
        requestAnimationFrame(() => {
            focusCommentInputHandler?.();
        });
    }
}, true);

// Keep track of last rendered state to avoid full DOM rebuilds
let lastRenderedCommentCount = 0;
let lastRenderedSearchQuery = '';

function getPlaybackBoundsRect() {
  const siteKey = getSiteKey();
  const candidates = [];
  if (siteKey === 'youtube') {
    candidates.push(
      document.querySelector('#movie_player'),
      document.querySelector('.html5-video-player'),
      document.querySelector('#player-container'),
      document.querySelector('#player')
    );
  }
  if (videoElement) {
    candidates.push(videoElement);
  }
  for (const el of candidates) {
    if (!el || typeof el.getBoundingClientRect !== 'function') continue;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return rect;
    }
  }
  return {
    top: 0,
    left: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
    width: window.innerWidth,
    height: window.innerHeight
  };
}

function findCommentIndexById(commentId) {
  return comments.findIndex((comment) => comment.id === commentId);
}

function buildLoopRange(startCommentId, endCommentId) {
  const startIdx = findCommentIndexById(startCommentId);
  const endIdx = findCommentIndexById(endCommentId);
  if (startIdx < 0 || endIdx < 0 || endIdx <= startIdx) return null;
  const start = Number(comments[startIdx].t);
  const end = Number(comments[endIdx].t);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  return {
    commentId: startCommentId,
    start,
    end,
    startCommentId,
    endCommentId
  };
}

function syncActiveCommentLoop() {
  if (pendingLoopStartCommentId && findCommentIndexById(pendingLoopStartCommentId) < 0) {
    pendingLoopStartCommentId = null;
  }
  if (!activeCommentLoop) return;
  const refreshed = buildLoopRange(activeCommentLoop.startCommentId, activeCommentLoop.endCommentId);
  if (!refreshed) {
    activeCommentLoop = null;
    return;
  }
  activeCommentLoop = refreshed;
}

function applyLoopRange(startCommentId, endCommentId) {
  const nextRange = buildLoopRange(startCommentId, endCommentId);
  if (!nextRange) return false;
  activeCommentLoop = nextRange;
  pendingLoopStartCommentId = null;
  return true;
}

function renderComments(currentTime) {
  const overlay = getOverlayElement();
  const list = overlay?.querySelector('#fc-list');
  if (!list || !overlay) return;
  refreshLimitStatus?.();
  syncActiveCommentLoop();
  refreshLoopClearButton?.();

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
      const isPendingLoopStart = pendingLoopStartCommentId === c.id;
      const isLoopStart = !!(activeCommentLoop && activeCommentLoop.startCommentId === c.id);
      const isLoopEnd = !!(activeCommentLoop && activeCommentLoop.endCommentId === c.id);
      if (isLoopStart) {
        item.classList.add('loop-active');
      }
      if (isLoopEnd) {
        item.classList.add('loop-end');
      }
      
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
          
          const loopChip = (!isLoopStart && !isLoopEnd && !isPendingLoopStart) ? null : document.createElement('span');
          if (loopChip) {
              loopChip.className = `fc-loop-chip ${isLoopStart || isPendingLoopStart ? 'fc-loop-chip-start' : 'fc-loop-chip-end'}`;
              loopChip.textContent = isLoopStart
                ? t('contentLoopStart', undefined, 'Start')
                : isLoopEnd
                  ? t('contentLoopEnd', undefined, 'End')
                  : t('contentLoopPending', undefined, 'Start candidate');
          }

          const textSpan = document.createElement('span');
          textSpan.textContent = c.text;
          
          const delBtn = document.createElement('span');
          delBtn.className = 'fc-delete-btn';
          delBtn.innerHTML = '&times;';
          delBtn.title = t('contentDeleteTitle', undefined, 'Delete');
          delBtn.onclick = (e) => {
              e.stopPropagation();
              if (confirm(t('contentDeleteCommentConfirm', undefined, 'Delete this comment?'))) {
                  comments = comments.filter(comm => comm.id !== c.id);
                  saveComments();
                  refreshVideoIndex?.();
                  renderComments(videoElement ? videoElement.currentTime : 0);
              }
          };

          const editBtn = document.createElement('span');
          editBtn.className = 'fc-edit-btn';
          editBtn.innerHTML = '✎';
          editBtn.title = t('contentEditTitle', undefined, 'Edit');
          editBtn.onclick = (e) => {
              e.stopPropagation();
              const activeVideo = getActiveVideoElement();
              if (activeVideo) {
                activeVideo.currentTime = c.t;
                activeVideo.pause();
              }
              editingCommentId = c.id;
              lastRenderedCommentCount = 0; // Force rebuild to show input
              renderComments(videoElement ? videoElement.currentTime : 0);
          };

          const currentIndex = findCommentIndexById(c.id);
          const canBeLoopStart = currentIndex >= 0 && currentIndex < comments.length - 1;
          const canBeLoopEnd = pendingLoopStartCommentId && currentIndex > findCommentIndexById(pendingLoopStartCommentId);

          const loopStartBtn = document.createElement('span');
          loopStartBtn.className = 'fc-loop-point-btn';
          if (isLoopStart) loopStartBtn.classList.add('is-active', 'is-a');
          if (isPendingLoopStart && !isLoopStart) loopStartBtn.classList.add('is-active', 'is-pending');
          loopStartBtn.innerHTML = 'A';
          loopStartBtn.title = t('contentLoopStartTitle', undefined, 'Set as repeat start');
          loopStartBtn.onclick = (e) => {
              e.stopPropagation();
              if (!canBeLoopStart) return;
              if (isLoopStart || isPendingLoopStart) {
                  pendingLoopStartCommentId = null;
                  if (isLoopStart) activeCommentLoop = null;
              } else {
                  pendingLoopStartCommentId = c.id;
                  if (activeCommentLoop && activeCommentLoop.startCommentId !== c.id) {
                      activeCommentLoop = null;
                  }
              }
              lastRenderedCommentCount = 0;
              renderComments(videoElement ? videoElement.currentTime : 0);
          };
          if (canBeLoopStart || isLoopStart || isPendingLoopStart) {
              item.appendChild(loopStartBtn);
          }

          const loopEndBtn = document.createElement('span');
          loopEndBtn.className = 'fc-loop-point-btn';
          if (isLoopEnd) loopEndBtn.classList.add('is-active', 'is-b');
          loopEndBtn.innerHTML = 'B';
          loopEndBtn.title = pendingLoopStartCommentId
            ? t('contentLoopEndTitle', undefined, 'Set as repeat end')
            : t('contentLoopChooseStartFirst', undefined, 'Pick start point A first');
          loopEndBtn.onclick = (e) => {
              e.stopPropagation();
              if (isLoopEnd) {
                  activeCommentLoop = null;
                  pendingLoopStartCommentId = null;
              } else if (pendingLoopStartCommentId && applyLoopRange(pendingLoopStartCommentId, c.id)) {
                  const activeVideo = getActiveVideoElement();
                  if (activeVideo) {
                      activeVideo.currentTime = activeCommentLoop.start;
                      activeVideo.play().catch(() => {});
                  }
              }
              lastRenderedCommentCount = 0;
              renderComments(videoElement ? videoElement.currentTime : 0);
          };
          if (canBeLoopEnd || isLoopEnd) {
              item.appendChild(loopEndBtn);
          }
          
          item.appendChild(delBtn);
          item.appendChild(editBtn);
          if (loopChip) item.appendChild(loopChip);
          item.appendChild(timeSpan);
          item.appendChild(textSpan);
          
          item.addEventListener('click', () => {
            const activeVideo = getActiveVideoElement();
            if(activeVideo) {
              activeVideo.currentTime = c.t;
              activeVideo.play().catch(()=>{});
              
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
  const activeEl = getOverlayShadowRoot()?.activeElement || document.activeElement;
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

async function init(forceRefresh = false) {
  setBootDebugState('init_start');
  if (!isSupportedPlaybackPage()) {
    setBootDebugState('unsupported_page');
    if (findVideoIntervalId) {
      clearInterval(findVideoIntervalId);
      findVideoIntervalId = null;
    }
    if (renderIntervalId) {
      clearInterval(renderIntervalId);
      renderIntervalId = null;
    }
    detachVideoTimeUpdateHandler();
    removeExistingOverlayUi();
    refreshVideoIndex = null;
    refreshLimitStatus = null;
    refreshAutoBackupStatus = null;
    refreshLoopClearButton = null;
    focusCommentInputHandler = null;
    videoElement = null;
    activeCommentLoop = null;
    pendingLoopStartCommentId = null;
    return;
  }

  const currentVideoId = getVideoId();
  setBootDebugState('page_supported', `${getSiteKey()}:${currentVideoId || 'unknown'}`);
  console.log("Video Memo: Init", getSiteKey(), currentVideoId);

  if (!forceRefresh && lastVideoId === currentVideoId && getOverlayElement()) {
    setBootDebugState('already_initialized');
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
  detachVideoTimeUpdateHandler();

  removeExistingOverlayUi();
  refreshVideoIndex = null;
  refreshLimitStatus = null;
  refreshAutoBackupStatus = null;
  refreshLoopClearButton = null;
  focusCommentInputHandler = null;
  videoElement = null;
  activeCommentLoop = null;
  pendingLoopStartCommentId = null;
  editingCommentId = null;
  searchQuery = '';
  lastRenderedCommentCount = 0;
  lastRenderedSearchQuery = '';

  await loadEntitlements();
  await syncProEntitlementFromServer();
  await loadComments();
  setBootDebugState('waiting_for_video');
  
  findVideoIntervalId = setInterval(() => {
    const didBindNewVideo = syncActiveVideoElement();
    const activeVideo = videoElement;
    if (!activeVideo) {
      setBootDebugState('waiting_for_video');
      return;
    }

    if (didBindNewVideo) {
      setBootDebugState('video_bound');
      console.log("Video Memo: Video bound", activeVideo);
    }

    if (!getOverlayElement()) {
      createOverlay();
      setBootDebugState('overlay_created');
    }

    if (didBindNewVideo && getOverlayElement()?.querySelector('#fc-list')) {
      renderComments(activeVideo.currentTime);
      setBootDebugState('ready');
    }

    if (!renderIntervalId) {
      renderIntervalId = setInterval(() => {
        const currentVideo = getActiveVideoElement();
        if (getOverlayElement()?.querySelector('#fc-list') && currentVideo) {
          renderComments(currentVideo.currentTime);
        }
      }, 500);
    }
  }, 500);
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local' && areaName !== 'sync') {
    return;
  }

  const changedKeys = Object.keys(changes || {});
  if (!changedKeys.some((key) => ENTITLEMENT_KEYS.includes(key) || key === DEV_DISABLE_BETA_FOR_CHECKOUT_TEST)) {
    return;
  }

  syncEntitlementsFromStorage().catch((error) => {
    console.error('Failed to sync entitlements from storage change', error);
  });
});

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

async function bootExtension() {
  setBootDebugState('boot_start');
  contentLocale = await resolveContentLocale();
  setBootDebugState('locale_ready', contentLocale);
  setupRouteObserver();
  init();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      bootExtension();
    });
} else {
    bootExtension();
}
