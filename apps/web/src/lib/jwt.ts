'use client';

import { createRemoteJWKSet, jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function createToken(payload: object): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);
}

export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.accessToken;
  } catch {
    return null;
  }
}
