"use client";

import { useState } from "react";
import { useCustomStore } from "@/store/customStore";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, Loader2 } from "lucide-react";

export function ShareButton() {
  const createSharedDesign = useCustomStore(
    (state) => state.createSharedDesign
  );

  const [shareableLink, setShareableLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareId, setShareId] = useState("");

  const handleGenerateLink = async () => {
    setIsGenerating(true);

    try {
      const result = await createSharedDesign();

      if (result.success && result.shareUrl) {
        setShareableLink(result.shareUrl);
        setShareId(result.shareId || "");
        alert("Share link generated successfully!");
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    alert("Link copied to clipboard!");

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  if (!shareableLink) {
    return (
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
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={handleCopyLink}
        className={copied ? "bg-green-600 hover:bg-green-700 text-white" : ""}
      >
        {copied ? (
          <Check className="h-4 w-4 mr-2" />
        ) : (
          <Copy className="h-4 w-4 mr-2" />
        )}
        {copied ? "Copied!" : "Copy Link"}
      </Button>
      <Button
        variant="outline"
        onClick={handleGenerateLink}
        className="text-xs"
      >
        New Link
      </Button>
    </div>
  );
}
