const STORAGE_KEY = 'chatroom_pending_registration';
const KEY_SEED = 'chatroom-registration-otp-v1';

const getCrypto = () => window.crypto || window.msCrypto;

const encode = (value) => new TextEncoder().encode(value);
const decode = (value) => new TextDecoder().decode(value);

const toBase64 = (buffer) => btoa(String.fromCharCode(...new Uint8Array(buffer)));

const fromBase64 = (value) => {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const getKey = async () => {
  const crypto = getCrypto();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encode(`${window.location.origin}:${KEY_SEED}`),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encode(KEY_SEED),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

export const savePendingRegistration = async (data) => {
  const crypto = getCrypto();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getKey();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encode(JSON.stringify(data))
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      iv: toBase64(iv),
      value: toBase64(encrypted),
    })
  );
};

export const loadPendingRegistration = async () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const payload = JSON.parse(stored);
    const key = await getKey();
    const decrypted = await getCrypto().subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(payload.iv) },
      key,
      fromBase64(payload.value)
    );

    const data = JSON.parse(decode(decrypted));

    if (data.expiresAt && data.expiresAt < Date.now()) {
      clearPendingRegistration();
      return null;
    }

    return data;
  } catch (error) {
    clearPendingRegistration();
    return null;
  }
};

export const clearPendingRegistration = () => {
  localStorage.removeItem(STORAGE_KEY);
};
