chrome.runtime.onInstalled.addListener(() => {
  console.log('ZenFocus extension installed');
  
  chrome.storage.local.get(['blockedSites', 'focusMode'], (result) => {
    if (!result.blockedSites) {
      chrome.storage.local.set({ blockedSites: [] });
    }
    if (result.focusMode === undefined) {
      chrome.storage.local.set({ focusMode: false });
    }
  });
});
