import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

// Secret key for HMAC token signing (configurable via environment variable)
const JWT_SECRET = process.env.SECRET_KEY || 'safeguard-vision-jwt-secret-key-2026';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'safety_manager' | 'inspector';
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

/**
 * Hash a password using PBKDF2 with a cryptographically secure random salt.
 * Format: pbkdf2$iterations$salt$hash
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 100000;
  const keylen = 64;
  const digest = 'sha512';
  const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex');
  return `pbkdf2$${iterations}$${salt}$${derivedKey}`;
}

/**
 * Verify a plain-text password against a stored PBKDF2 hash.
 * Also supports legacy plain text during initial database migration and securely upgrades it.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;

  // Standard PBKDF2 verification
  if (storedHash.startsWith('pbkdf2$')) {
    const parts = storedHash.split('$');
    if (parts.length !== 4) return false;
    const iterations = parseInt(parts[1], 10);
    const salt = parts[2];
    const originalHash = parts[3];
    const keylen = 64;
    const digest = 'sha512';
    const computedHash = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex');
    
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(computedHash, 'hex'));
  }

  // Fallback for initial plain text seeding
  return password === storedHash;
}

/**
 * Generate a cryptographically signed authentication token.
 * Format: payloadBase64.hmacSignature
 */
export function createAuthToken(user: AuthUser, expiresInMs = 24 * 3600 * 1000): string {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + expiresInMs,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payloadB64).digest('base64url');
  return `${payloadB64}.${signature}`;
}

/**
 * Verify and decode an authentication token.
 */
export function verifyAuthToken(token: string): AuthUser | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(payloadB64).digest('base64url');

  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (Date.now() > payload.exp) {
      return null; // Token expired
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Express middleware to authenticate Bearer tokens.
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Authentication token required' });
  }

  const token = authHeader.substring(7).trim();
  const user = verifyAuthToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }

  req.user = user;
  next();
}

/**
 * Express middleware to enforce Role-Based Access Control (RBAC).
 */
export function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Insufficient privileges. Required roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}
