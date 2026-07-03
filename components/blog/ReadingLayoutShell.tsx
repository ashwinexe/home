"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type ReadingLayout = "compact" | "normal" | "wide";

const STORAGE_KEY = "ashwin-home:blog-reading-layout";

const layoutOptions: Array<{
  value: ReadingLayout;
  label: string;
  className: string;
}> = [
  {
    value: "compact",
    label: "Compact",
    className: "max-w-2xl",
  },
  {
    value: "normal",
    label: "Normal",
    className: "max-w-3xl",
  },
  {
    value: "wide",
    label: "Wide",
    className: "max-w-5xl",
  },
];

function isReadingLayout(value: string | null): value is ReadingLayout {
  return value === "compact" || value === "normal" || value === "wide";
}

export function ReadingLayoutShell({
  children,
}: {
  children: ReactNode;
}) {
  const [layout, setLayout] = useState<ReadingLayout>("normal");
  const [hasMounted, setHasMounted] = useState(false);
  const widthClass =
    layoutOptions.find((option) => option.value === layout)?.className ??
    "max-w-3xl";

  useEffect(() => {
    const savedLayout = window.localStorage.getItem(STORAGE_KEY);

    if (isReadingLayout(savedLayout)) {
      setLayout(savedLayout);
    }

    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, layout);
  }, [hasMounted, layout]);

  return (
    <div className="relative">
      <div
        className={cn(
          "blog-reading-shell mx-auto transition-[max-width] duration-200",
          widthClass,
        )}
        data-reading-layout={layout}
      >
        {children}
      </div>

      <aside
        aria-label="Reading layout"
        className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-te border border-te-dark bg-te-beige p-1 shadow-[4px_4px_0_#1a1a1a] md:bottom-auto md:left-auto md:right-5 md:top-1/2 md:-translate-y-1/2 md:translate-x-0"
      >
        <div className="flex gap-1 md:flex-col">
          {layoutOptions.map((option) => {
            const isActive = option.value === layout;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => setLayout(option.value)}
                className={cn(
                  "min-w-20 rounded-[6px] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
                  isActive
                    ? "bg-te-dark text-te-beige"
                    : "text-te-dark hover:bg-te-gray",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
