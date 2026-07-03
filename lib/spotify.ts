export const SPOTIFY_SCOPES = [
  "user-read-currently-playing",
  "user-read-recently-played",
];

export function getSpotifyCredentials() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  return { clientId, clientSecret };
}

export function getSpotifyRefreshToken() {
  return process.env.SPOTIFY_REFRESH_TOKEN;
}

export function getSpotifyRedirectUri(request: Request) {
  if (process.env.SPOTIFY_REDIRECT_URI) {
    return process.env.SPOTIFY_REDIRECT_URI;
  }

  const url = new URL(request.url);
  return `${url.origin}/api/spotify/callback`;
}

export function getSpotifyBasicAuthHeader(clientId: string, clientSecret: string) {
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
}

export function spotifySetupRoutesEnabled() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.SPOTIFY_ENABLE_SETUP_ROUTES === "true"
  );
}
