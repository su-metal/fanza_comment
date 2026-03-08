const API_BASE_URL = "https://wzinimxikcihdqqdvppa.supabase.co/functions/v1/license-api";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_qBIjjA5UN3H62B8dWdqo0w_PRTqVZCq";
const BETA_PERIOD_END_ISO = '2026-04-02T14:59:59.000Z'; // 2026-04-02 23:59:59 JST
const ENTITLEMENT_KEY_FIRST_SEEN_AT = 'fanza_memo_first_seen_at';
const ENTITLEMENT_KEY_BETA_GRANDFATHERED = 'fanza_memo_is_beta_grandfathered';
const ENTITLEMENT_KEY_PRO_PURCHASED = 'fanza_memo_is_pro_purchased';
const DEV_FORCE_SHOW_UPGRADE_FOR_BETA = 'fanza_memo_force_show_upgrade_for_beta';
const DEV_DISABLE_BETA_FOR_CHECKOUT_TEST = 'fanza_memo_disable_beta_for_checkout_test';
const ENTITLEMENT_KEYS = [
  ENTITLEMENT_KEY_FIRST_SEEN_AT,
  ENTITLEMENT_KEY_BETA_GRANDFATHERED,
  ENTITLEMENT_KEY_PRO_PURCHASED
];

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

function updateUI(state, infoText = '', options = {}) {
  const statusEl = document.getElementById('license-status');
  const actionContainer = document.getElementById('action-container');
  const limitsInfoEl = document.getElementById('limits-info');
  const showUpgradeForBeta = !!options.showUpgradeForBeta;

  if (state === 'pro') {
    statusEl.innerHTML = '<span style="color:#e1306c; font-weight:bold;">Pro (購入済み / 無制限)</span>';
    actionContainer.style.display = 'none';
    limitsInfoEl.textContent = infoText || '';
    return;
  }

  if (state === 'beta') {
    statusEl.innerHTML = '<span style="color:#d97706; font-weight:bold;">ベータ特典 (無制限)</span>';
    actionContainer.style.display = showUpgradeForBeta ? 'block' : 'none';
    limitsInfoEl.textContent = infoText || (showUpgradeForBeta ? '開発確認用に購入導線を表示中' : '期限内の初回利用ユーザー');
    if (showUpgradeForBeta) {
      setUpgradeButtonText('Pro版を購入して確認');
    }
    return;
  }

  statusEl.innerHTML = '<span style="color:#444;">無料版</span>';
  actionContainer.style.display = 'block';
  limitsInfoEl.textContent = infoText;
  setUpgradeButtonText('✨ Pro版にアップグレード');
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
      updateUI('beta', '通信なしでも無制限', { showUpgradeForBeta });
      return;
    }
    updateUI('free', '(通信エラー)');
    return;
  }

  if (entitlement.isBetaGrandfathered && !disableBetaForCheckoutTest) {
    updateUI('beta', '', { showUpgradeForBeta });
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
  checkStatus();

  document.getElementById('upgrade-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('upgrade-btn');
    btn.disabled = true;
    btn.textContent = '準備中...';

    try {
      const fp = await getDeviceFingerprint();
      const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
        method: "POST",
        headers: buildLicenseApiHeaders(),
        body: JSON.stringify({ device_fingerprint: fp })
      });
      const data = await response.json();

      if (data.ok && data.url) {
        const width = 500;
        const height = 700;
        const left = Math.round((window.screen.width - width) / 2);
        const top = Math.round((window.screen.height - height) / 2);
        const popup = window.open(data.url, 'stripe_checkout_popup', `width=${width},height=${height},left=${left},top=${top},status=no,location=no,menubar=no,toolbar=no`);

        let attempts = 0;
        const maxAttempts = 60;
        const pollInterval = setInterval(async () => {
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
              updateUI('pro');
              return;
            }
          } catch (e) {}

          if (attempts >= maxAttempts || (popup && popup.closed)) {
            clearInterval(pollInterval);
            btn.disabled = false;
            checkStatus();
          }
        }, 5000);
      } else {
        alert("エラーが発生しました: " + (data.message || data.error || "不明なエラー"));
        btn.disabled = false;
        checkStatus();
      }
    } catch (err) {
      alert(`通信エラーが発生しました${err && err.message ? `: ${err.message}` : ''}`);
      btn.disabled = false;
      checkStatus();
    }
  });
});
