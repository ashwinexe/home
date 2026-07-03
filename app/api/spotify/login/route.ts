import { NextResponse } from "next/server";
import {
  getSpotifyCredentials,
  getSpotifyRedirectUri,
  SPOTIFY_SCOPES,
  spotifySetupRoutesEnabled,
} from "@/lib/spotify";

export async function GET(request: Request) {
  if (!spotifySetupRoutesEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const credentials = getSpotifyCredentials();

  if (!credentials) {
    return NextResponse.json(
      { error: "Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET" },
      { status: 500 },
    );
  }

  const redirectUri = getSpotifyRedirectUri(request);
  const authorizeUrl = new URL("https://accounts.spotify.com/authorize");

  authorizeUrl.search = new URLSearchParams({
    response_type: "code",
    client_id: credentials.clientId,
    scope: SPOTIFY_SCOPES.join(" "),
    redirect_uri: redirectUri,
  }).toString();

  return NextResponse.redirect(authorizeUrl);
}

export const dynamic = "force-dynamic";
