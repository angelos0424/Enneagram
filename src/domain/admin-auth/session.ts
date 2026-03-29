import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getEnv, type AppEnv } from "@/env";

const ADMIN_SESSION_SUBJECT = "admin";
const ADMIN_SESSION_VERSION = "v1";
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12;

export const ADMIN_SESSION_COOKIE = {
  name: "admin_session",
} as const;

export type AdminSessionCookieOptions = {
  httpOnly: true;
  path: "/admin";
  sameSite: "lax";
  secure: boolean;
  maxAge: number;
};

export type AdminSession = {
  subject: typeof ADMIN_SESSION_SUBJECT;
  issuedAt: string;
  expiresAt: string;
};

type AdminSessionPayload = {
  sub: typeof ADMIN_SESSION_SUBJECT;
  iat: string;
  exp: string;
};

type CookieStore = {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options: AdminSessionCookieOptions): void;
  delete(name: string): void;
};

export function getAdminSessionCookieOptions(
  env: AppEnv = getEnv(),
): AdminSessionCookieOptions {
  return {
    httpOnly: true,
    path: "/admin",
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  };
}

export function isValidAdminPassword(
  candidate: string,
  env: AppEnv = getEnv(),
): boolean {
  const expected = Buffer.from(env.ADMIN_PASSWORD, "utf8");
  const actual = Buffer.from(candidate, "utf8");

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

export function createAdminSessionToken(
  env: AppEnv = getEnv(),
  now: Date = new Date(),
): string {
  const payload: AdminSessionPayload = {
    sub: ADMIN_SESSION_SUBJECT,
    iat: now.toISOString(),
    exp: new Date(now.getTime() + ADMIN_SESSION_TTL_SECONDS * 1000).toISOString(),
  };
  const encodedPayload = encodeSegment(JSON.stringify(payload));
  const signature = signSessionPayload(encodedPayload, env);

  return `${ADMIN_SESSION_VERSION}.${encodedPayload}.${signature}`;
}

export function verifyAdminSessionToken(
  token: string,
  env: AppEnv = getEnv(),
  now: Date = new Date(),
): AdminSession | null {
  const [version, encodedPayload, signature] = token.split(".");

  if (
    version !== ADMIN_SESSION_VERSION ||
    !encodedPayload ||
    !signature ||
    token.split(".").length !== 3
  ) {
    return null;
  }

  const expectedSignature = signSessionPayload(encodedPayload, env);

  if (!safeCompare(signature, expectedSignature)) {
    return null;
  }

  const payload = decodePayload(encodedPayload);

  if (!payload || payload.sub !== ADMIN_SESSION_SUBJECT) {
    return null;
  }

  const expiresAt = new Date(payload.exp);
  const issuedAt = new Date(payload.iat);

  if (Number.isNaN(expiresAt.getTime()) || Number.isNaN(issuedAt.getTime())) {
    return null;
  }

  if (expiresAt.getTime() <= now.getTime()) {
    return null;
  }

  return {
    subject: ADMIN_SESSION_SUBJECT,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

export function buildAdminSessionCookie(
  token: string,
  env: AppEnv = getEnv(),
) {
  return {
    name: ADMIN_SESSION_COOKIE.name,
    value: token,
    options: getAdminSessionCookieOptions(env),
  };
}

export function readAdminSessionTokenFromCookieStore(
  cookieStore: CookieStore,
): string | null {
  return cookieStore.get(ADMIN_SESSION_COOKIE.name)?.value ?? null;
}

export async function issueAdminSessionCookie(
  cookieStore: CookieStore | null = null,
): Promise<string> {
  const store = cookieStore ?? (await cookies());
  const env = getEnv();
  const token = createAdminSessionToken(env);

  store.set(
    ADMIN_SESSION_COOKIE.name,
    token,
    getAdminSessionCookieOptions(env),
  );

  return token;
}

export async function clearAdminSessionCookie(
  cookieStore: CookieStore | null = null,
) {
  const store = cookieStore ?? (await cookies());

  store.delete(ADMIN_SESSION_COOKIE.name);
}

export async function readAdminSession(
  cookieStore: CookieStore | null = null,
): Promise<AdminSession | null> {
  const store = cookieStore ?? (await cookies());
  const token = readAdminSessionTokenFromCookieStore(store);

  if (!token) {
    return null;
  }

  return verifyAdminSessionToken(token);
}

export async function requireAdminSession() {
  const cookieStore = await cookies();
  const sessionToken = readAdminSessionTokenFromCookieStore(cookieStore);

  if (!sessionToken) {
    redirect("/admin/login");
  }

  const session = verifyAdminSessionToken(sessionToken);

  if (!session) {
    cookieStore.delete(ADMIN_SESSION_COOKIE.name);
    redirect("/admin/login");
  }

  return session;
}

function signSessionPayload(
  encodedPayload: string,
  env: AppEnv,
): string {
  return createHmac("sha256", env.ADMIN_SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");
}

function encodeSegment(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodePayload(encodedPayload: string): AdminSessionPayload | null {
  try {
    const decoded = Buffer.from(encodedPayload, "base64url").toString("utf8");

    return JSON.parse(decoded) as AdminSessionPayload;
  } catch {
    return null;
  }
}

function safeCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
