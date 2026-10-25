(function initExtensionI18n(global) {
  const RUNTIME_LOCALE_JA = 'ja';
  const RUNTIME_LOCALE_EN = 'en';
  const DEV_FORCE_LOCALE_STORAGE_KEY = 'fanza_memo_dev_force_locale';
  let loadedMessages = null;
  let activeLocale = RUNTIME_LOCALE_EN;

  function getForcedLocaleFromChromeStorage() {
    return new Promise((resolve) => {
      try {
        chrome?.storage?.local?.get?.([DEV_FORCE_LOCALE_STORAGE_KEY], (result) => {
          if (chrome.runtime?.lastError) {
            resolve(null);
            return;
          }
          const value = result?.[DEV_FORCE_LOCALE_STORAGE_KEY];
          resolve(value === RUNTIME_LOCALE_JA || value === RUNTIME_LOCALE_EN ? value : null);
        });
      } catch (_) {
        resolve(null);
      }
    });
  }

  function setForcedLocaleInChromeStorage(locale) {
    return new Promise((resolve) => {
      try {
        chrome?.storage?.local?.set?.({ [DEV_FORCE_LOCALE_STORAGE_KEY]: locale }, () => resolve());
      } catch (_) {
        resolve();
      }
    });
  }

  function clearForcedLocaleInChromeStorage() {
    return new Promise((resolve) => {
      try {
        chrome?.storage?.local?.remove?.([DEV_FORCE_LOCALE_STORAGE_KEY], () => resolve());
      } catch (_) {
        resolve();
      }
    });
  }

  function normalizeSubstitutions(substitutions) {
    if (substitutions === undefined || substitutions === null) return [];
    return Array.isArray(substitutions) ? substitutions : [substitutions];
  }

  function isJapanLocale(locale) {
    const normalized = String(locale || '').trim().toLowerCase();
    return normalized.startsWith('ja') || normalized.endsWith('-jp');
  }

  function isJapanTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Tokyo';
    } catch (_) {
      return false;
    }
  }

  async function resolveRuntimeLocale() {
    const forcedLocale = await getForcedLocaleFromChromeStorage();
    if (forcedLocale === RUNTIME_LOCALE_JA || forcedLocale === RUNTIME_LOCALE_EN) {
      return forcedLocale;
    }

    return isJapanTimezone() ? RUNTIME_LOCALE_JA : RUNTIME_LOCALE_EN;
  }

  function substituteMessage(template, substitutions) {
    const values = normalizeSubstitutions(substitutions);
    const message = String(template || '');
    if (values.length === 0) return message;
    return message.replace(/\$(\d)/g, (_, indexText) => {
      const index = Number(indexText) - 1;
      return values[index] !== undefined ? String(values[index]) : '';
    });
  }

  async function loadLocaleMessages(locale) {
    const response = await fetch(chrome.runtime.getURL(`_locales/${locale}/messages.json`));
    if (!response.ok) {
      throw new Error(`Failed to load locale messages: ${locale}`);
    }
    return response.json();
  }

  const ready = (async () => {
    activeLocale = await resolveRuntimeLocale();
    loadedMessages = await loadLocaleMessages(activeLocale);
    return loadedMessages;
  })().catch((error) => {
    console.error('Failed to initialize extension i18n', error);
    activeLocale = RUNTIME_LOCALE_EN;
    loadedMessages = null;
    return null;
  });

  function t(key, substitutions, fallback = '') {
    const runtimeMessage = loadedMessages?.[key]?.message;
    if (runtimeMessage) {
      return substituteMessage(runtimeMessage, substitutions);
    }

    const chromeMessage = chrome?.i18n?.getMessage?.(key, normalizeSubstitutions(substitutions));
    return chromeMessage || fallback || key;
  }

  async function apply(root = document) {
    await ready;

    root.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n, undefined, el.textContent);
    });

    root.querySelectorAll('[data-i18n-html]').forEach((el) => {
      el.innerHTML = t(el.dataset.i18nHtml, undefined, el.innerHTML);
    });

    root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder, undefined, el.getAttribute('placeholder') || ''));
    });

    root.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.setAttribute('title', t(el.dataset.i18nTitle, undefined, el.getAttribute('title') || ''));
    });

    root.querySelectorAll('[data-i18n-value]').forEach((el) => {
      el.setAttribute('value', t(el.dataset.i18nValue, undefined, el.getAttribute('value') || ''));
    });

    document.documentElement.lang = activeLocale;
  }

  global.extI18n = {
    ready,
    t,
    apply,
    getLocale() {
      return activeLocale;
    },
    async forceLocale(locale) {
      if (locale !== RUNTIME_LOCALE_JA && locale !== RUNTIME_LOCALE_EN) return;
      await setForcedLocaleInChromeStorage(locale);
    },
    async clearForcedLocale() {
      await clearForcedLocaleInChromeStorage();
    }
  };
})(window);
