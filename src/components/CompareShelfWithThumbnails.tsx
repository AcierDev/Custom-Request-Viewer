"use client";

import { useEffect, useMemo, useState } from "react";
import { CompareShelf } from "@/components/CompareShelf";
import { DesignThumbnailRenderer } from "@/components/DesignThumbnailRenderer";
import { useCompareStore } from "@/store/compareStore";
import { hashString } from "@/lib/hash";

function getThumbnailCacheKey(designData: unknown) {
  try {
    return `thumb:v1:${hashString(JSON.stringify(designData))}`;
  } catch {
    return null;
  }
}

export function CompareShelfWithThumbnails() {
  const { designs, setThumbnail } = useCompareStore();
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  // Opportunistically hydrate thumbnails from sessionStorage (fast path).
  useEffect(() => {
    if (typeof window === "undefined") return;

    designs.forEach((d) => {
      if (d.thumbnailDataUrl) return;
      const key = getThumbnailCacheKey(d.designData);
      if (!key) return;

      const cached = window.sessionStorage.getItem(key);
      if (cached) setThumbnail(d.id, cached);
    });
  }, [designs, setThumbnail]);

  const nextToGenerate = useMemo(() => {
    if (generatingId) return null;
    return designs.find((d) => !d.thumbnailDataUrl) ?? null;
  }, [designs, generatingId]);

  useEffect(() => {
    if (!nextToGenerate) return;
    setGeneratingId(nextToGenerate.id);
  }, [nextToGenerate]);

  const generatingDesign = useMemo(() => {
    if (!generatingId) return null;
    return designs.find((d) => d.id === generatingId) ?? null;
  }, [designs, generatingId]);

  return (
    <>
      <CompareShelf />
      {generatingDesign && (
        <DesignThumbnailRenderer
          designData={generatingDesign.designData}
          onReady={(dataUrl) => {
            setThumbnail(generatingDesign.id, dataUrl);
            if (typeof window !== "undefined") {
              const key = getThumbnailCacheKey(generatingDesign.designData);
              if (key) window.sessionStorage.setItem(key, dataUrl);
            }
            setGeneratingId(null);
          }}
        />
      )}
    </>
  );
}



