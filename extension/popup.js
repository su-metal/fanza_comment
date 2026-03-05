const API_BASE_URL = "https://wzinimxikcihdqqdvppa.supabase.co/functions/v1/license-api";

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

function updateUI(isPro, infoText = '') {
  const statusEl = document.getElementById('license-status');
  const actionContainer = document.getElementById('action-container');
  const limitsInfoEl = document.getElementById('limits-info');

  if (isPro) {
    statusEl.innerHTML = '<span style="color:#e1306c; font-weight:bold;">Pro (無制限)</span>';
    actionContainer.style.display = 'none';
    if (infoText) limitsInfoEl.textContent = infoText;
  } else {
    statusEl.innerHTML = '<span style="color:#444;">無料版</span>';
    actionContainer.style.display = 'block';
    if (infoText) limitsInfoEl.textContent = infoText;
  }
}

async function checkStatus() {
  const fp = await getDeviceFingerprint();

  chrome.storage.local.get(['fanza_memo_is_pro_purchased'], async (res) => {
    if (res.fanza_memo_is_pro_purchased) {
       updateUI(true);
       return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/verify-device`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_fingerprint: fp })
      });
      const data = await response.json();
      
      if (data.ok && data.is_pro) {
        chrome.storage.local.set({ fanza_memo_is_pro_purchased: true }, () => {
          updateUI(true);
        });
      } else {
        // Estimate free slots
        chrome.storage.local.get(null, (all) => {
          let count = 0;
          for (const k in all) {
            if (k.startsWith('video_memo_comments_')) {
              try {
                const parsed = JSON.parse(all[k]);
                if (Array.isArray(parsed)) count += parsed.length;
              } catch(e) {}
            }
          }
          const remaining = Math.max(0, 50 - count);
          updateUI(false, `(残り ${remaining} 件)`);
        });
      }
    } catch (err) {
      console.error(err);
      updateUI(false, '(通信エラー)');
    }
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_fingerprint: fp })
      });
      const data = await response.json();
      
      if (data.ok && data.url) {
        const width = 500;
        const height = 700;
        const left = Math.round((window.screen.width - width) / 2);
        const top = Math.round((window.screen.height - height) / 2);
        const popup = window.open(data.url, 'stripe_checkout_popup', `width=${width},height=${height},left=${left},top=${top},status=no,location=no,menubar=no,toolbar=no`);
        
        // 決済状態をポーリング監視 (最大5分間)
        let attempts = 0;
        const maxAttempts = 60; // 5秒 * 60 = 5分
        const pollInterval = setInterval(async () => {
          attempts++;
          
          const fp = await getDeviceFingerprint();
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/verify-device`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ device_fingerprint: fp })
            });
            const vData = await verifyRes.json();
            
            if (vData.ok && vData.is_pro) {
              clearInterval(pollInterval);
              if (popup && !popup.closed) {
                popup.close();
              }
              chrome.storage.local.set({ fanza_memo_is_pro_purchased: true }, () => {
                updateUI(true);
              });
            }
          } catch(e) {}
          
          if (attempts >= maxAttempts || (popup && popup.closed)) {
            clearInterval(pollInterval);
            btn.disabled = false;
            btn.textContent = 'Pro版にアップグレード (500円)';
          }
        }, 5000);
      } else {
        alert("エラーが発生しました: " + (data.error || "不明なエラー"));
        btn.disabled = false;
        btn.textContent = 'Pro版にアップグレード (500円)';
      }
    } catch(err) {
      alert("通信エラーが発生しました");
      btn.disabled = false;
      btn.textContent = 'Pro版にアップグレード (500円)';
    }
  });
});
