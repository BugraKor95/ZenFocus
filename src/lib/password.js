// Password lock: only a salted PBKDF2-SHA-256 hash is kept in chrome.storage.local,
// never the password itself. Older versions stored the plain text; it is migrated on load.

const ITERATIONS = 150000;
const enc = new TextEncoder();

const toHex = (buffer) => [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (hex) => new Uint8Array(hex.match(/.{2}/g).map((h) => parseInt(h, 16)));

async function derive(password, salt, iterations) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  return toHex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256));
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { v: 1, salt: toHex(salt), iterations: ITERATIONS, hash: await derive(password, salt, ITERATIONS) };
}

// Constant-time comparison of equal-length hex strings
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyPassword(password, record) {
  if (!record || typeof password !== 'string' || !password) return false;
  if (typeof record === 'string') return safeEqual(password, record); // legacy plain text
  const hash = await derive(password, fromHex(record.salt), record.iterations || ITERATIONS);
  return safeEqual(hash, record.hash);
}

// Turns a legacy plain-text value into a hash record; returns null if there is nothing to store
export async function migratePassword(stored) {
  if (!stored) return null;
  if (typeof stored === 'string') return hashPassword(stored);
  return stored;
}
