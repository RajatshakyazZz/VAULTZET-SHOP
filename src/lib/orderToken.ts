import crypto from 'crypto';

const ORDER_SECRET = process.env.ORDER_TOKEN_SECRET || process.env.CASHFREE_SECRET_KEY || 'vaultzet_order_secure_secret_2026';

/**
 * Generates an unguessable, tamper-proof cryptographic token for an order.
 */
export function generateOrderToken(orderNumber: string): string {
  const hmac = crypto.createHmac('sha256', ORDER_SECRET);
  hmac.update(`order_token_${orderNumber}`);
  return hmac.digest('hex').slice(0, 32);
}

/**
 * Verifies if the provided token matches the expected order token.
 */
export function verifyOrderToken(expectedOrderNumber: string, candidateToken: string | null | undefined): boolean {
  if (!candidateToken || !expectedOrderNumber) return false;
  const expectedToken = generateOrderToken(expectedOrderNumber);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(candidateToken.trim()),
      Buffer.from(expectedToken)
    );
  } catch {
    return false;
  }
}

/**
 * Extracts client metadata (IP, User-Agent, _fbp, _fbc) from incoming Request for Meta CAPI.
 */
export function extractClientMetadata(request: Request): {
  clientIp: string;
  clientUserAgent: string;
  fbp?: string;
  fbc?: string;
} {
  const headers = request.headers;
  
  // Extract real client IP through common proxies (Cloudflare, Vercel, Nginx)
  const forwardedFor = headers.get('x-forwarded-for') || '';
  const realIp = headers.get('x-real-ip') || '';
  const cfConnectingIp = headers.get('cf-connecting-ip') || '';

  const clientIp = (cfConnectingIp || realIp || forwardedFor.split(',')[0] || '').trim();
  const clientUserAgent = (headers.get('user-agent') || '').trim();

  // Extract cookies
  const cookieHeader = headers.get('cookie') || '';
  let fbp: string | undefined;
  let fbc: string | undefined;

  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    for (const c of cookies) {
      if (c.startsWith('_fbp=')) {
        fbp = c.slice(5).trim();
      } else if (c.startsWith('_fbc=')) {
        fbc = c.slice(5).trim();
      }
    }
  }

  return {
    clientIp,
    clientUserAgent,
    fbp,
    fbc,
  };
}
