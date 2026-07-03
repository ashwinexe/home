import {
  getSpotifyBasicAuthHeader,
  getSpotifyCredentials,
  getSpotifyRedirectUri,
  spotifySetupRoutesEnabled,
} from "@/lib/spotify";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

type SpotifyAuthorizationCodeResponse = {
  refresh_token?: string;
};

function htmlResponse(html: string, status = 200) {
  return new Response(html, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#039;";
      default:
        return character;
    }
  });
}

export async function GET(request: Request) {
  if (!spotifySetupRoutesEnabled()) {
    return htmlResponse("Not found", 404);
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const credentials = getSpotifyCredentials();

  if (error) {
    return htmlResponse(
      `<pre>Spotify authorization failed: ${escapeHtml(error)}</pre>`,
      400,
    );
  }

  if (!code) {
    return htmlResponse("<pre>Missing Spotify authorization code.</pre>", 400);
  }

  if (!credentials) {
    return htmlResponse(
      "<pre>Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET.</pre>",
      500,
    );
  }

  const redirectUri = getSpotifyRedirectUri(request);
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: getSpotifyBasicAuthHeader(
        credentials.clientId,
        credentials.clientSecret,
      ),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return htmlResponse(
      `<pre>Spotify token exchange failed with ${response.status}.</pre>`,
      502,
    );
  }

  const data = (await response.json()) as SpotifyAuthorizationCodeResponse;

  if (!data.refresh_token) {
    return htmlResponse(
      "<pre>Spotify did not return a refresh token. Revoke app access in Spotify and try again.</pre>",
      502,
    );
  }

  const refreshToken = escapeHtml(data.refresh_token);

  return htmlResponse(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Spotify refresh token</title>
    <style>
      body {
        background: #f5f5f0;
        color: #1a1a1a;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        margin: 0;
        padding: 32px;
      }
      main {
        max-width: 760px;
      }
      code, pre {
        background: #ffffff;
        border: 2px solid #e5e5e0;
        border-radius: 8px;
        display: block;
        overflow-wrap: anywhere;
        padding: 16px;
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Spotify is authorized</h1>
      <p>Add this value to <code>.env.local</code>, then restart the dev server.</p>
      <pre>SPOTIFY_REFRESH_TOKEN=${refreshToken}</pre>
    </main>
  </body>
</html>`);
}

export const dynamic = "force-dynamic";
