import { createHash, createHmac, timingSafeEqual } from "crypto";

export const VAULT_COOKIE_NAME = "ashwin_vault";
export const VAULT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function getCookieSecret(): string {
  return process.env.VAULT_COOKIE_SECRET ?? "";
}

function getOwnerSecret(): string {
  return process.env.VAULT_OWNER_SECRET ?? "";
}

function safeEqualString(actual: string, expected: string): boolean {
  const actualHash = createHash("sha256").update(actual).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(actualHash, expectedHash);
}

function signPayload(payload: string): string {
  return createHmac("sha256", getCookieSecret()).update(payload).digest("base64url");
}

export function isVaultConfigured(): boolean {
  return getOwnerSecret().length > 0 && getCookieSecret().length > 0;
}

export function verifyVaultOwnerSecret(secret: string): boolean {
  const expectedSecret = getOwnerSecret();

  if (!expectedSecret || !secret) {
    return false;
  }

  return safeEqualString(secret, expectedSecret);
}

export function createVaultSessionCookieValue(): string {
  const expiresAt = Date.now() + VAULT_SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `owner.${expiresAt}`;
  return `${payload}.${signPayload(payload)}`;
}

export function verifyVaultSessionCookie(value: string | undefined): boolean {
  if (!value || !getCookieSecret()) {
    return false;
  }

  const [role, expiresAt, signature] = value.split(".");

  if (role !== "owner" || !expiresAt || !signature) {
    return false;
  }

  const expiresAtNumber = Number(expiresAt);

  if (!Number.isFinite(expiresAtNumber) || expiresAtNumber < Date.now()) {
    return false;
  }

  return safeEqualString(signature, signPayload(`${role}.${expiresAt}`));
}

export function getVaultCookieOptions() {
  return {
    httpOnly: true,
    maxAge: VAULT_SESSION_MAX_AGE_SECONDS,
    path: "/vault",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function hashVaultShareToken(token: string): string {
  const tokenHash = createHash("sha256").update(token.trim()).digest("hex");
  return `sha256:${tokenHash}`;
}

function normalizeShareTokenHash(hash: string): string {
  return hash.trim().replace(/^sha256:/i, "").toLowerCase();
}

export function verifyVaultShareToken(
  token: string | undefined,
  expectedHash: string | undefined,
): boolean {
  if (!token || !expectedHash) {
    return false;
  }

  const actualHash = normalizeShareTokenHash(hashVaultShareToken(token));
  const normalizedExpectedHash = normalizeShareTokenHash(expectedHash);

  if (!/^[a-f0-9]{64}$/.test(normalizedExpectedHash)) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(actualHash, "hex"),
    Buffer.from(normalizedExpectedHash, "hex"),
  );
}

export function getSafeVaultRedirect(
  value: FormDataEntryValue | string | null | undefined,
  fallback = "/vault",
): string {
  if (typeof value !== "string") {
    return fallback;
  }

  if (
    !value.startsWith("/vault") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.startsWith("/vault/login") ||
    value.startsWith("/vault/logout")
  ) {
    return fallback;
  }

  return value;
}

export function getVaultLoginHref(nextPath = "/vault"): string {
  const safeNextPath = getSafeVaultRedirect(nextPath);
  return `/vault/login?next=${encodeURIComponent(safeNextPath)}`;
}
