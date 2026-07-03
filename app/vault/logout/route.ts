import {
  VAULT_COOKIE_NAME,
  getVaultCookieOptions,
} from "@/lib/vault-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const response = NextResponse.redirect(
    new URL("/vault/login?loggedOut=1", request.url),
  );

  response.cookies.set(VAULT_COOKIE_NAME, "", {
    ...getVaultCookieOptions(),
    maxAge: 0,
  });

  return response;
}
