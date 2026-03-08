chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: "onboarding.html" });
  }
});

const CHECKOUT_STATE_KEY = "fanza_memo_active_checkout_states";
const CHECKOUT_STATE_TTL_MS = 10 * 60 * 1000;

function getActiveCheckoutStates() {
  return new Promise((resolve) => {
    chrome.storage.session.get([CHECKOUT_STATE_KEY], (result) => {
      resolve(result[CHECKOUT_STATE_KEY] || {});
    });
  });
}

function setActiveCheckoutStates(states) {
  return new Promise((resolve) => {
    chrome.storage.session.set({ [CHECKOUT_STATE_KEY]: states }, () => resolve());
  });
}

async function registerCheckoutState(checkoutState) {
  if (!checkoutState) return;
  const states = await getActiveCheckoutStates();
  states[checkoutState] = Date.now();
  await setActiveCheckoutStates(states);
}

async function unregisterCheckoutState(checkoutState) {
  if (!checkoutState) return;
  const states = await getActiveCheckoutStates();
  delete states[checkoutState];
  await setActiveCheckoutStates(states);
}

async function isTrackedCheckoutState(checkoutState) {
  if (!checkoutState) return false;
  const states = await getActiveCheckoutStates();
  const createdAt = Number(states[checkoutState] || 0);
  if (!createdAt) return false;
  if (Date.now() - createdAt > CHECKOUT_STATE_TTL_MS) {
    delete states[checkoutState];
    await setActiveCheckoutStates(states);
    return false;
  }
  return true;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "registerCheckoutState") {
    registerCheckoutState(String(message.checkoutState || ""))
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: String(error?.message || error) }));
    return true;
  }

  if (message?.type === "unregisterCheckoutState") {
    unregisterCheckoutState(String(message.checkoutState || ""))
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: String(error?.message || error) }));
    return true;
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const currentUrl = changeInfo.url || tab.url;
  if (!currentUrl) return;

  let parsed;
  try {
    parsed = new URL(currentUrl);
  } catch (_) {
    return;
  }

  const checkoutResult = parsed.searchParams.get("fanza_checkout");
  const checkoutState = parsed.searchParams.get("checkout_state");
  if (!checkoutResult || !checkoutState) return;

  isTrackedCheckoutState(checkoutState).then(async (isTracked) => {
    if (!isTracked) return;
    await unregisterCheckoutState(checkoutState);
    chrome.tabs.remove(tabId, () => void chrome.runtime.lastError);
  });
});
