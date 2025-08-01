// Token-based authentication for iframe environments
import crypto from 'crypto';

interface TokenData {
  userId: string;
  username: string;
  name: string;
  email: string;
  hasJustSignedUp: boolean;
  timestamp: number;
}

// In-memory token store (in production, use Redis or database)
const tokenStore = new Map<string, TokenData>();

// Generate a secure token
export function generateAuthToken(userData: {
  userId: string;
  username: string;
  name: string;
  email: string;
  hasJustSignedUp?: boolean;
}): string {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenData: TokenData = {
    userId: userData.userId,
    username: userData.username,
    name: userData.name,
    email: userData.email,
    hasJustSignedUp: userData.hasJustSignedUp || false,
    timestamp: Date.now()
  };
  
  tokenStore.set(token, tokenData);
  console.log('Generated auth token for user:', userData.username);
  return token;
}

// Validate and retrieve user data from token
export function validateAuthToken(token: string): TokenData | null {
  if (!token) {
    console.log('Token validation failed: no token provided');
    return null;
  }
  
  const tokenData = tokenStore.get(token);
  if (!tokenData) {
    console.log('Token validation failed: token not found in store');
    console.log('Available tokens:', Array.from(tokenStore.keys()).length);
    return null;
  }
  
  // Check if token is expired (24 hours)
  const maxAge = 24 * 60 * 60 * 1000;
  if (Date.now() - tokenData.timestamp > maxAge) {
    tokenStore.delete(token);
    console.log('Token validation failed: token expired');
    return null;
  }
  
  console.log('Token validation successful for user:', tokenData.username);
  return tokenData;
}

// Remove token (for logout)
export function revokeAuthToken(token: string): void {
  tokenStore.delete(token);
  console.log('Revoked auth token');
}

// Clean expired tokens (call periodically)
export function cleanExpiredTokens(): void {
  const maxAge = 24 * 60 * 60 * 1000;
  const now = Date.now();
  
  for (const [token, data] of Array.from(tokenStore.entries())) {
    if (now - data.timestamp > maxAge) {
      tokenStore.delete(token);
    }
  }
}

// Middleware to extract token from Authorization header or query param
export function extractToken(req: any): string | null {
  // Try Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Try query parameter for iframe compatibility
  if (req.query.auth_token) {
    return req.query.auth_token as string;
  }
  
  // Try request body for POST requests
  if (req.body && req.body.auth_token) {
    return req.body.auth_token as string;
  }
  
  return null;
}