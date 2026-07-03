"use client";

import Image from "next/image";
import useSWR from "swr";

type SpotifyTrack = {
  title: string;
  artist: string;
  album: string | null;
  imageUrl: string | null;
  spotifyUrl: string;
  durationMs: number | null;
  progressMs: number | null;
  playedAt: string | null;
};

type SpotifyStatus = {
  configured: boolean;
  isPlaying: boolean;
  source: "now-playing" | "recently-played" | "idle" | "fallback" | "error";
  track: SpotifyTrack | null;
  updatedAt: string;
};

const DEFAULT_SPOTIFY_EMBED_URL =
  "https://open.spotify.com/embed/track/5QOBT97OmYCZo1W5u7tRrB?utm_source=generator";
const SPOTIFY_EMBED_URL =
  process.env.NEXT_PUBLIC_SPOTIFY_EMBED_URL?.trim() ||
  DEFAULT_SPOTIFY_EMBED_URL;
const FALLBACK_TRACK: SpotifyTrack = {
  title: "ten",
  artist: "Fred again.., Jozzy",
  album: "ten",
  imageUrl:
    "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02bcf3b3664ace77b5cd718d1f",
  spotifyUrl: "https://open.spotify.com/track/5QOBT97OmYCZo1W5u7tRrB",
  durationMs: null,
  progressMs: null,
  playedAt: null,
};

const fallbackStatus: SpotifyStatus = {
  configured: false,
  isPlaying: false,
  source: "fallback",
  track: null,
  updatedAt: "",
};

async function fetchSpotifyStatus(url: string) {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Unable to load Spotify status");
  }

  return (await response.json()) as SpotifyStatus;
}

function SpotifyEmbed() {
  return (
    <div className="w-full overflow-hidden rounded-lg bg-te-gray/50">
      <iframe
        title="Spotify music"
        src={SPOTIFY_EMBED_URL}
        width="100%"
        height="152"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
        className="block rounded-lg"
        style={{ overflow: "hidden" }}
      />
    </div>
  );
}

function SpotifyFallback() {
  return (
    <>
      <div className="sm:hidden">
        <NowPlayingCard
          status={{
            ...fallbackStatus,
            track: FALLBACK_TRACK,
          }}
        />
      </div>
      <div className="hidden sm:block">
        <SpotifyEmbed />
      </div>
    </>
  );
}

function NowPlayingCard({ status }: { status: SpotifyStatus }) {
  const track = status.track;

  if (!track) {
    return <SpotifyEmbed />;
  }

  const progress =
    track.durationMs && track.progressMs
      ? Math.min((track.progressMs / track.durationMs) * 100, 100)
      : 0;
  const label =
    status.source === "fallback"
      ? "SPOTIFY"
      : status.isPlaying
        ? "LIVE"
        : "RECENT";

  return (
    <a
      href={track.spotifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="rounded-lg border border-[#1DB954]/20 bg-[#1DB954]/10 p-3 transition-colors hover:bg-[#1DB954]/15">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-te-gray">
            {track.imageUrl ? (
              <Image
                src={track.imageUrl}
                alt={track.album ?? track.title}
                fill
                sizes="56px"
                unoptimized={track.imageUrl.startsWith("http")}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-te-dark/40">
                SP
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-[#1DB954] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                {label}
              </span>
              <span className="truncate text-[10px] font-semibold uppercase text-te-dark/40">
                Spotify
              </span>
            </div>
            <p className="truncate text-sm font-semibold transition-colors group-hover:text-[#16883f]">
              {track.title}
            </p>
            <p className="mt-0.5 truncate text-xs text-te-dark/60">
              {track.artist}
            </p>
          </div>

          <span className="text-te-dark/30 transition-colors group-hover:text-[#16883f]">
            ↗
          </span>
        </div>

        {status.isPlaying && progress > 0 && (
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/70">
            <div
              className="h-full rounded-full bg-[#1DB954]"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </a>
  );
}

export function SpotifyNowPlaying() {
  const { data } = useSWR<SpotifyStatus>(
    "/api/spotify/now-playing",
    fetchSpotifyStatus,
    {
      fallbackData: fallbackStatus,
      refreshInterval: 30_000,
      revalidateOnFocus: true,
    },
  );

  if (!data?.track) {
    return <SpotifyFallback />;
  }

  return <NowPlayingCard status={data} />;
}

export const MusicEmbed = SpotifyNowPlaying;
