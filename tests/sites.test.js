import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeSite, hostOf, originPattern, originPatterns, buildBlockRules } from '../src/lib/sites.js';

test('normalizeSite strips scheme and www and lowercases', () => {
  assert.equal(normalizeSite('  HTTPS://WWW.YouTube.com/watch?v=1 '), 'youtube.com/watch?v=1');
  assert.equal(normalizeSite('http://reddit.com'), 'reddit.com');
  assert.equal(normalizeSite(null), '');
});

test('hostOf extracts the hostname and rejects invalid input', () => {
  assert.equal(hostOf('youtube.com/watch?v=1'), 'youtube.com');
  assert.equal(hostOf('m.facebook.com:8080/x'), 'm.facebook.com');
  assert.equal(hostOf('localhost'), null);
  assert.equal(hostOf('not a site'), null);
  assert.equal(hostOf(''), null);
  assert.equal(hostOf('*://*/*'), null);
});

test('originPattern covers the host and its subdomains only', () => {
  assert.equal(originPattern('https://www.instagram.com/reels'), '*://*.instagram.com/*');
  assert.equal(originPattern('???'), null);
});

test('originPatterns removes duplicates and invalid sites', () => {
  assert.deepEqual(
    originPatterns(['youtube.com', 'youtube.com/shorts', 'bad host', 'reddit.com']),
    ['*://*.youtube.com/*', '*://*.reddit.com/*'],
  );
  assert.deepEqual(originPatterns(undefined), []);
});

test('buildBlockRules is empty when focus mode is off', () => {
  assert.deepEqual(buildBlockRules(['youtube.com'], false), []);
  assert.deepEqual(buildBlockRules(undefined, true), []);
});

test('buildBlockRules redirects main frames to the block page with unique ids', () => {
  const rules = buildBlockRules(['youtube.com', 'https://www.reddit.com'], true);
  assert.equal(rules.length, 2);
  assert.deepEqual(rules.map((r) => r.id), [1, 2]);
  assert.equal(rules[1].condition.urlFilter, '||reddit.com');
  for (const rule of rules) {
    assert.deepEqual(rule.condition.resourceTypes, ['main_frame']);
    assert.equal(rule.action.redirect.extensionPath, '/blocked.html');
  }
});

test('buildBlockRules skips invalid entries without leaving id gaps', () => {
  const rules = buildBlockRules(['bad host', 'youtube.com'], true);
  assert.deepEqual(rules.map((r) => [r.id, r.condition.urlFilter]), [[1, '||youtube.com']]);
});

test('manifest requests no broad host access up front', () => {
  const manifest = JSON.parse(readFileSync(new URL('../public/manifest.json', import.meta.url), 'utf8'));
  assert.equal(manifest.host_permissions, undefined);
  assert.equal(manifest.content_scripts, undefined);
  assert.ok(manifest.optional_host_permissions.length > 0);
  assert.ok(manifest.permissions.includes('scripting'));
  assert.equal(manifest.background.type, 'module');
});

test('package.json and manifest versions match', () => {
  const manifest = JSON.parse(readFileSync(new URL('../public/manifest.json', import.meta.url), 'utf8'));
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.version, manifest.version);
});
