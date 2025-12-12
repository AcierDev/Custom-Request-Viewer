"use client";

import { useState } from "react";
import { useCompareStore } from "@/store/compareStore";
import { X, Layers, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

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
  
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand when a new design is added (optional UX improvement)
  // useEffect(() => {
  //   if (designs.length > 0) setIsExpanded(true);
  // }, [designs.length]);

  if (designs.length === 0) return null;

  const currentIndex = designs.findIndex((d) => d.id === activeDesignId);

  const handlePrevious = () => {
    if (currentIndex === -1) {
      if (designs.length > 0) setActiveDesignId(designs[designs.length - 1].id);
      return;
    }
    const prevIndex = (currentIndex - 1 + designs.length) % designs.length;
    setActiveDesignId(designs[prevIndex].id);
  };

  const handleNext = () => {
    if (currentIndex === -1) {
      if (designs.length > 0) setActiveDesignId(designs[0].id);
      return;
    }
    const nextIndex = (currentIndex + 1) % designs.length;
    setActiveDesignId(designs[nextIndex].id);
  };

  return (
    <>
      {/* Navigation Buttons (Floating) */}
      {designs.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all"
            aria-label="Previous design"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all"
            aria-label="Next design"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Retractable Shelf Container */}
      <div
        className={[
          "fixed left-0 right-0 bottom-0 z-50 transition-transform duration-300 ease-in-out",
          isExpanded ? "translate-y-0" : "translate-y-[calc(100%-48px)]", // 48px is approx handle height
          className ?? "",
        ].join(" ")}
      >
        {/* Toggle Handle */}
        <div className="flex justify-center -mb-[1px]">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 rounded-t-xl bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-t border-x border-gray-200/70 dark:border-gray-800/70 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] hover:bg-white dark:hover:bg-gray-900 transition-colors"
          >
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Design Shelf ({designs.length})
            </span>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>

        {/* Shelf Content */}
        <div className="bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-t border-gray-200/70 dark:border-gray-800/70 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]">
          <div className="px-3 py-2 flex items-center justify-between gap-3 border-b border-gray-200/50 dark:border-gray-800/50">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {designs.length} design{designs.length === 1 ? "" : "s"} saved for comparison
              </span>
            </div>

            <button
              onClick={clearShelf}
              className="text-xs px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="p-4 overflow-x-auto">
            <div className="flex gap-4 pb-2">
              {designs.map((d, idx) => {
                const isActive = d.id === activeDesignId;
                return (
                  <button
                    key={d.id}
                    onClick={() => setActiveDesignId(d.id)}
                    className={[
                      "relative group shrink-0 w-32 transition-all duration-200",
                      "rounded-xl border bg-white dark:bg-gray-900 shadow-sm hover:shadow-md",
                      isActive
                        ? "border-purple-500 dark:border-purple-400 ring-2 ring-purple-500/20 scale-105"
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700",
                    ].join(" ")}
                    aria-label={`Select design ${idx + 1}`}
                  >
                    <div className="w-full aspect-[4/3] rounded-t-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative">
                      {d.thumbnailDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={d.thumbnailDataUrl}
                          alt={d.label ?? `Design ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 p-2">
                          <Layers className="w-6 h-6 text-gray-300 dark:text-gray-700" />
                        </div>
                      )}
                      
                      {isActive && (
                        <div className="absolute inset-0 bg-purple-500/10 dark:bg-purple-400/10 flex items-center justify-center">
                          <div className="bg-white/90 dark:bg-gray-900/90 rounded-full p-1 shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="px-3 py-2 text-left">
                      <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {d.label || `Design ${idx + 1}`}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-500 truncate mt-0.5">
                        {d.designData.dimensions.width}×
                        {d.designData.dimensions.height} • {d.designData.selectedDesign}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeDesign(d.id);
                      }}
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 scale-90 group-hover:scale-100 shadow-md rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-1.5"
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
      </div>
    </>
  );
}


