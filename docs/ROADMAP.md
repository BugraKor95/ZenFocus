# Roadmap — ZenFocus

**Goal:** Publish on the Chrome Web Store, then test a small premium tier.

**Rule:** `npm run build` must pass after every sprint, and the extension must load in Chrome.

## Current state (v1.1.0, 19 November 2026)

- React 18 + Vite 5 + Tailwind, Manifest V3
- Site blocking (`declarativeNetRequest`), custom block page, focus mode, statistics, password lock

## Gaps

| # | Gap | Severity |
|---|---|---|
| G1 | `node_modules` and `dist` committed to the repo (cleanup in PR #1) | Medium |
| G2 | Password stored in plain text in `chrome.storage.local`; people often reuse passwords | Medium |
| G3 | `<all_urls>` host permission plus a content script on every page; the Web Store review asks for justification | Medium |
| G4 | `package.json` says 1.0.0 while the manifest says 1.1.0 | Low |
| G5 | No tests or lint | Medium |
| G6 | Vite 5 and React 18 are outdated | Low |
| G7 | Only one language; the store listing is weak | Medium |

## Sprints

### Sprint 1 — Cleanup and security (1 week)

- [x] Untrack `node_modules` and `dist` (G1)
- [x] Store the password as a salted hash using Web Crypto (G2): PBKDF2-SHA-256, 150k iterations, plain-text values migrated on load
- [ ] Minimal permissions: drop the content script or narrow its match patterns (G3)
- [ ] Use a single version number; the build script copies it into the manifest (G4)
- [ ] Add ESLint and Vitest; unit tests for the blocking-rule generation logic (G5)

### Sprint 2 — Store release (1 week)

- [ ] TR/EN using `_locales` (G7)
- [ ] Store listing: 5 screenshots, a short video, a privacy-policy link (the policy already exists)
- [ ] Chrome Web Store developer registration (USD 5 one-time) and submission
- **Done when:** The extension is live on the store.

### Sprint 3 — Features

- Scheduled blocking (e.g. weekdays 09:00–18:00)
- Pomodoro timer and break reminders
- Weekly focus report

### Sprint 4 — Premium experiment

- ExtensionPay or Lemon Squeezy integration (Stripe is hard to open from Turkey)
- Premium features: device sync, detailed statistics, unlimited schedules
- **Realistic expectation:** Thousands of users are needed before meaningful revenue; this is a low-cost experiment.

### Sprint 5 — Modernize

- Vite 8, React 19, Tailwind 4 (G6)
- Firefox build (MV3 compatibility)
