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
    updateBlockRules();
  });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && (changes.blockedSites || changes.focusMode)) {
    updateBlockRules();
  }
});

function updateBlockRules() {
  chrome.storage.local.get(['blockedSites', 'focusMode'], (result) => {
    const blockedSites = result.blockedSites || [];
    const focusMode = result.focusMode || false;

    chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
      const removeRuleIds = existingRules.map((rule) => rule.id);

      const addRules = focusMode
        ? blockedSites.map((site, index) => ({
            id: index + 1,
            priority: 1,
            action: {
              type: 'redirect',
              redirect: {
                extensionPath: '/blocked.html',
              },
            },
            condition: {
              urlFilter: `||${site}`,
              resourceTypes: ['main_frame'],
            },
          }))
        : [];

      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds,
        addRules,
      });
    });
  });
}
