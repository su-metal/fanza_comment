const API_BASE_URL = "https://asia-northeast1-fanza-comment-lic-20260303.cloudfunctions.net/licenseApi";
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
const t = window.extI18n?.t || ((key, _subs, fallback = '') => fallback || key);
let currentLicenseCode = '';
let toastTimerId = null;

function setStatusHtml(element, color, message, bold = true) {
  if (!element) return;
  const fontWeight = bold ? 'bold' : 'normal';
  element.innerHTML = `<span style="color:${color}; font-weight:${fontWeight};">${message}</span>`;
}

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
  };
}

function getRuntimeLocaleForCheckout() {
  return window.extI18n?.getLocale?.() === 'ja' ? 'ja' : 'en';
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
    licenseCodeValue.textContent = currentLicenseCode || t('licenseCodeUnavailable', undefined, 'Unavailable');
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
    setStatusHtml(statusEl, '#38f9d7', t('statusProActive', undefined, 'Pro is active'));
    btn.style.display = 'none';
    updateLicenseUi({ isPro: true, showRestore: false });
    return;
  }

  btn.style.display = 'block';

  if (state === 'beta') {
    setStatusHtml(
      statusEl,
      '#fbbf24',
      infoText
        ? t('statusBetaUnlimitedWithInfo', [infoText], `Unlimited with beta perk (${infoText})`)
        : t('statusBetaUnlimitedSimple', undefined, 'Unlimited with beta perk')
    );
    btn.style.display = showUpgradeForBeta ? 'block' : 'none';
    if (showUpgradeForBeta) {
      setUpgradeButtonText(t('upgradeButtonVerify', undefined, 'Buy Pro and verify'));
    }
    updateLicenseUi({ isPro: false, showRestore: false });
    return;
  }

  setStatusHtml(
    statusEl,
    '#e2e8f0',
    infoText
      ? t('statusFreeWithInfo', [infoText], `Current plan: Free ${infoText}`)
      : t('statusFreeSimple', undefined, 'Current plan: Free'),
    false
  );
  setUpgradeButtonText(t('upgradeButton', undefined, 'Upgrade to Pro'));
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
      updateUI('pro', t('infoNetworkError', undefined, '(Network error)'));
      return;
    }
    if (entitlement.isBetaGrandfathered && !disableBetaForCheckoutTest) {
      updateUI('beta', t('infoOfflineAvailable', undefined, 'Still available while offline'), { showUpgradeForBeta });
      return;
    }
    updateUI('free', t('infoNetworkError', undefined, '(Network error)'));
    return;
  }

  if (entitlement.isBetaGrandfathered && !disableBetaForCheckoutTest) {
    updateUI('beta', showUpgradeForBeta ? t('infoDevShowUpgrade', undefined, 'Purchase CTA shown for development checks') : '', { showUpgradeForBeta });
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
    updateUI('free', t('infoRemainingCount', [String(remaining)], `(${remaining} left)`));
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await window.extI18n?.apply(document);
  hydrateRecoveryUi();
  checkStatus();

  document.getElementById('copy-license-btn')?.addEventListener('click', async () => {
    if (!currentLicenseCode) return;
    try {
      await navigator.clipboard.writeText(currentLicenseCode);
      showToast(t('copyLicenseSuccess', undefined, 'License code copied'));
    } catch (_) {
      setRestoreMessage(t('copyLicenseFailure', undefined, 'Copy failed. Please save it manually.'), true);
    }
  });

  document.getElementById('restore-btn')?.addEventListener('click', async () => {
    const restoreBtn = document.getElementById('restore-btn');
    const restoreEmailInput = document.getElementById('restore-email');
    const restoreLicenseInput = document.getElementById('restore-license');
    const email = String(restoreEmailInput?.value || '').trim();
    const licenseCode = normalizeLicenseCodeInput(restoreLicenseInput?.value || '');
    if (!email || !licenseCode) {
      setRestoreMessage(t('restoreMissingFields', undefined, 'Enter both your email address and license code.'), true);
      return;
    }

    restoreBtn.disabled = true;
    setRestoreMessage(t('restoreChecking', undefined, 'Checking your restore request...'));
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
        setRestoreMessage(t('restoreSuccess', undefined, 'Pro has been restored on this device.'));
        updateUI('pro');
        return;
      }

      const messageMap = {
        invalid_payload: t('restoreInvalidPayload', undefined, 'Check the entered values.'),
        license_not_found: t('restoreLicenseNotFound', undefined, 'License code not found.'),
        email_mismatch: t('restoreEmailMismatch', undefined, 'The email address does not match the purchase.'),
        license_not_active: t('restoreLicenseNotActive', undefined, 'This license is not currently active.')
      };
      setRestoreMessage(messageMap[data.error] || t('restoreFailed', undefined, 'Failed to restore Pro.'), true);
    } catch (err) {
      setRestoreMessage(
        err && err.message
          ? t('networkErrorWithMessage', [err.message], `A network error occurred: ${err.message}`)
          : t('networkErrorSimple', undefined, 'A network error occurred.'),
        true
      );
    } finally {
      restoreBtn.disabled = false;
    }
  });

  const upgradeBtn = document.getElementById('upgrade-btn');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', async () => {
      upgradeBtn.disabled = true;
      upgradeBtn.textContent = t('upgradeButtonPreparing', undefined, 'Preparing...');

      try {
        const fp = await getDeviceFingerprint();
        const checkoutState = generateCheckoutState();
        await sendRuntimeMessage({ type: 'registerCheckoutState', checkoutState });
        const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
          method: "POST",
          headers: buildLicenseApiHeaders(),
          body: JSON.stringify({
            device_fingerprint: fp,
            checkout_state: checkoutState,
            runtime_locale: getRuntimeLocaleForCheckout()
          })
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
          alert(
            t(
              'genericErrorWithDetail',
              [data.message || data.error || t('unknownError', undefined, 'Unknown error')],
              `An error occurred: ${data.message || data.error || 'Unknown error'}`
            )
          );
        upgradeBtn.disabled = false;
        checkStatus();
      }
    } catch (err) {
      alert(
        err && err.message
          ? t('networkErrorWithMessage', [err.message], `A network error occurred: ${err.message}`)
          : t('networkErrorSimple', undefined, 'A network error occurred.')
      );
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
