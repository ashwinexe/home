import { NextResponse } from "next/server";
import {
  getSpotifyBasicAuthHeader,
  getSpotifyCredentials,
  getSpotifyRefreshToken,
} from "@/lib/spotify";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_NOW_PLAYING_URL =
  "https://api.spotify.com/v1/me/player/currently-playing";
const SPOTIFY_RECENTLY_PLAYED_URL =
  "https://api.spotify.com/v1/me/player/recently-played?limit=1";

type SpotifyTokenResponse = {
  access_token?: string;
  expires_in?: number;
};

type SpotifyImage = {
  url: string;
};

type SpotifyTrackItem = {
  type?: string;
  name?: string;
  artists?: Array<{ name?: string }>;
  album?: {
    name?: string;
    images?: SpotifyImage[];
  };
  external_urls?: {
    spotify?: string;
  };
  duration_ms?: number;
};

type SpotifyCurrentResponse = {
  is_playing?: boolean;
  progress_ms?: number | null;
  item?: SpotifyTrackItem | null;
};

type SpotifyRecentResponse = {
  items?: Array<{
    played_at?: string;
    track?: SpotifyTrackItem;
  }>;
};

type NowPlayingTrack = {
  title: string;
  artist: string;
  album: string | null;
  imageUrl: string | null;
  spotifyUrl: string;
  durationMs: number | null;
  progressMs: number | null;
  playedAt: string | null;
};

let cachedAccessToken:
  | {
      token: string;
      expiresAt: number;
    }
  | null = null;

function jsonResponse(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");

  return NextResponse.json(data, {
    ...init,
    headers,
  });
}

async function getAccessToken() {
  const credentials = getSpotifyCredentials();
  const refreshToken = getSpotifyRefreshToken();

  if (!credentials || !refreshToken) {
    return null;
  }

  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedAccessToken.token;
  }

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
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Spotify token refresh failed with ${response.status}`);
  }

  const data = (await response.json()) as SpotifyTokenResponse;

  if (!data.access_token) {
    throw new Error("Spotify token refresh did not return an access token");
  }

  cachedAccessToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };

  return cachedAccessToken.token;
}

function toNowPlayingTrack(
  item: SpotifyTrackItem | null | undefined,
  progressMs: number | null,
  playedAt: string | null,
): NowPlayingTrack | null {
  const title = item?.name;
  const artist = item?.artists
    ?.map((entry) => entry.name)
    .filter(Boolean)
    .join(", ");
  const spotifyUrl = item?.external_urls?.spotify;

  if (!title || !artist || !spotifyUrl) {
    return null;
  }

  return {
    title,
    artist,
    album: item.album?.name ?? null,
    imageUrl: item.album?.images?.[0]?.url ?? null,
    spotifyUrl,
    durationMs: item.duration_ms ?? null,
    progressMs,
    playedAt,
  };
}

async function getRecentlyPlayedTrack(accessToken: string) {
  const response = await fetch(SPOTIFY_RECENTLY_PLAYED_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as SpotifyRecentResponse;
  const latest = data.items?.[0];

  return toNowPlayingTrack(latest?.track, null, latest?.played_at ?? null);
}

export async function GET() {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return jsonResponse({
        configured: false,
        isPlaying: false,
        source: "fallback",
        track: null,
        updatedAt: new Date().toISOString(),
      });
    }

    const response = await fetch(SPOTIFY_NOW_PLAYING_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (response.status === 204) {
      const recentTrack = await getRecentlyPlayedTrack(accessToken);

      return jsonResponse({
        configured: true,
        isPlaying: false,
        source: recentTrack ? "recently-played" : "idle",
        track: recentTrack,
        updatedAt: new Date().toISOString(),
      });
    }

    if (!response.ok) {
      return jsonResponse(
        {
          configured: true,
          isPlaying: false,
          source: "error",
          track: null,
          updatedAt: new Date().toISOString(),
        },
        { status: response.status === 429 ? 429 : 502 },
      );
    }

    const data = (await response.json()) as SpotifyCurrentResponse;
    const currentTrack = toNowPlayingTrack(
      data.item,
      data.progress_ms ?? null,
      null,
    );

    if (currentTrack) {
      return jsonResponse({
        configured: true,
        isPlaying: Boolean(data.is_playing),
        source: "now-playing",
        track: currentTrack,
        updatedAt: new Date().toISOString(),
      });
    }

    const recentTrack = await getRecentlyPlayedTrack(accessToken);

    return jsonResponse({
      configured: true,
      isPlaying: false,
      source: recentTrack ? "recently-played" : "idle",
      track: recentTrack,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);

    return jsonResponse(
      {
        configured: true,
        isPlaying: false,
        source: "error",
        track: null,
        updatedAt: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
