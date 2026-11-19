if (window.location.protocol === 'chrome-extension:' || window.__zenFocusLoaded) {
  // Do not run on extension pages (e.g., blocked.html), and never inject twice into the same tab
} else {
  window.__zenFocusLoaded = true;
  function isSiteBlocked(blockedSites, hostname) {
    return blockedSites.some((site) => {
      const cleanSite = site.replace(/^(https?:\/\/)?(www\.)?/, '').toLowerCase();
      return hostname.toLowerCase().includes(cleanSite);
    });
  }

  function showBlockPage(s) {
    const bg = s ? `linear-gradient(135deg, ${s.bgColor1} 0%, ${s.bgColor2} 30%, ${s.bgColor3} 60%, ${s.bgColor4} 100%)` : 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 30%, #ddd6fe 60%, #fce7f3 100%)';
    const tc = (s && s.textColor) || '#4c1d95';
    const stc = (s && s.subTextColor) || '#6b21a8';
    const ac = (s && s.accentColor) || '#a78bfa';
    const mt = (s && s.mainText) || 'Time to focus.';
    const st = (s && s.subText) || 'Take a deep breath.';
    const pulse = !s || s.pulseEnabled !== false;

    window.stop();
    document.open();
    document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZenFocus - Site Blocked</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { overflow: hidden; }
    .zen-focus-block-screen {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: ${bg};
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      z-index: 999999;
    }
    .pulse-circle {
      position: absolute; width: 300px; height: 300px; border-radius: 50%;
      display: ${pulse ? 'block' : 'none'};
      background: radial-gradient(circle, ${ac}40 0%, ${ac}20 50%, transparent 100%);
      box-shadow: 0 0 80px ${ac}30, 0 0 140px ${ac}20, inset 0 0 60px ${ac}15;
      animation: pulse-animation 3s ease-in-out infinite;
    }
    @keyframes pulse-animation {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.15); opacity: 0.9; }
    }
    .content-wrapper { position: relative; z-index: 10; text-align: center; max-width: 600px; padding: 40px; }
    .main-text {
      font-size: 48px; font-weight: 300; color: ${tc}; margin-bottom: 20px;
      letter-spacing: -0.5px; line-height: 1.3; animation: fade-in 1s ease-out;
    }
    .sub-text {
      font-size: 24px; font-weight: 300; color: ${stc}; margin-bottom: 60px;
      letter-spacing: 0.5px; animation: fade-in 1.5s ease-out;
    }
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .back-button {
      display: inline-flex; align-items: center; gap: 12px; padding: 16px 40px;
      background: linear-gradient(135deg, ${ac} 0%, ${ac}cc 100%);
      backdrop-filter: blur(10px); border: 2px solid ${ac}50;
      border-radius: 50px; color: #ffffff; font-size: 18px; font-weight: 500;
      cursor: pointer; transition: all 0.3s ease;
      box-shadow: 0 4px 20px ${ac}40; animation: fade-in 2s ease-out;
    }
    .back-button:hover {
      filter: brightness(0.9); transform: translateY(-2px);
      box-shadow: 0 6px 30px ${ac}50;
    }
    .back-button:active { transform: translateY(0); }
    .back-icon { width: 24px; height: 24px; transition: transform 0.3s ease; }
    .back-button:hover .back-icon { transform: translateX(-4px); }
    @media (max-width: 768px) {
      .pulse-circle { width: 200px; height: 200px; }
      .main-text { font-size: 32px; }
      .sub-text { font-size: 18px; margin-bottom: 40px; }
      .back-button { padding: 14px 32px; font-size: 16px; }
    }
  </style>
</head>
<body>
  <div class="zen-focus-block-screen">
    <div class="pulse-circle"></div>
    <div class="content-wrapper">
      <h1 class="main-text">${mt}</h1>
      <p class="sub-text">${st}</p>
      <button class="back-button" onclick="window.history.back()">
        <svg class="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Go Back
      </button>
    </div>
  </div>
</body>
</html>`);
    document.close();
  }

  function blockSite() {
    chrome.storage.local.get(['blockedSites', 'focusMode', 'blockPageSettings'], (result) => {
      const blockedSites = result.blockedSites || [];
      const focusMode = result.focusMode || false;
      const currentUrl = window.location.hostname;

      if (!focusMode) return;

      if (isSiteBlocked(blockedSites, currentUrl)) {
        showBlockPage(result.blockPageSettings || null);
      }
    });
  }

  // Run immediately at document_start
  blockSite();

  // Listen for real-time storage changes (e.g., focus mode toggled while on a blocked site)
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && (changes.blockedSites || changes.focusMode)) {
      blockSite();
    }
  });
}
