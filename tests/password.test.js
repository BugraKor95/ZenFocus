import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, migratePassword, verifyPassword } from '../src/lib/password.js';

test('the hash record does not contain the password', async () => {
  const record = await hashPassword('gizli-123');
  assert.equal(record.v, 1);
  assert.match(record.hash, /^[0-9a-f]{64}$/);
  assert.match(record.salt, /^[0-9a-f]{32}$/);
  assert.ok(!JSON.stringify(record).includes('gizli-123'));
});

test('correct password verifies, wrong or empty does not', async () => {
  const record = await hashPassword('gizli-123');
  assert.equal(await verifyPassword('gizli-123', record), true);
  assert.equal(await verifyPassword('gizli-124', record), false);
  assert.equal(await verifyPassword('', record), false);
  assert.equal(await verifyPassword('gizli-123', null), false);
});

test('same password gets a different salt each time', async () => {
  const [a, b] = await Promise.all([hashPassword('x'), hashPassword('x')]);
  assert.notEqual(a.salt, b.salt);
  assert.notEqual(a.hash, b.hash);
});

test('legacy plain-text value still verifies and is migrated to a hash', async () => {
  assert.equal(await verifyPassword('eski', 'eski'), true);
  assert.equal(await verifyPassword('yanlis', 'eski'), false);
  const migrated = await migratePassword('eski');
  assert.equal(typeof migrated, 'object');
  assert.equal(await verifyPassword('eski', migrated), true);
  assert.equal(await migratePassword(''), null);
  assert.equal(await migratePassword(migrated), migrated);
});
