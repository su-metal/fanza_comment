const API_BASE_URL = "https://wzinimxikcihdqqdvppa.supabase.co/functions/v1/license-api";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_qBIjjA5UN3H62B8dWdqo0w_PRTqVZCq";
const BETA_PERIOD_END_ISO = '2026-04-02T14:59:59.000Z'; // 2026-04-02 23:59:59 JST
const ENTITLEMENT_KEY_FIRST_SEEN_AT = 'fanza_memo_first_seen_at';
const ENTITLEMENT_KEY_BETA_GRANDFATHERED = 'fanza_memo_is_beta_grandfathered';
const ENTITLEMENT_KEY_PRO_PURCHASED = 'fanza_memo_is_pro_purchased';
const ENTITLEMENT_KEY_LICENSE_CODE = 'fanza_memo_license_code';
const ENTITLEMENT_KEY_PURCHASE_EMAIL = 'fanza_memo_purchase_email';
const DEV_FORCE_SHOW_UPGRADE_FOR_BETA = 'fanza_memo_force_show_upgrade_for_beta';
const DEV_DISABLE_BETA_FOR_CHECKOUT_TEST = 'fanza_memo_disable_beta_for_checkout_test';
const CHECKOUT_POLL_INTERVAL_MS = 2000;
const CHECKOUT_POLL_MAX_ATTEMPTS = 150; // 5 min
const ENTITLEMENT_KEYS = [
  ENTITLEMENT_KEY_FIRST_SEEN_AT,
  ENTITLEMENT_KEY_BETA_GRANDFATHERED,
  ENTITLEMENT_KEY_PRO_PURCHASED
];
const RECOVERY_KEYS = [
  ENTITLEMENT_KEY_LICENSE_CODE,
  ENTITLEMENT_KEY_PURCHASE_EMAIL
];
let currentLicenseCode = '';
let toastTimerId = null;

function getStorageArea(area, keys) {
  return new Promise((resolve) => {
    chrome.storage[area].get(keys, (result) => resolve(result || {}));
  });
}

function setStorageArea(area, values) {
  return new Promise((resolve) => {
    chrome.storage[area].set(values, () => resolve());
  });
}

function buildLicenseApiHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_PUBLISHABLE_KEY
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

async function getDeviceFingerprint() {
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

async function getEntitlementState() {
  const [syncValues, localValues] = await Promise.all([
    getStorageArea('sync', ENTITLEMENT_KEYS),
    getStorageArea('local', ENTITLEMENT_KEYS)
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
    setStorageArea('local', canonical),
    setStorageArea('sync', canonical)
  ]);

  return {
    isProPurchased,
    isBetaGrandfathered
  };
}

async function persistProEntitlement() {
  const patch = { [ENTITLEMENT_KEY_PRO_PURCHASED]: true };
  await Promise.all([
    setStorageArea('local', patch),
    setStorageArea('sync', patch)
  ]);
}

function normalizeLicenseCodeInput(raw) {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/[^A-Z0-9-]/g, '');
}

async function getRecoveryState() {
  const [syncValues, localValues] = await Promise.all([
    getStorageArea('sync', RECOVERY_KEYS),
    getStorageArea('local', RECOVERY_KEYS)
  ]);

  return {
    licenseCode: normalizeLicenseCodeInput(
      localValues[ENTITLEMENT_KEY_LICENSE_CODE] || syncValues[ENTITLEMENT_KEY_LICENSE_CODE] || ''
    ),
    purchaseEmail: String(
      localValues[ENTITLEMENT_KEY_PURCHASE_EMAIL] || syncValues[ENTITLEMENT_KEY_PURCHASE_EMAIL] || ''
    ).trim()
  };
}

async function persistRecoveryState({ licenseCode, purchaseEmail } = {}) {
  const patch = {};
  if (typeof licenseCode === 'string') {
    patch[ENTITLEMENT_KEY_LICENSE_CODE] = normalizeLicenseCodeInput(licenseCode);
  }
  if (typeof purchaseEmail === 'string') {
    patch[ENTITLEMENT_KEY_PURCHASE_EMAIL] = purchaseEmail.trim();
  }
  if (!Object.keys(patch).length) return;
  await Promise.all([
    setStorageArea('local', patch),
    setStorageArea('sync', patch)
  ]);
}

async function clearProEntitlement() {
  const patch = { [ENTITLEMENT_KEY_PRO_PURCHASED]: false };
  await Promise.all([
    setStorageArea('local', patch),
    setStorageArea('sync', patch)
  ]);
}

async function shouldShowUpgradeForBeta() {
  const localValues = await getStorageArea('local', [DEV_FORCE_SHOW_UPGRADE_FOR_BETA]);
  return !!localValues[DEV_FORCE_SHOW_UPGRADE_FOR_BETA];
}

async function shouldDisableBetaForCheckoutTest() {
  const localValues = await getStorageArea('local', [DEV_DISABLE_BETA_FOR_CHECKOUT_TEST]);
  return !!localValues[DEV_DISABLE_BETA_FOR_CHECKOUT_TEST];
}

function setUpgradeButtonText(label) {
  const button = document.getElementById('upgrade-btn');
  if (button) {
    button.textContent = label;
  }
}

function setRestoreMessage(message = '', isError = false) {
  const restoreMessageEl = document.getElementById('restore-message');
  if (!restoreMessageEl) return;
  restoreMessageEl.textContent = message;
  restoreMessageEl.classList.toggle('error', !!isError);
}

function showToast(message) {
  const toastEl = document.getElementById('toast');
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add('visible');
  if (toastTimerId) {
    clearTimeout(toastTimerId);
  }
  toastTimerId = setTimeout(() => {
    toastEl.classList.remove('visible');
  }, 1800);
}

function updateLicenseUi({ isPro = false, licenseCode = currentLicenseCode, showRestore = false } = {}) {
  currentLicenseCode = normalizeLicenseCodeInput(licenseCode || currentLicenseCode);
  const licenseCodeCard = document.getElementById('license-code-card');
  const licenseCodeValue = document.getElementById('license-code-value');
  const restoreCard = document.getElementById('restore-card');
  const restoreLicenseInput = document.getElementById('restore-license');

  if (licenseCodeValue) {
    licenseCodeValue.textContent = currentLicenseCode || '未取得';
  }
  if (restoreLicenseInput && currentLicenseCode && !restoreLicenseInput.value) {
    restoreLicenseInput.value = currentLicenseCode;
  }
  if (licenseCodeCard) {
    licenseCodeCard.style.display = isPro && currentLicenseCode ? 'block' : 'none';
  }
  if (restoreCard) {
    restoreCard.style.display = showRestore ? 'block' : 'none';
  }
}

async function hydrateRecoveryUi() {
  const recoveryState = await getRecoveryState();
  currentLicenseCode = recoveryState.licenseCode;
  const restoreEmailInput = document.getElementById('restore-email');
  const restoreLicenseInput = document.getElementById('restore-license');
  if (restoreEmailInput && recoveryState.purchaseEmail) {
    restoreEmailInput.value = recoveryState.purchaseEmail;
  }
  if (restoreLicenseInput && recoveryState.licenseCode) {
    restoreLicenseInput.value = recoveryState.licenseCode;
  }
  updateLicenseUi({ isPro: false, licenseCode: recoveryState.licenseCode, showRestore: true });
}

function updateUI(state, infoText = '', options = {}) {
  const statusEl = document.getElementById('license-status');
  const btn = document.getElementById('upgrade-btn');
  const showUpgradeForBeta = !!options.showUpgradeForBeta;

  if (state === 'pro') {
    statusEl.innerHTML = '<span style="color:#38f9d7; font-weight:bold;">Pro版をご利用中です</span>';
    btn.style.display = 'none';
    updateLicenseUi({ isPro: true, showRestore: false });
    return;
  }

  btn.style.display = 'block';

  if (state === 'beta') {
    statusEl.innerHTML = `<span style="color:#fbbf24;">ベータ特典で無制限です${infoText ? ` (${infoText})` : ''}</span>`;
    btn.style.display = showUpgradeForBeta ? 'block' : 'none';
    if (showUpgradeForBeta) {
      setUpgradeButtonText('Pro版を購入して確認');
    }
    updateLicenseUi({ isPro: false, showRestore: false });
    return;
  }

  statusEl.innerHTML = infoText ? `<span style="color:#e2e8f0;">現在のプラン: 無料版 ${infoText}</span>` : '現在のプラン: 無料版';
  setUpgradeButtonText('✨ Pro版にアップグレード');
  updateLicenseUi({ isPro: false, showRestore: true });
}

async function checkStatus() {
  const fp = await getDeviceFingerprint();
  const entitlement = await getEntitlementState();
  const showUpgradeForBeta = await shouldShowUpgradeForBeta();
  const disableBetaForCheckoutTest = await shouldDisableBetaForCheckoutTest();

  try {
    const response = await fetch(`${API_BASE_URL}/verify-device`, {
      method: "POST",
      headers: buildLicenseApiHeaders(),
      body: JSON.stringify({ device_fingerprint: fp })
    });
    const data = await response.json();

    if (data.ok && data.is_pro) {
      await persistProEntitlement();
      if (data.license_code) {
        await persistRecoveryState({ licenseCode: data.license_code });
        updateLicenseUi({ isPro: true, licenseCode: data.license_code });
      }
      updateUI('pro');
      return;
    }

    if (entitlement.isProPurchased) {
      await clearProEntitlement();
    }
  } catch (err) {
    console.error(err);
    if (entitlement.isProPurchased) {
      updateUI('pro', '(通信エラー)');
      return;
    }
    if (entitlement.isBetaGrandfathered && !disableBetaForCheckoutTest) {
      updateUI('beta', '通信なしでも利用可能', { showUpgradeForBeta });
      return;
    }
    updateUI('free', '(通信エラー)');
    return;
  }

  if (entitlement.isBetaGrandfathered && !disableBetaForCheckoutTest) {
    updateUI('beta', showUpgradeForBeta ? '開発確認用に購入導線を表示中' : '', { showUpgradeForBeta });
    return;
  }

  chrome.storage.local.get(null, (all) => {
    let count = 0;
    for (const k in all) {
      if (k.startsWith('video_memo_comments_')) {
        try {
          const parsed = JSON.parse(all[k]);
          if (Array.isArray(parsed)) count += parsed.length;
        } catch (e) {}
      }
    }
    const remaining = Math.max(0, 50 - count);
    updateUI('free', `(残り ${remaining} 件)`);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  hydrateRecoveryUi();
  checkStatus();

  document.getElementById('copy-license-btn')?.addEventListener('click', async () => {
    if (!currentLicenseCode) return;
    try {
      await navigator.clipboard.writeText(currentLicenseCode);
      showToast('ライセンスコードをコピーしました');
    } catch (_) {
      setRestoreMessage('コピーに失敗しました。手動で控えてください。', true);
    }
  });

  document.getElementById('restore-btn')?.addEventListener('click', async () => {
    const restoreBtn = document.getElementById('restore-btn');
    const restoreEmailInput = document.getElementById('restore-email');
    const restoreLicenseInput = document.getElementById('restore-license');
    const email = String(restoreEmailInput?.value || '').trim();
    const licenseCode = normalizeLicenseCodeInput(restoreLicenseInput?.value || '');
    if (!email || !licenseCode) {
      setRestoreMessage('メールアドレスとライセンスコードを入力してください。', true);
      return;
    }

    restoreBtn.disabled = true;
    setRestoreMessage('復元を確認中です...');
    try {
      const fp = await getDeviceFingerprint();
      const response = await fetch(`${API_BASE_URL}/activate`, {
        method: "POST",
        headers: buildLicenseApiHeaders(),
        body: JSON.stringify({
          email,
          license_code: licenseCode,
          device_fingerprint: fp,
          app_version: chrome.runtime.getManifest().version
        })
      });
      const data = await response.json();
      if (response.ok && data.ok && data.entitlement?.is_pro) {
        await persistProEntitlement();
        await persistRecoveryState({
          licenseCode: data.license_code || licenseCode,
          purchaseEmail: email
        });
        updateLicenseUi({ isPro: true, licenseCode: data.license_code || licenseCode });
        setRestoreMessage('Pro をこのデバイスに復元しました。');
        updateUI('pro');
        return;
      }

      const messageMap = {
        invalid_payload: '入力内容を確認してください。',
        license_not_found: 'ライセンスコードが見つかりません。',
        email_mismatch: '購入時メールアドレスが一致しません。',
        license_not_active: 'このライセンスは現在利用できません。'
      };
      setRestoreMessage(messageMap[data.error] || 'Pro の復元に失敗しました。', true);
    } catch (err) {
      setRestoreMessage(`通信エラーが発生しました${err && err.message ? `: ${err.message}` : ''}`, true);
    } finally {
      restoreBtn.disabled = false;
    }
  });

  const upgradeBtn = document.getElementById('upgrade-btn');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', async () => {
      upgradeBtn.disabled = true;
      upgradeBtn.textContent = '準備中...';

      try {
        const fp = await getDeviceFingerprint();
        const checkoutState = generateCheckoutState();
        await sendRuntimeMessage({ type: 'registerCheckoutState', checkoutState });
        const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
          method: "POST",
          headers: buildLicenseApiHeaders(),
          body: JSON.stringify({ device_fingerprint: fp, checkout_state: checkoutState })
        });
        const data = await response.json();

        if (data.ok && data.url) {
          const width = 500;
          const height = 700;
          const left = Math.round((window.screen.width - width) / 2);
          const top = Math.round((window.screen.height - height) / 2);
          const popup = window.open(data.url, 'stripe_checkout_popup', `width=${width},height=${height},left=${left},top=${top},status=no,location=no,menubar=no,toolbar=no`);

          let attempts = 0;
          const pollOnce = async () => {
            attempts++;

            const currentFp = await getDeviceFingerprint();
            try {
              const verifyRes = await fetch(`${API_BASE_URL}/verify-device`, {
                method: "POST",
                headers: buildLicenseApiHeaders(),
                body: JSON.stringify({ device_fingerprint: currentFp })
              });
              const vData = await verifyRes.json();

              if (vData.ok && vData.is_pro) {
                clearInterval(pollInterval);
                if (popup && !popup.closed) {
                  popup.close();
                }
                await persistProEntitlement();
                if (vData.license_code) {
                  await persistRecoveryState({ licenseCode: vData.license_code });
                  updateLicenseUi({ isPro: true, licenseCode: vData.license_code });
                }
                updateUI('pro');
                return true;
              }
            } catch (e) {}

            if (attempts >= CHECKOUT_POLL_MAX_ATTEMPTS || (popup && popup.closed)) {
              clearInterval(pollInterval);
              sendRuntimeMessage({ type: 'unregisterCheckoutState', checkoutState }).catch(() => {});
              upgradeBtn.disabled = false;
              checkStatus();
            }
            return false;
          };
          const pollInterval = setInterval(pollOnce, CHECKOUT_POLL_INTERVAL_MS);
          await pollOnce();
        } else {
          sendRuntimeMessage({ type: 'unregisterCheckoutState', checkoutState }).catch(() => {});
          alert("エラーが発生しました: " + (data.message || data.error || "不明なエラー"));
          upgradeBtn.disabled = false;
          checkStatus();
        }
      } catch (err) {
        alert(`通信エラーが発生しました${err && err.message ? `: ${err.message}` : ''}`);
        upgradeBtn.disabled = false;
        checkStatus();
      }
    });
  }

  const closeBtn = document.getElementById('close-tab-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      chrome.tabs.getCurrent((tab) => {
        if (tab) {
          chrome.tabs.remove(tab.id);
        } else {
          window.close();
        }
      });
    });
  }
});
