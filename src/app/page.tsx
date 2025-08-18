"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCustomStore } from "@/store/customStore";
import DesignCanvas from "@/components/DesignCanvas";
import ControlPanel from "@/components/ControlPanel";
import { ShareButton } from "@/components/ShareButton";
import { PaletteDesignPrompt } from "@/components/PaletteDesignPrompt";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Calendar, Eye, Copy, Check } from "lucide-react";

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
      {/* Shared Design Info Card - only show if there's a shared design */}
      {shareId && sharedDesign && (
        <div className="absolute top-20 left-6 z-40 max-w-sm">
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-purple-600 dark:text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Shared Design
                </h3>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(sharedDesign.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Eye className="w-4 h-4" />
                  <span>{sharedDesign.accessCount} views</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Design:
                  </span>
                  <Badge variant="secondary">{selectedDesign}</Badge>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Size:
                  </span>
                  <Badge variant="outline">
                    {dimensions.width * 3}&quot; × {dimensions.height * 3}&quot;
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pattern:
                  </span>
                  <Badge variant="outline">{colorPattern}</Badge>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="w-full"
                >
                  {copied ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

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
