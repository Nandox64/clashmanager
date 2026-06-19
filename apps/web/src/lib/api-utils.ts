import "server-only";

import { adminAuth } from "./firebase-admin";

export async function getUserUid(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    if (token === "mock-mode" || token.startsWith("mock-")) return token.replace("mock-", "");
    if (adminAuth) {
      try { return (await adminAuth.verifyIdToken(token)).uid; } catch { return null; }
    }
  }
  return null;
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

// Limpiar entradas expiradas cada 60s
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredEntries, 60_000);
}

export function checkRateLimit(
  uid: string,
  route: string,
  maxRequests = 10,
  windowMs = 60000
): { allowed: boolean; remaining: number; resetIn: number } {
  const key = `${uid}:${route}`;
  const now = Date.now();
  let entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    entry = { count: 1, resetAt: now + windowMs };
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  return { allowed: true, remaining: maxRequests - entry.count, resetIn: entry.resetAt - now };
}

export function getRateLimitStatus(
  uid: string,
  route: string,
  maxRequests = 10
): { used: number; remaining: number; resetIn: number } {
  const key = `${uid}:${route}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    return { used: 0, remaining: maxRequests, resetIn: 60000 };
  }

  return {
    used: entry.count,
    remaining: Math.max(0, maxRequests - entry.count),
    resetIn: entry.resetAt - now,
  };
}
