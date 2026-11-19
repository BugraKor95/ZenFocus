import { buildBlockRules, originPatterns } from './lib/sites.js';

chrome.runtime.onInstalled.addListener(() => {
  console.log('ZenFocus extension installed');
  
  chrome.storage.local.get(['blockedSites', 'focusMode', 'blockPageSettings'], (result) => {
    if (!result.blockedSites) {
      chrome.storage.local.set({ blockedSites: [] });
    }
    if (result.focusMode === undefined) {
      chrome.storage.local.set({ focusMode: false });
    }
    if (!result.blockPageSettings) {
      chrome.storage.local.set({ blockPageSettings: {
        mainText: 'Şu an odaklanma zamanı.',
        subText: 'Derin bir nefes al.',
        bgColor1: '#f8fafc',
        bgColor2: '#e0e7ff',
        bgColor3: '#ddd6fe',
        bgColor4: '#fce7f3',
        textColor: '#4c1d95',
        subTextColor: '#6b21a8',
        accentColor: '#a78bfa',
        pulseEnabled: true,
      }});
    }
    syncAll();
  });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && (changes.blockedSites || changes.focusMode)) {
    syncAll();
  }
});

// Access granted or revoked from the popup (or Chrome's extension settings).
chrome.permissions.onAdded.addListener(syncAll);
chrome.permissions.onRemoved.addListener(syncAll);

// Registered scripts persist across restarts, but re-sync keeps them consistent after updates.
chrome.runtime.onStartup.addListener(syncAll);

const CONTENT_SCRIPT_ID = 'zenfocus-block';

function updateBlockRules() {
  chrome.storage.local.get(['blockedSites', 'focusMode'], (result) => {
    const rules = buildBlockRules(result.blockedSites, result.focusMode);

    chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRules.map((rule) => rule.id),
        addRules: rules,
      });
    });
  });
}

// The content script is injected only on sites the user blocked AND granted access to.
async function syncContentScript() {
  const { blockedSites = [], focusMode = false } = await chrome.storage.local.get(['blockedSites', 'focusMode']);
  const wanted = focusMode ? originPatterns(blockedSites) : [];

  const granted = [];
  for (const origin of wanted) {
    if (await chrome.permissions.contains({ origins: [origin] })) granted.push(origin);
  }

  const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [CONTENT_SCRIPT_ID] });
  if (existing.length) await chrome.scripting.unregisterContentScripts({ ids: [CONTENT_SCRIPT_ID] });
  if (!granted.length) return;

  await chrome.scripting.registerContentScripts([{
    id: CONTENT_SCRIPT_ID,
    matches: granted,
    js: ['content.js'],
    runAt: 'document_start',
  }]);

  // Tabs that are already open do not get registered scripts until they navigate; inject now.
  const tabs = await chrome.tabs.query({ url: granted });
  for (const tab of tabs) {
    chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] }).catch(() => {});
  }
}

function syncAll() {
  updateBlockRules();
  syncContentScript().catch((err) => console.warn('ZenFocus: content script sync failed', err));
}
