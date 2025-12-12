"use client";

import { useCompareStore } from "@/store/compareStore";
import { X, Layers } from "lucide-react";

type CompareShelfProps = {
  className?: string;
};

export function CompareShelf({ className }: CompareShelfProps) {
  const {
    designs,
    activeDesignId,
    setActiveDesignId,
    removeDesign,
    clearShelf,
  } = useCompareStore();

  if (designs.length === 0) return null;

  return (
    <div
      className={[
        "absolute left-0 right-0 bottom-0 z-40",
        "bg-white/70 dark:bg-gray-950/60 backdrop-blur-xl",
        "border-t border-gray-200/70 dark:border-gray-800/70",
        className ?? "",
      ].join(" ")}
    >
      <div className="px-3 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 text-purple-700 dark:text-purple-300" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              Design Shelf
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {designs.length} design{designs.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        <button
          onClick={clearShelf}
          className="text-xs px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 hover:bg-white dark:hover:bg-gray-900 transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="px-3 pb-3">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {designs.map((d, idx) => {
            const isActive = d.id === activeDesignId;
            return (
              <button
                key={d.id}
                onClick={() => setActiveDesignId(d.id)}
                className={[
                  "relative group shrink-0 w-28",
                  "rounded-lg border bg-white/70 dark:bg-gray-900/60",
                  isActive
                    ? "border-purple-400 dark:border-purple-500 ring-2 ring-purple-300/40"
                    : "border-gray-200/70 dark:border-gray-800/70 hover:border-gray-300 dark:hover:border-gray-700",
                ].join(" ")}
                aria-label={`Select design ${idx + 1}`}
              >
                <div className="w-full aspect-[4/3] rounded-t-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {d.thumbnailDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={d.thumbnailDataUrl}
                      alt={d.label ?? `Design ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 px-2 text-center">
                      Thumbnail pending
                    </span>
                  )}
                </div>

                <div className="px-2 py-1.5 text-left">
                  <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                    {d.label || `Design ${idx + 1}`}
                  </div>
                  <div className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                    {d.designData.dimensions.width}×
                    {d.designData.dimensions.height} blocks
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeDesign(d.id);
                  }}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-md bg-black/50 text-white p-1"
                  aria-label="Remove design from shelf"
                >
                  <X className="w-3 h-3" />
                </button>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

