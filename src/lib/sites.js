// Pure helpers for blocked-site handling. No chrome.* calls here so they can be unit tested.

const HOST_RE = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;

// "https://www.YouTube.com/watch?v=1" -> "youtube.com/watch?v=1"
export function normalizeSite(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, '');
}

// "youtube.com/watch?v=1" -> "youtube.com"; null when it is not a valid hostname.
export function hostOf(site) {
  const host = normalizeSite(site).split(/[/?#:]/)[0];
  return HOST_RE.test(host) ? host : null;
}

// Match pattern that covers the host and all of its subdomains, e.g. "*://*.youtube.com/*".
export function originPattern(site) {
  const host = hostOf(site);
  return host ? `*://*.${host}/*` : null;
}

// Unique, valid origin patterns for a list of sites.
export function originPatterns(sites) {
  return [...new Set((sites || []).map(originPattern).filter(Boolean))];
}

// Declarative Net Request rules; empty when focus mode is off.
export function buildBlockRules(sites, focusMode) {
  if (!focusMode) return [];
  return (sites || [])
    .map(normalizeSite)
    .filter((site) => hostOf(site))
    .map((site, index) => ({
      id: index + 1,
      priority: 1,
      action: { type: 'redirect', redirect: { extensionPath: '/blocked.html' } },
      condition: { urlFilter: `||${site}`, resourceTypes: ['main_frame'] },
    }));
}
