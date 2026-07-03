"use server";

import {
  VAULT_COOKIE_NAME,
  createVaultSessionCookieValue,
  getSafeVaultRedirect,
  getVaultCookieOptions,
  isVaultConfigured,
  verifyVaultOwnerSecret,
} from "@/lib/vault-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function getLoginRedirect(error: string, nextPath: string): string {
  const params = new URLSearchParams({
    error,
    next: nextPath,
  });

  return `/vault/login?${params.toString()}`;
}

export async function loginToVault(formData: FormData) {
  const nextPath = getSafeVaultRedirect(formData.get("next"));
  const secret = String(formData.get("secret") ?? "");

  if (!isVaultConfigured()) {
    redirect(getLoginRedirect("config", nextPath));
  }

  if (!verifyVaultOwnerSecret(secret)) {
    redirect(getLoginRedirect("invalid", nextPath));
  }

  cookies().set(
    VAULT_COOKIE_NAME,
    createVaultSessionCookieValue(),
    getVaultCookieOptions(),
  );

  redirect(nextPath);
}
