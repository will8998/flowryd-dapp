import { SignJWT, jwtVerify } from 'jose';

export interface AccessTokenPayload {
  sub: string;
  partyId: string;
  role: 'admin' | 'editor' | 'viewer';
  orgId: string;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenFamily: string;
}

function getSecret(envVar: string): Uint8Array {
  const value = process.env[envVar];
  if (!value) throw new Error(`Missing environment variable: ${envVar}`);
  return new TextEncoder().encode(value);
}

export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .setIssuer('flowryd')
    .sign(getSecret('JWT_SECRET'));
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, getSecret('JWT_SECRET'), {
    issuer: 'flowryd',
  });

  return {
    sub: payload.sub as string,
    partyId: payload.partyId as string,
    role: payload.role as AccessTokenPayload['role'],
    orgId: payload.orgId as string,
  };
}

export async function signRefreshToken(userId: string, tokenFamily: string): Promise<string> {
  return new SignJWT({ sub: userId, tokenFamily })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .setIssuer('flowryd')
    .sign(getSecret('JWT_REFRESH_SECRET'));
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  const { payload } = await jwtVerify(token, getSecret('JWT_REFRESH_SECRET'), {
    issuer: 'flowryd',
  });

  return {
    sub: payload.sub as string,
    tokenFamily: payload.tokenFamily as string,
  };
}

// SHA-256 hash for refresh token storage (not bcrypt — tokens are high-entropy)
export async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}