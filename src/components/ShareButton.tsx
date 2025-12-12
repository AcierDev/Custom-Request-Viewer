"use client";

import { useState } from "react";
import { useCustomStore } from "@/store/customStore";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function ShareButton() {
  const createSharedDesign = useCustomStore(
    (state) => state.createSharedDesign
  );

  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleGenerateLink = async () => {
    setIsGenerating(true);

    try {
      const result = await createSharedDesign();

      if (result.success && result.shareId) {
        // Create new URL with shareId parameter
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("shareId", result.shareId);
        // Ensure single-design links don't carry multi-design params
        newUrl.searchParams.delete("setId");

        // Update the URL without triggering a page reload
        router.push(newUrl.pathname + newUrl.search);

        // Copy the new URL to clipboard
        await navigator.clipboard.writeText(newUrl.toString());
        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } else {
        alert(result.error || "Failed to create shared design");
      }
    } catch (error) {
      console.error("Error generating link:", error);
      alert("Failed to generate shareable link");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      alert("Failed to copy link to clipboard");
    }
  };

  const currentShareId = searchParams.get("shareId");

  return (
    <div className="flex items-center gap-2">
      {currentShareId ? (
        <>
          <Button
            variant="outline"
            onClick={handleCopyLink}
            className={
              copied
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            }
          >
            {copied ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </>
      ) : (
        <Button
          onClick={handleGenerateLink}
          disabled={isGenerating}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Share2 className="mr-2 h-4 w-4" />
              Share Design
            </>
          )}
        </Button>
      )}
    </div>
  );
}
