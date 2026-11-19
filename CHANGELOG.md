# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Plan: `docs/ROADMAP.md`.

## [Unreleased]

### Security
- Password lock now stores only a salted PBKDF2-SHA-256 hash (`passwordHash`); plain-text passwords from earlier versions are migrated and deleted on first open. Comparison is constant-time. (`gece/2026-11-19-sifre-hash`)
- First unit tests (`npm test`, 4 tests); `package.json` version aligned with the manifest (1.1.0).

### Changed
- `node_modules` and `dist` removed from version control (PR #1).

### Added
- `docs/ROADMAP.md`, `CHANGELOG.md`, `docs/PATCH-NOTES.md`.

## [1.1.0] - 2026-11-01
### Added
- Custom block page.
- Password protection, so blocking can't be turned off on impulse.
- UI updates.

## [1.0.2] - 2026-02-12
- Fixes and minor improvements (UPDATE1.02).

## [1.0.1] - 2026-02-12
- Fixes (update1.01).

## [1.0.0] - 2026-02-12
### Added
- First release: add and remove sites, block with Manifest V3 `declarativeNetRequest`, data in Chrome Storage, privacy policy.
