import {
  VAULT_COOKIE_NAME,
  getVaultLoginHref,
  verifyVaultSessionCookie,
} from "@/lib/vault-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export function hasVaultOwnerSession(): boolean {
  const sessionCookie = cookies().get(VAULT_COOKIE_NAME)?.value;
  return verifyVaultSessionCookie(sessionCookie);
}

export function requireVaultOwner(nextPath = "/vault"): void {
  if (!hasVaultOwnerSession()) {
    redirect(getVaultLoginHref(nextPath));
  }
}
