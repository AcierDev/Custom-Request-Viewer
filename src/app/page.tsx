"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomStore } from "@/store/customStore";
import DesignCanvas from "@/components/DesignCanvas";
import ControlPanel from "@/components/ControlPanel";
import { ShareButton } from "@/components/ShareButton";
import { PaletteDesignPrompt } from "@/components/PaletteDesignPrompt";
import { CompanyLinks } from "@/components/CompanyLinks";
import { MobileTouchHint } from "@/components/MobileTouchHint";
import { CompareShelfWithThumbnails } from "@/components/CompareShelfWithThumbnails";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, Settings, Share2 } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useCompareStore } from "@/store/compareStore";

interface SharedDesignData {
  shareId: string;
  designData: Record<string, unknown>;
  createdAt: string;
  accessCount: number;
}

export default function PreviewPage() {
  const [mounted, setMounted] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [setId, setSetId] = useState<string | null>(null);
  const {
    viewSettings,
    backgroundColor,
    setShowUIControls,
    loadFromDatabaseData,
    loadFromShareableData,
    clearSharedDesignTracking,
    dimensions,
    selectedDesign,
    colorPattern,
    useMini,
  } = useCustomStore();
  const { showUIControls } = viewSettings;
  const router = useRouter();
  const isMobile = useIsMobile();

  const [sharedDesign, setSharedDesign] = useState<SharedDesignData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { designs: shelfDesigns, activeDesignId } = useCompareStore();

  // Client-side only search params check
  useEffect(() => {
    setMounted(true);
    // Only access search params on client side
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      setShareId(urlParams.get("shareId"));
      setSetId(urlParams.get("setId"));
    }

    // Trigger resize event to ensure canvas renders correctly
    const resizeEvent = new Event("resize");
    window.dispatchEvent(resizeEvent);
  }, []);

  // Auto-hide controls on mobile for shared designs
  useEffect(() => {
    if (mounted && isMobile && (shareId || setId)) {
      // On mobile with a shared design, hide controls by default
      setShowUIControls(false);
    }
  }, [mounted, isMobile, shareId, setId, setShowUIControls]);

  // Load shared design from query param
  useEffect(() => {
    const loadSharedDesign = async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/shared-designs?id=${encodeURIComponent(id)}`
        );

        if (!res.ok) {
          if (res.status === 404) {
            setError(
              "This shared design could not be found. It may have expired or been removed."
            );
          } else {
            setError("Failed to load the shared design. Please try again.");
          }
          return;
        }

        const data: SharedDesignData = await res.json();
        setSharedDesign(data);

        // Load the design data into the store
        const success = loadFromDatabaseData(data.designData);
        if (!success) {
          setError("Failed to load the design configuration.");
        }
      } catch (err) {
        console.error("Error loading shared design:", err);
        setError("Failed to load the shared design. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (mounted && shareId && !setId) {
      loadSharedDesign(shareId);
    }
  }, [mounted, shareId, setId, loadFromDatabaseData]);

  // Load shared design set from query param
  useEffect(() => {
    const loadSharedSet = async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/shared-design-sets?id=${encodeURIComponent(id)}`
        );

        if (!res.ok) {
          if (res.status === 404) {
            setError(
              "This shared design set could not be found. It may have expired or been removed."
            );
          } else {
            setError("Failed to load the shared design set. Please try again.");
          }
          return;
        }

        const data = await res.json();
        useCompareStore.getState().hydrateFromSharedSet(data);

        // This is a multi-design view; don't show shared-design revert UI.
        clearSharedDesignTracking();
      } catch (err) {
        console.error("Error loading shared design set:", err);
        setError("Failed to load the shared design set. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (mounted && setId) {
      loadSharedSet(setId);
    }
  }, [mounted, setId, clearSharedDesignTracking]);

  // When a shelf design is selected, load it into the main viewer.
  useEffect(() => {
    if (!mounted) return;
    if (!activeDesignId) return;

    const active = shelfDesigns.find((d) => d.id === activeDesignId);
    if (!active) return;

    clearSharedDesignTracking();
    loadFromShareableData(JSON.stringify(active.designData));
  }, [
    mounted,
    activeDesignId,
    shelfDesigns,
    loadFromShareableData,
    clearSharedDesignTracking,
  ]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center px-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading shared design...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Design Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="w-full h-[calc(100vh-4rem)] relative overflow-hidden"
      style={{ background: backgroundColor }}
    >
      {/* Company Links Component */}
      <CompanyLinks
        sharedDesign={sharedDesign}
        selectedDesign={selectedDesign}
        dimensions={dimensions}
        colorPattern={colorPattern}
        onCopyLink={handleCopyLink}
        copied={copied}
        useMini={useMini}
      />

      {/* Main canvas */}
      <div className="w-full h-full">
        <DesignCanvas className="w-full h-full" />
      </div>

      {/* Touch hint for mobile users viewing shared designs */}
      {isMobile && (shareId || setId) && <MobileTouchHint />}

      {/* Control Panel or Floating Controls */}
      {/* Control Panel (Retractable) */}
      <ControlPanel />

      {/* Palette Design Prompt - only show when not viewing a shared design */}
      {!shareId && !setId && <PaletteDesignPrompt />}

      {/* Design shelf for multi-design viewing / local compare */}
      <CompareShelfWithThumbnails />
    </div>
  );
}
