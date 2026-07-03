import { loginToVault } from "@/app/vault/login/actions";
import { getSafeVaultRedirect, isVaultConfigured } from "@/lib/vault-auth";
import { hasVaultOwnerSession } from "@/lib/vault-session";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vault Login",
  robots: {
    follow: false,
    index: false,
  },
};

type SearchParams = Record<string, string | string[] | undefined>;

interface Props {
  searchParams?: Promise<SearchParams>;
}

function getSearchParamValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getErrorMessage(error: string): string {
  if (error === "config") {
    return "Vault access is not configured yet. Set VAULT_OWNER_SECRET and VAULT_COOKIE_SECRET.";
  }

  if (error === "invalid") {
    return "That vault key did not match.";
  }

  return "";
}

export default async function VaultLoginPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const nextPath = getSafeVaultRedirect(getSearchParamValue(params.next));
  const errorMessage = getErrorMessage(getSearchParamValue(params.error));
  const loggedOut = getSearchParamValue(params.loggedOut) === "1";
  const configured = isVaultConfigured();

  if (hasVaultOwnerSession()) {
    redirect(nextPath);
  }

  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-te-dark/70">
          Private
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-te-dark md:text-5xl">
          Vault access
        </h1>
        <p className="mt-4 text-sm leading-7 text-te-dark/80 md:text-base">
          Owner access unlocks the private vault listing and all private notes.
          Shared links open only the note they were created for.
        </p>
      </header>

      <form
        action={loginToVault}
        className="space-y-5 rounded-te border border-te-dark bg-te-light-gray p-5"
      >
        <input type="hidden" name="next" value={nextPath} />

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-te-dark/70">
            Owner key
          </span>
          <input
            className="mt-2 w-full rounded-te border border-te-dark bg-te-beige px-3 py-3 text-sm text-te-dark outline-none focus:ring-2 focus:ring-te-orange"
            disabled={!configured}
            name="secret"
            required
            type="password"
          />
        </label>

        {(errorMessage || loggedOut || !configured) && (
          <p className="text-sm leading-6 text-te-dark/80">
            {errorMessage ||
              (loggedOut
                ? "Vault session cleared."
                : "Vault environment variables are missing.")}
          </p>
        )}

        <button
          className="inline-flex rounded-te bg-te-dark px-4 py-2 text-sm font-semibold text-te-beige transition-colors hover:bg-te-orange disabled:cursor-not-allowed disabled:bg-te-dark/40"
          disabled={!configured}
          type="submit"
        >
          Unlock vault
        </button>
      </form>
    </div>
  );
}
