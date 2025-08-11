"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCustomStore } from "@/store/customStore";
import DesignCanvas from "@/components/DesignCanvas";
import ControlPanel from "@/components/ControlPanel";
import Navbar from "@/components/Navbar";
import { ShareButton } from "@/components/ShareButton";

export default function PreviewPage() {
  const [mounted, setMounted] = useState(false);
  const { viewSettings, backgroundColor, setShowUIControls, loadFromDatabaseData } = useCustomStore();
  const { showUIControls } = viewSettings;
  const router = useRouter();
  const searchParams = useSearchParams();
  const shareId = searchParams.get("shareId");
  const [shareLoaded, setShareLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Trigger resize event to ensure canvas renders correctly
    const resizeEvent = new Event("resize");
    window.dispatchEvent(resizeEvent);
  }, []);

  // Load shared design from query param and then clean the URL
  useEffect(() => {
    const loadSharedDesign = async (id: string) => {
      try {
        const res = await fetch(`/api/shared-designs?id=${encodeURIComponent(id)}`);
        if (!res.ok) return; // Silently ignore if not found/expired
        const data = await res.json();
        loadFromDatabaseData(data.designData);
      } catch (e) {
        // no-op
      } finally {
        // remove shareId from URL after processing to avoid reloading on refresh
        router.replace("/");
        setShareLoaded(true);
      }
    };

    if (mounted && shareId && !shareLoaded) {
      loadSharedDesign(shareId);
    }
  }, [mounted, shareId, shareLoaded, router, loadFromDatabaseData]);

  if (!mounted) return null;

  return (
    <div
      className="w-full h-screen relative"
      style={{ background: backgroundColor }}
    >
      <Navbar />
      {/* Main canvas */}
      <div className="w-full h-full">
        <DesignCanvas className="w-full h-full" />
      </div>
      {showUIControls ? (
        <ControlPanel />
      ) : (
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <ShareButton />
          <button
            aria-label="Show settings"
            onClick={() => setShowUIControls(true)}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow hover:bg-white dark:hover:bg-gray-800"
          >
            Settings
          </button>
        </div>
      )}
    </div>
  );
}
