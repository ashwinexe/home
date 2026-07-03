"use client";

import Image from "next/image";

// ============================================
// EASY TO UPDATE - Just change these values!
// ============================================
const GAMES = [
  {
    title: "Hollow Knight: Silksong",
    platform: "Nintendo Switch",
    coverImage: "https://images.squarespace-cdn.com/content/v1/606d4bb793879d12d807d4c8/f05bbea0-1b1f-4753-9084-8b77c2b036c4/Soundtrack_square.jpg?format=2500w",
    storeUrl: "https://www.nintendo.com/us/store/products/hollow-knight-silksong-switch/",
  },
  {
    title: "Hollow Knight",
    platform: "PC/Steam",
    coverImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg",
    storeUrl: "https://store.steampowered.com/app/367520/Hollow_Knight/",
  },
];

// Platform icons
const platformIcons: Record<string, string> = {
  "Nintendo Switch": "🎮",
  "PlayStation": "🎮",
  "Xbox": "🎮",
  "PC/Steam": "🖥️",
};

export function GamingStatus() {
  return (
    <div className="flex flex-col gap-2">
      {GAMES.map((game) => {
        const platformIcon = platformIcons[game.platform] || "🎮";
        return (
          <a
            key={game.title}
            href={game.storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <div className="flex items-center gap-3 rounded-lg bg-te-gray/50 p-3 transition-colors hover:bg-te-gray">
              {/* Cover art */}
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-te-gray">
                <Image
                  src={game.coverImage}
                  alt={game.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized={game.coverImage.startsWith("http")}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium transition-colors group-hover:text-te-orange">
                  {game.title}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-te-dark/60">
                  <span>{platformIcon}</span>
                  <span className="truncate">{game.platform}</span>
                </p>
              </div>

              {/* Arrow */}
              <span className="text-te-dark/30 transition-colors group-hover:text-te-orange">
                →
              </span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
