/**
 * PBKDF2 Implementation using Web Crypto API
 */

export async function hashPassword(password: string, saltString?: string): Promise<{ hash: string; salt: string }> {
  const enc = new TextEncoder();
  const salt = saltString ? Uint8Array.from(atob(saltString), c => c.charCodeAt(0)) : crypto.getRandomValues(new Uint8Array(16));
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  const saltStr = btoa(String.fromCharCode(...salt));
  
  return { hash: hashHex, salt: saltStr };
}

export async function verifyPassword(password: string, storedHash: string, storedSalt: string): Promise<boolean> {
  const { hash } = await hashPassword(password, storedSalt);
  return hash === storedHash;
}
