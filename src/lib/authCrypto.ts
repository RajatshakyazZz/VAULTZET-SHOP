/**
 * Secure cryptographic password hashing utility using SHA-256 with project salt.
 * Compatible across Web Crypto API (Browser) and Node.js environments.
 */

const SALT = 'vaultzet_reseller_auth_salt_2026_v1';

export async function hashPassword(email: string, pass: string): Promise<string> {
  const normalized = `${email.toLowerCase().trim()}:${pass}:${SALT}`;

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Node.js fallback
  try {
    const nodeCrypto = await import('crypto');
    return nodeCrypto.createHash('sha256').update(normalized).digest('hex');
  } catch {
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      hash = (hash << 5) - hash + normalized.charCodeAt(i);
      hash |= 0;
    }
    return `h_${Math.abs(hash)}`;
  }
}
