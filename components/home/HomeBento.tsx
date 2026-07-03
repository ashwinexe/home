"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type DragEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import { LayoutGroup, MotionConfig } from "framer-motion";
import { BentoGrid } from "@/components/home/BentoGrid";
import { BentoCard, type CardSize } from "@/components/home/BentoCard";
import { SpotifyNowPlaying } from "@/components/live/SpotifyNowPlaying";
import { GamingStatus } from "@/components/live/GamingStatus";
import { Badge } from "@/components/ui/Badge";

type HomeCardId =
  | "profile"
  | "liveActivity"
  | "work"
  | "quote"
  | "projects"
  | "talks"
  | "latestBlog"
  | "featuredProject"
  | "now"
  | "shot";

export type HomeLayoutItem = {
  id: HomeCardId;
  size: CardSize;
  backgroundImage?: string;
};

type LatestPost = {
  slug: string;
  title: string;
  description: string;
  dateLabel: string;
};

type FeaturedProject = {
  name: string;
  description: string;
};

type Shot = {
  image: string;
  caption?: string;
  date?: string;
};

type HomeBentoData = {
  latestPost?: LatestPost;
  featuredProject?: FeaturedProject;
  shot?: Shot;
};

type HomeBentoProps = {
  layout: HomeLayoutItem[];
  data: HomeBentoData;
};

const SIZE_OPTIONS: CardSize[] = [
  "1x1",
  "1x2",
  "2x1",
  "2x2",
  "2x3",
  "3x2",
  "4x2",
  "4x3",
  "2x4",
  "4x4",
];

const LAYOUT_STORAGE_KEY = "homeLayoutDraft";

const socials = [
  {
    name: "GitHub",
    href: "https://github.com/ashwinexe",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: "Twitter",
    href: "https://twitter.com/AshwinExe",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/ashwinexe",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

function moveLayoutItem(items: HomeLayoutItem[], fromId: HomeCardId, toId: HomeCardId) {
  const fromIndex = items.findIndex((item) => item.id === fromId);
  const toIndex = items.findIndex((item) => item.id === toId);

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function normalizeLayout(
  layout: HomeLayoutItem[],
  fallback: HomeLayoutItem[],
) {
  const validIds = new Set(fallback.map((item) => item.id));
  const validSizes = new Set(SIZE_OPTIONS);

  const sanitized = layout.filter(
    (item) => validIds.has(item.id) && validSizes.has(item.size),
  );

  const missing = fallback.filter(
    (item) => !sanitized.some((entry) => entry.id === item.id),
  );

  return [...sanitized, ...missing];
}

export function HomeBento({ layout: initialLayout, data }: HomeBentoProps) {
  const searchParams = useSearchParams();
  const editParam = searchParams.get("edit") === "1";
  const editKey = searchParams.get("key") ?? "";
  const editMode = editParam;

  const [layout, setLayout] = useState<HomeLayoutItem[]>(() =>
    normalizeLayout(initialLayout, initialLayout),
  );
  const [dragOverId, setDragOverId] = useState<HomeCardId | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy layout JSON");
  const [applyState, setApplyState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [applyMessage, setApplyMessage] = useState("");

  useEffect(() => {
    if (!editMode) return;
    const stored = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as HomeLayoutItem[];
      setLayout(normalizeLayout(parsed, initialLayout));
    } catch {
      window.localStorage.removeItem(LAYOUT_STORAGE_KEY);
    }
  }, [editMode, initialLayout]);

  useEffect(() => {
    if (!editMode) return;
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
  }, [editMode, layout]);

  useEffect(() => {
    if (editMode) return;
    setLayout(normalizeLayout(initialLayout, initialLayout));
  }, [editMode, initialLayout]);

  const availableIds = useMemo(() => {
    const ids: HomeCardId[] = [
      "profile",
      "liveActivity",
      "work",
      "quote",
      "projects",
      "talks",
    ];

    if (data.latestPost) ids.push("latestBlog");
    if (data.featuredProject) ids.push("featuredProject");
    ids.push("now");

    return new Set(ids);
  }, [data.featuredProject, data.latestPost]);

  const visibleLayout = useMemo(
    () => layout.filter((item) => availableIds.has(item.id)),
    [layout, availableIds],
  );

  const updateSize = useCallback((id: HomeCardId, size: CardSize) => {
    setLayout((prev) =>
      prev.map((item) => (item.id === id ? { ...item, size } : item)),
    );
  }, []);

  const handleDragStart = useCallback((id: HomeCardId) => {
    return (event: DragEvent<HTMLSpanElement>) => {
      event.dataTransfer.setData("text/plain", id);
      event.dataTransfer.effectAllowed = "move";
    };
  }, []);

  const handleDragOver = useCallback((id: HomeCardId) => {
    return (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      setDragOverId(id);
    };
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback((id: HomeCardId) => {
    return (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const fromId = event.dataTransfer.getData("text/plain") as HomeCardId;
      if (!fromId) return;

      setLayout((prev) => moveLayoutItem(prev, fromId, id));
      setDragOverId(null);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    const json = JSON.stringify(layout, null, 2);

    try {
      await navigator.clipboard.writeText(json);
      setCopyLabel("Copied");
      setTimeout(() => setCopyLabel("Copy layout JSON"), 1600);
    } catch {
      setShowExport(true);
    }
  }, [layout]);

  const fetchLatestLayout = useCallback(async () => {
    const response = await fetch("/api/layout", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load layout.");
    }
    const data = (await response.json()) as HomeLayoutItem[];
    return normalizeLayout(data, initialLayout);
  }, [initialLayout]);

  const handleApply = useCallback(async () => {
    if (!editKey) {
      setApplyState("error");
      setApplyMessage("Missing key in URL.");
      return;
    }

    try {
      setApplyState("saving");
      setApplyMessage("Saving to file...");
      const response = await fetch("/api/layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout, key: editKey }),
      });

      if (!response.ok) {
        throw new Error("Failed to save layout.");
      }

      try {
        const latest = await fetchLatestLayout();
        setLayout(latest);
      } catch {
        // Ignore fetch errors; layout is already updated locally.
      }

      setApplyState("saved");
      setApplyMessage("Saved to content/layout/home-layout.json");
      setTimeout(() => {
        setApplyState("idle");
        setApplyMessage("");
      }, 2000);
    } catch {
      setApplyState("error");
      setApplyMessage("Save failed. Check server logs.");
    }
  }, [editKey, layout, fetchLatestLayout]);

  const handleReset = useCallback(async () => {
    window.localStorage.removeItem(LAYOUT_STORAGE_KEY);

    try {
      const latest = await fetchLatestLayout();
      setLayout(latest);
      return;
    } catch {
      setLayout(normalizeLayout(initialLayout, initialLayout));
    }
  }, [fetchLatestLayout, initialLayout]);

  const renderCard = (item: HomeLayoutItem) => {
    const cardClassName = `relative ${
      editMode ? "ring-1 ring-te-orange/30" : ""
    } ${dragOverId === item.id ? "ring-2 ring-te-orange" : ""}`;
    const sharedProps = {
      onDragOver: editMode ? handleDragOver(item.id) : undefined,
      onDrop: editMode ? handleDrop(item.id) : undefined,
      onDragLeave: editMode ? handleDragLeave : undefined,
      backgroundImage: item.backgroundImage,
    };
    const motionProps = editMode
      ? {
          layout: true as const,
          layoutId: item.id,
          transition: {
            layout: { type: "spring" as const, bounce: 0.25, duration: 0.5 },
          },
        }
      : {};

    const controls = editMode ? (
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 rounded-full border border-te-gray bg-te-beige/95 px-2 py-1 text-[10px] uppercase tracking-wide text-te-dark/70 shadow-sm">
        <span
          draggable
          onDragStart={handleDragStart(item.id)}
          className="cursor-move font-semibold text-te-dark"
          title="Drag to move"
        >
          Drag
        </span>
        <label className="sr-only" htmlFor={`size-${item.id}`}>
          Size
        </label>
        <select
          id={`size-${item.id}`}
          value={item.size}
          onChange={(event) =>
            updateSize(item.id, event.target.value as CardSize)
          }
          className="rounded-full border border-te-gray bg-white px-2 py-0.5 text-[10px] uppercase tracking-wide text-te-dark"
        >
          {SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    ) : null;

    switch (item.id) {
      case "profile":
        return (
          <BentoCard
            {...sharedProps}
            {...motionProps}
            size={item.size}
            variant="highlight"
            className={`flex flex-col justify-between ${cardClassName}`}
          >
            {controls}
            <div>
              <Badge variant="orange">Polymath</Badge>
              <h1 className="text-2xl md:text-4xl font-bold leading-tight mt-3 sm:mt-4">
                Ashwin Kumar Uppala
              </h1>
              <p className="mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base text-te-beige/80 leading-relaxed line-clamp-2">
                Head of Community at{" "}
                <a
                  href="https://devfolio.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-te-orange hover:underline"
                >
                  Devfolio
                </a>
                . Building developer communities, shipping side projects, and
                speaking at events.
              </p>
            </div>
            <div className="mt-4">
              <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs md:text-sm text-te-beige/60 mb-2">
                    Previously at
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <Badge>GitHub</Badge>
                    <Badge>MLH</Badge>
                    <Badge>CodeDay</Badge>
                  </div>
                </div>
                <div className="md:text-right">
                  <p className="text-[11px] sm:text-xs md:text-sm text-te-beige/60 mb-2">
                    Connect
                  </p>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    {socials.map((social) => (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                        className="inline-flex items-center gap-2 rounded-full border border-te-beige/20 bg-te-beige/10 px-2 py-1 text-xs font-medium text-te-beige transition-colors hover:bg-te-beige hover:text-te-dark sm:px-2.5"
                      >
                        <span className="text-sm">{social.icon}</span>
                        <span className="sr-only">{social.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>
        );
      case "liveActivity":
        return (
          <BentoCard
            {...sharedProps}
            {...motionProps}
            size={item.size}
            className={cardClassName}
          >
            {controls}
            <div className="flex flex-col h-full">
              <h3 className="text-sm font-semibold text-te-dark/60 mb-3">
                Live Activity
              </h3>
              <div className="space-y-3 flex-1">
                <div>
                  <p className="text-xs text-te-dark/40 mb-2">
                    🎵 Listening to
                  </p>
                  <SpotifyNowPlaying />
                </div>
                <div className="border-t border-te-gray pt-3">
                  <p className="text-xs text-te-dark/40 mb-2">🎮 Playing</p>
                  <GamingStatus />
                </div>
              </div>
            </div>
          </BentoCard>
        );
      case "work":
        return (
          <BentoCard
            {...sharedProps}
            {...motionProps}
            size={item.size}
            href={editMode ? undefined : "/work"}
            variant="subtle"
            className={cardClassName}
          >
            {controls}
            <div className="h-full flex flex-col justify-between">
              <span className="inline-block bg-te-dark text-te-beige px-3 py-1 text-lg md:text-2xl font-bold transition-all duration-300 group-hover:bg-te-beige group-hover:text-te-dark w-fit">
                💼 Work
              </span>
              <p className="text-sm text-te-beige mt-2">
                Experience timeline
              </p>
            </div>
          </BentoCard>
        );
      case "quote":
        return (
          <BentoCard
            {...sharedProps}
            {...motionProps}
            size={item.size}
            className={cardClassName}
          >
            {controls}
            <div className="h-full flex items-center justify-center text-center">
              <blockquote className="text-lg md:text-xl font-medium italic">
                "Anything added dilutes everything else."
              </blockquote>
            </div>
          </BentoCard>
        );
      case "projects":
        return (
          <BentoCard
            {...sharedProps}
            {...motionProps}
            size={item.size}
            href={editMode ? undefined : "/projects"}
            variant="subtle"
            className={cardClassName}
          >
            {controls}
            <div className="h-full flex flex-col justify-between">
              <span className="inline-block bg-te-dark text-te-beige px-3 py-1 text-lg md:text-2xl font-bold transition-all duration-300 group-hover:bg-te-beige group-hover:text-te-dark w-fit">
                🚀 Projects
              </span>
              <p className="text-sm text-te-beige mt-2">
                Things I've built
              </p>
            </div>
          </BentoCard>
        );
      case "talks":
        return (
          <BentoCard
            {...sharedProps}
            {...motionProps}
            size={item.size}
            href={editMode ? undefined : "/talks"}
            variant="subtle"
            className={cardClassName}
          >
            {controls}
            <div className="h-full flex flex-col justify-between">
              <span className="inline-block bg-te-dark text-te-beige px-3 py-1 text-lg md:text-2xl font-bold transition-all duration-300 group-hover:bg-te-beige group-hover:text-te-dark w-fit">
                🎤 Talks
              </span>
              <p className="text-sm text-te-beige mt-2">
                Past community & conference talks
              </p>
            </div>
          </BentoCard>
        );
      case "latestBlog":
        if (!data.latestPost) return null;
        return (
          <BentoCard
            {...sharedProps}
            {...motionProps}
            size={item.size}
            href={editMode ? undefined : `/blog/${data.latestPost.slug}`}
            variant="subtle"
            className={`group flex flex-col justify-between overflow-hidden ${cardClassName}`}
          >
            {controls}
            <div>
              <p className="text-xs text-te-dark/50">Latest blog</p>
              <h3 className="text-base sm:text-lg font-semibold mt-2 leading-snug line-clamp-4 group-hover:text-te-orange transition-colors">
                {data.latestPost.title}
              </h3>
              <p className="text-sm text-te-dark/60 mt-2 line-clamp-2">
                {data.latestPost.description}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-te-dark/50 mt-4">
              <span>{data.latestPost.dateLabel}</span>
              <span className="text-te-dark/70 group-hover:text-te-orange transition-colors">
                Read →
              </span>
            </div>
          </BentoCard>
        );
      case "featuredProject":
        if (!data.featuredProject) return null;
        return (
          <BentoCard
            {...sharedProps}
            {...motionProps}
            size={item.size}
            href={editMode ? undefined : "/projects"}
            variant="subtle"
            className={`overflow-hidden ${cardClassName}`}
          >
            {controls}
            <div className="h-full flex flex-col justify-between">
              <div className="text-3xl">🚧</div>
              <div>
                <p className="text-xs text-te-dark/50">Featured project</p>
                <h3 className="font-semibold mt-1">
                  {data.featuredProject.name}
                </h3>
                <p className="text-sm text-te-dark/60 mt-2 line-clamp-4">
                  {data.featuredProject.description}
                </p>
              </div>
            </div>
          </BentoCard>
        );
      case "now":
        return (
          <BentoCard
            {...sharedProps}
            {...motionProps}
            size={item.size}
            variant="subtle"
            className={cardClassName}
          >
            {controls}
            <div className="h-full flex flex-col justify-between">
              <div className="text-3xl">🧭</div>
              <div>
                <h3 className="font-semibold">Now</h3>
                <p className="text-sm text-te-dark/60 mt-2">
                  Building community at Devfolio and writing more about the
                  systems that make builders thrive.
                </p>
              </div>
            </div>
          </BentoCard>
        );
      case "shot":
        if (!data.shot) return null;
        return (
          <BentoCard
            {...sharedProps}
            {...motionProps}
            size={item.size}
            variant="subtle"
            className={`p-0 overflow-hidden ${cardClassName}`}
          >
            {controls}
            <div className="h-full flex flex-col">
              <div className="flex-1 relative">
                <img
                  src={data.shot.image}
                  alt={data.shot.caption || "Shot of the week"}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              {data.shot.caption && (
                <div className="p-4 bg-te-beige">
                  <p className="text-xs text-te-dark/50 mb-1">
                    {data.shot.date || "Shot of the week"}
                  </p>
                  <p className="text-sm text-te-dark">
                    {data.shot.caption}
                  </p>
                </div>
              )}
            </div>
          </BentoCard>
        );
      default:
        return null;
    }
  };

  return (
    <MotionConfig
      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
    >
      <LayoutGroup id="home-bento">
        <div>
          {editMode && (
            <div className="mb-4 rounded-te border border-te-gray bg-white/70 p-3 text-sm text-te-dark">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">Edit mode</p>
                  <p className="text-xs text-te-dark/60">
                    Drag cards by the handle to reorder and use the size menu to
                    resize. Copy the layout JSON into
                    <span className="font-medium">
                      {" "}
                      content/layout/home-layout.json
                    </span>
                    .
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-full border border-te-gray bg-te-beige px-3 py-1 text-xs font-semibold uppercase tracking-wide text-te-dark hover:bg-te-gray"
                  >
                    {copyLabel}
                  </button>
                  <button
                    type="button"
                    onClick={handleApply}
                    className="rounded-full border border-te-gray bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-te-dark hover:bg-te-gray"
                  >
                    {applyState === "saving" ? "Applying..." : "Apply to file"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExport((prev) => !prev)}
                    className="rounded-full border border-te-gray bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-te-dark hover:bg-te-gray"
                  >
                    {showExport ? "Hide JSON" : "Show JSON"}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-full border border-te-gray bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-te-dark hover:bg-te-gray"
                  >
                    Reset
                  </button>
                </div>
              </div>
              {applyMessage && (
                <p
                  className={`mt-2 text-xs ${
                    applyState === "error" ? "text-red-600" : "text-te-dark/60"
                  }`}
                >
                  {applyMessage}
                </p>
              )}
              {showExport && (
                <textarea
                  readOnly
                  className="mt-3 w-full rounded-te border border-te-gray bg-te-beige/50 p-3 text-xs text-te-dark"
                  rows={8}
                  value={JSON.stringify(layout, null, 2)}
                />
              )}
            </div>
          )}
          <BentoGrid>
            {visibleLayout.map((item) => (
              <div key={item.id} className="contents">
                {renderCard(item)}
              </div>
            ))}
          </BentoGrid>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}
