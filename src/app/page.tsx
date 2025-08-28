"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomStore } from "@/store/customStore";
import DesignCanvas from "@/components/DesignCanvas";
import ControlPanel from "@/components/ControlPanel";
import { ShareButton } from "@/components/ShareButton";
import { PaletteDesignPrompt } from "@/components/PaletteDesignPrompt";
import { CompanyLinks } from "@/components/CompanyLinks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";

interface SharedDesignData {
  shareId: string;
  designData: Record<string, unknown>;
  createdAt: string;
  accessCount: number;
}

export default function PreviewPage() {
  const [mounted, setMounted] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const {
    viewSettings,
    backgroundColor,
    setShowUIControls,
    loadFromDatabaseData,
    dimensions,
    selectedDesign,
    colorPattern,
  } = useCustomStore();
  const { showUIControls } = viewSettings;
  const router = useRouter();

  const [sharedDesign, setSharedDesign] = useState<SharedDesignData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Client-side only search params check
  useEffect(() => {
    setMounted(true);
    // Only access search params on client side
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      setShareId(urlParams.get("shareId"));
    }

    // Trigger resize event to ensure canvas renders correctly
    const resizeEvent = new Event("resize");
    window.dispatchEvent(resizeEvent);
  }, []);

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

    if (mounted && shareId) {
      loadSharedDesign(shareId);
    }
  }, [mounted, shareId, loadFromDatabaseData]);

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
        <div className="text-center">
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md mx-4 p-6 text-center">
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
      className="w-full h-screen relative"
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
      />

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

      {/* Palette Design Prompt */}
      {!shareId && <PaletteDesignPrompt />}
    </div>
  );
}
