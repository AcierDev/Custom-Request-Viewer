"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCustomStore } from "@/store/customStore";
import { useCompareStore } from "@/store/compareStore";
import {
  Share2,
  Copy,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  AlertCircle,
  X,
  GripHorizontal,
  Layers,
  Plus,
} from "lucide-react";
import { ItemDesigns } from "@/typings/types";
import { getBackgroundColorForLighting, getBlockSizeInches } from "@/lib/utils";
import { SizeSelector } from "@/components/ui/size-selector";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/useIsMobile";

const WALL_PRESETS: Array<{ name: string; hex: string; primary?: boolean }> = [
  // { name: "White", hex: "#ffffff" },
  { name: "Warm White", hex: "#faf7f2", primary: true },
  // { name: "Greige", hex: "#dedad2" },
  // { name: "Soft Beige", hex: "#efe7dd" },
  { name: "Pale Blue", hex: "#e6f0f7", primary: true },
  { name: "Sage", hex: "#e6efe6", primary: true },
  { name: "Charcoal", hex: "#374151", primary: true },
  { name: "Midnight", hex: "#111827", primary: true },
];

const BRIGHTNESS_PRESETS = [
  { label: "Low", value: 0.7 },
  { label: "Medium", value: 1.0 },
  { label: "High", value: 1.3 },
];

const SHADOW_PRESETS = [
  { label: "Low", value: 0.1 },
  { label: "Medium", value: 0.3 },
  { label: "High", value: 0.6 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

type LightingPresetKey = "gallery" | "contrast" | "cozy" | "sunlit";

const LIGHTING_PRESETS: Record<
  LightingPresetKey,
  {
    label: string;
    ambient: number;
    key: number;
    fill: number;
    back: number;
    rim: number;
  }
> = {
  gallery: {
    label: "Gallery Neutral",
    ambient: 1.0,
    key: 0.7,
    fill: 0.6,
    back: 0.3,
    rim: 0.5,
  },
  contrast: {
    label: "High Contrast",
    ambient: 0.6,
    key: 1.2,
    fill: 0.3,
    back: 0.5,
    rim: 0.7,
  },
  cozy: {
    label: "Cozy Evening",
    ambient: 0.8,
    key: 0.5,
    fill: 0.5,
    back: 0.25,
    rim: 0.35,
  },
  sunlit: {
    label: "Sunlit Room",
    ambient: 1.4,
    key: 1.0,
    fill: 0.7,
    back: 0.5,
    rim: 0.6,
  },
};

export function ControlPanel() {
  const {
    backgroundColor,
    setBackgroundColor,
    lighting,
    setLighting,
    dimensions,
    sizeUnit,
    setSizeUnit,
    setDimensionsByUnit,
    viewSettings,
    setShowUIControls,
    createSharedDesign,
    selectedDesign,
    setSelectedDesign,
    setSelectedDesignWithSharedHandling,
    colorPattern,
    setColorPattern,
    orientation,
    setOrientation,
    isReversed,
    setIsReversed,
    isRotated,
    setIsRotated,
    useMini,
    setUseMini,
    originalSharedData,
    hasChangesFromShared,
    revertToSharedDesign,
    setShowRuler,
  } = useCustomStore();

  // Mobile detection
  const isMobile = useIsMobile();

  const [shareableLink, setShareableLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareId, setShareId] = useState("");
  const [shareMessage, setShareMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const {
    designs: shelfDesigns,
    addCurrentDesignToShelf,
    createSharedDesignSet,
    setId: sharedSetId,
  } = useCompareStore();

  const [shelfShareableLink, setShelfShareableLink] = useState("");
  const [isGeneratingSet, setIsGeneratingSet] = useState(false);
  const [copiedSetLink, setCopiedSetLink] = useState(false);
  const showShareMessage = (
    type: "success" | "error" | "info",
    text: string,
    timeoutMs = 3000
  ) => {
    setShareMessage({ type, text });
    if (timeoutMs > 0) {
      window.setTimeout(() => setShareMessage(null), timeoutMs);
    }
  };
  // Advanced Customization (shared design) toggle
  const [showAdvanced, setShowAdvanced] = useState(false);
  // Lighting advanced toggle (separate to avoid conflicts)
  const [showLightingAdvanced, setShowLightingAdvanced] = useState(false);
  // Wall colors expansion toggle
  const [showAllWallColors, setShowAllWallColors] = useState(false);
  // Store the original background color to avoid recursive adjustments
  const [originalBackgroundColor, setOriginalBackgroundColor] =
    useState("#374151");

  // Check if we're viewing a shared design
  const isViewingSharedDesign = originalSharedData !== null;

  // Tab state - default to "scene" for shared designs, "design" for new designs
  const [activeTab, setActiveTab] = useState(
    isViewingSharedDesign ? "scene" : "design"
  );

  // Get the block size in inches based on mini mode
  const blockSizeInches = getBlockSizeInches(useMini);

  // Local derived values for size inputs
  const unitDimensions = useMemo(() => {
    if (sizeUnit === "blocks")
      return { w: dimensions.width, h: dimensions.height };
    if (sizeUnit === "inches")
      return {
        w: parseFloat((dimensions.width * blockSizeInches).toFixed(2)),
        h: parseFloat((dimensions.height * blockSizeInches).toFixed(2)),
      };
    // feet
    return {
      w: parseFloat(((dimensions.width * blockSizeInches) / 12).toFixed(2)),
      h: parseFloat(((dimensions.height * blockSizeInches) / 12).toFixed(2)),
    };
  }, [dimensions, sizeUnit, blockSizeInches]);

  const [widthVal, setWidthVal] = useState<number | string>(unitDimensions.w);
  const [heightVal, setHeightVal] = useState<number | string>(unitDimensions.h);

  // Sync local state when store or unit changes
  useEffect(() => {
    setWidthVal(unitDimensions.w);
    setHeightVal(unitDimensions.h);
  }, [unitDimensions.w, unitDimensions.h, sizeUnit]);

  // Apply size changes immediately while typing, but prevent infinite loops
  const lastCommittedRef = useRef<{ w: number; h: number; unit: string }>({
    w: dimensions.width,
    h: dimensions.height,
    unit: sizeUnit,
  });

  // Update ref when dimensions change from external sources (like unit changes)
  useEffect(() => {
    lastCommittedRef.current = {
      w: dimensions.width,
      h: dimensions.height,
      unit: sizeUnit,
    };
  }, [dimensions.width, dimensions.height, sizeUnit]);

  const handleSizeChange = (newW: number | string, newH: number | string) => {
    const w = typeof newW === "string" ? parseFloat(newW) : newW;
    const h = typeof newH === "string" ? parseFloat(newH) : newH;

    if (!Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1) return;

    // Convert to blocks for comparison
    let targetBlocksW = w;
    let targetBlocksH = h;
    if (sizeUnit === "inches") {
      targetBlocksW = w / blockSizeInches;
      targetBlocksH = h / blockSizeInches;
    } else if (sizeUnit === "feet") {
      targetBlocksW = (w * 12) / blockSizeInches;
      targetBlocksH = (h * 12) / blockSizeInches;
    }

    // Only update if the target block count is different from what we last committed
    const epsilon = 1e-6;
    const wDiff =
      Math.abs(targetBlocksW - lastCommittedRef.current.w) > epsilon;
    const hDiff =
      Math.abs(targetBlocksH - lastCommittedRef.current.h) > epsilon;
    const unitDiff = sizeUnit !== lastCommittedRef.current.unit;

    if (wDiff || hDiff || unitDiff) {
      setDimensionsByUnit(w, h, sizeUnit);
      lastCommittedRef.current = {
        w: targetBlocksW,
        h: targetBlocksH,
        unit: sizeUnit,
      };
    }
  };

  // Validation for block increments (uses blockSizeInches for current mode)
  const blockSizeFeet = blockSizeInches / 12; // Convert to feet per block
  const epsilon = 1e-6;
  const toNumber = (v: number | string) =>
    typeof v === "string" ? parseFloat(v) : v;
  const isMultipleOf = (val: number, step: number) => {
    if (!Number.isFinite(val)) return true;
    const ratio = val / step;
    return Math.abs(ratio - Math.round(ratio)) < epsilon;
  };
  const numericW = toNumber(widthVal);
  const numericH = toNumber(heightVal);
  const isInches = sizeUnit === "inches";
  const isFeet = sizeUnit === "feet";
  const isBlocks = sizeUnit === "blocks";
  const validW = isBlocks
    ? Number.isFinite(numericW) && Number.isInteger(numericW) && numericW >= 1
    : isInches
    ? isMultipleOf(numericW, blockSizeInches)
    : isMultipleOf(numericW, blockSizeFeet);
  const validH = isBlocks
    ? Number.isFinite(numericH) && Number.isInteger(numericH) && numericH >= 1
    : isInches
    ? isMultipleOf(numericH, blockSizeInches)
    : isMultipleOf(numericH, blockSizeFeet);
  const anyInvalid =
    Number.isFinite(numericW) &&
    Number.isFinite(numericH) &&
    (!validW || !validH) &&
    (isInches || isFeet);

  const snapToNearest = () => {
    if (!Number.isFinite(numericW) || !Number.isFinite(numericH)) return;
    if (isInches) {
      const w = Math.round(numericW / blockSizeInches) * blockSizeInches;
      const h = Math.round(numericH / blockSizeInches) * blockSizeInches;
      setWidthVal(Math.max(blockSizeInches, parseFloat(w.toFixed(2))));
      setHeightVal(Math.max(blockSizeInches, parseFloat(h.toFixed(2))));
    } else if (isFeet) {
      const w = Math.round(numericW / blockSizeFeet) * blockSizeFeet;
      const h = Math.round(numericH / blockSizeFeet) * blockSizeFeet;
      setWidthVal(parseFloat(Math.max(blockSizeFeet, w).toFixed(2)));
      setHeightVal(parseFloat(Math.max(blockSizeFeet, h).toFixed(2)));
    }
  };

  const intensitySlider = (
    label: string,
    value: number,
    onChange: (n: number) => void,
    max = 2
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
        <span>{label}</span>
        <span>{value.toFixed(2)}</span>
      </div>
      <input
        aria-label={label}
        type="range"
        min={0}
        max={max}
        step={0.01}
        value={value}
        onChange={(e) => onChange(clamp(parseFloat(e.target.value), 0, max))}
        className="w-full accent-gray-800 dark:accent-gray-200"
      />
    </div>
  );

  // Simplified lighting: presets + brightness + shadows with optional Advanced
  const [selectedPreset, setSelectedPreset] =
    useState<LightingPresetKey>("gallery");
  const [brightness, setBrightness] = useState<number>(1);
  const [shadowContrast, setShadowContrast] = useState<number>(0.3);
  const [selectedBrightness, setSelectedBrightness] = useState<
    "Low" | "Medium" | "High"
  >("Medium");
  const [selectedShadows, setSelectedShadows] = useState<
    "Low" | "Medium" | "High"
  >("Medium");

  const applyLightingFromBase = (
    base: {
      ambient: number;
      key: number;
      fill: number;
      back: number;
      rim: number;
    },
    b: number,
    s: number
  ) => {
    const next = {
      ambientIntensity: clamp(base.ambient * (1 - 0.3 * s) * b, 0, 2),
      keyIntensity: clamp(base.key * (1 + 0.4 * s) * b, 0, 2),
      fillIntensity: clamp(base.fill * (1 - 0.4 * s) * b, 0, 2),
      backIntensity: clamp(base.back * b, 0, 2),
      rimIntensity: clamp(base.rim * (1 + 0.2 * s) * b, 0, 2),
    };
    setLighting(next);
  };

  useEffect(() => {
    // Initialize from default preset on mount
    applyLightingFromBase(
      LIGHTING_PRESETS[selectedPreset],
      brightness,
      shadowContrast
    );

    // Apply initial background color adjustment
    const adjustedBackgroundColor = getBackgroundColorForLighting(
      originalBackgroundColor,
      selectedPreset
    );
    setBackgroundColor(adjustedBackgroundColor);
  }, []);

  const handlePresetClick = (key: LightingPresetKey) => {
    setSelectedPreset(key);
    applyLightingFromBase(LIGHTING_PRESETS[key], brightness, shadowContrast);

    // Adjust background color based on lighting preset
    const adjustedBackgroundColor = getBackgroundColorForLighting(
      originalBackgroundColor,
      key
    );
    setBackgroundColor(adjustedBackgroundColor);
  };

  const handleBrightnessChange = (preset: "Low" | "Medium" | "High") => {
    const brightnessValue =
      BRIGHTNESS_PRESETS.find((p) => p.label === preset)?.value || 1;
    setBrightness(brightnessValue);
    setSelectedBrightness(preset);
    applyLightingFromBase(
      LIGHTING_PRESETS[selectedPreset],
      brightnessValue,
      shadowContrast
    );

    // Re-apply background color adjustment for current preset
    const adjustedBackgroundColor = getBackgroundColorForLighting(
      originalBackgroundColor,
      selectedPreset
    );
    setBackgroundColor(adjustedBackgroundColor);
  };

  const handleShadowsChange = (preset: "Low" | "Medium" | "High") => {
    const shadowValue =
      SHADOW_PRESETS.find((p) => p.label === preset)?.value || 0.3;
    setShadowContrast(shadowValue);
    setSelectedShadows(preset);
    applyLightingFromBase(
      LIGHTING_PRESETS[selectedPreset],
      brightness,
      shadowValue
    );

    // Re-apply background color adjustment for current preset
    const adjustedBackgroundColor = getBackgroundColorForLighting(
      originalBackgroundColor,
      selectedPreset
    );
    setBackgroundColor(adjustedBackgroundColor);
  };

  const handleWallPresetClick = (hex: string) => {
    setOriginalBackgroundColor(hex);
    const adjustedBackgroundColor = getBackgroundColorForLighting(
      hex,
      selectedPreset
    );
    setBackgroundColor(adjustedBackgroundColor);
  };

  const handleCustomColorChange = (hex: string) => {
    setOriginalBackgroundColor(hex);
    const adjustedBackgroundColor = getBackgroundColorForLighting(
      hex,
      selectedPreset
    );
    setBackgroundColor(adjustedBackgroundColor);
  };

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    setShareMessage(null);

    try {
      const result = await createSharedDesign();

      if (result.success && result.shareUrl) {
        setShareableLink(result.shareUrl);
        setShareId(result.shareId || "");
        showShareMessage("success", "Share link is ready.");
        // Automatically switch to share tab to show the generated link
        setActiveTab("share");
      } else {
        showShareMessage(
          "error",
          result.error || "Failed to create shared design."
        );
      }
    } catch (error) {
      console.error("Error generating link:", error);
      showShareMessage("error", "Failed to generate shareable link.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    showShareMessage("success", "Link copied to clipboard.");

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleAddToShelf = () => {
    addCurrentDesignToShelf();
    showShareMessage("success", "Added current design to the shelf.");
  };

  const handleGenerateSetLink = async () => {
    setIsGeneratingSet(true);
    setShareMessage(null);

    try {
      const result = await createSharedDesignSet();
      if (result.success) {
        setShelfShareableLink(result.setUrl);
        showShareMessage("success", "Shelf link is ready.");
        setActiveTab("share");
        await navigator.clipboard.writeText(result.setUrl);
        setCopiedSetLink(true);
        window.setTimeout(() => setCopiedSetLink(false), 2000);
      } else {
        showShareMessage("error", result.error);
      }
    } catch (error) {
      console.error("Error generating shelf link:", error);
      showShareMessage("error", "Failed to generate shelf link.");
    } finally {
      setIsGeneratingSet(false);
    }
  };

  const handleCopySetLink = async () => {
    try {
      await navigator.clipboard.writeText(shelfShareableLink);
      setCopiedSetLink(true);
      showShareMessage("success", "Shelf link copied to clipboard.");
      window.setTimeout(() => setCopiedSetLink(false), 2000);
    } catch (error) {
      console.error("Failed to copy shelf link:", error);
      showShareMessage("error", "Failed to copy shelf link.");
    }
  };

  // Animation variants for mobile (bottom sheet) vs desktop (side panel)
  const panelVariants = {
    hidden: isMobile ? { opacity: 0, y: "100%" } : { opacity: 0, x: 20 },
    visible: isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 },
    exit: isMobile ? { opacity: 0, y: "100%" } : { opacity: 0, x: 20 },
  };

  return (
    <motion.aside
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={panelVariants}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={`
        fixed z-50 border border-gray-200/70 dark:border-gray-700/70 
        bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-xl 
        overflow-hidden flex flex-col
        ${
          isMobile
            ? "inset-x-0 bottom-0 rounded-t-2xl max-h-[85vh]"
            : "top-20 right-4 w-[360px] max-w-[94vw] max-h-[85vh] rounded-2xl"
        }
      `}
    >
      {/* Mobile drag handle */}
      {isMobile && (
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>
      )}

      <div
        className={`${
          isMobile ? "px-4 pb-6 pt-2" : "p-4"
        } space-y-4 overflow-y-auto`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Scene Settings
          </h2>
          <div className="flex items-center gap-2">
            <button
              aria-label="Hide settings"
              onClick={() => setShowUIControls(false)}
              className={`
                flex items-center gap-1 rounded-md border border-gray-300 dark:border-gray-700 
                hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                ${isMobile ? "p-2" : "text-xs px-2 py-1"}
              `}
            >
              {isMobile ? <X className="w-4 h-4" /> : "Hide"}
            </button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger
              value="design"
              className="text-xs data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              Design
            </TabsTrigger>
            <TabsTrigger
              value="scene"
              className="text-xs data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              Scene
            </TabsTrigger>
            <TabsTrigger
              value="share"
              className="text-xs data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              Share
            </TabsTrigger>
          </TabsList>

          {/* Design Tab */}
          <TabsContent value="design" className="space-y-4">
            {/* Status and Revert Section (only shown when viewing shared design) */}
            {isViewingSharedDesign && (
              <section className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/70 shadow-sm p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {hasChangesFromShared ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <div>
                          <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                            Design Modified
                          </h3>
                          <p className="text-xs text-amber-600 dark:text-amber-500">
                            You've made changes to the shared design.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        <div>
                          <h3 className="text-sm font-semibold text-green-700 dark:text-green-400">
                            Original Design
                          </h3>
                          <p className="text-xs text-green-600 dark:text-green-500">
                            Viewing the design as shared.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  {hasChangesFromShared && (
                    <button
                      onClick={revertToSharedDesign}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Revert
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* Design Selector (only shown when NOT viewing shared design) */}
            {!isViewingSharedDesign && (
              <section className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/70 shadow-sm p-3">
                {selectedDesign === ItemDesigns.Custom ? (
                  // Custom Design UI
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"></div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Custom Design
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            Using your custom color palette.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-purple-700/50">
                      <p className="text-xs text-purple-700 dark:text-purple-300 mb-3">
                        Want to try a professional design instead? Choose from
                        our curated collection below.
                      </p>
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            setSelectedDesignWithSharedHandling(
                              e.target.value as ItemDesigns
                            );
                          }
                        }}
                        className="w-full px-3 py-2 text-xs border border-purple-300 dark:border-purple-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Switch to official design...</option>
                        {Object.values(ItemDesigns)
                          .filter((design) => design !== ItemDesigns.Custom)
                          .map((design) => (
                            <option key={design} value={design}>
                              {design}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  // Standard Design UI
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Design
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          Select an official design pattern.
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <select
                        value={selectedDesign}
                        onChange={(e) =>
                          setSelectedDesignWithSharedHandling(
                            e.target.value as ItemDesigns
                          )
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        {Object.values(ItemDesigns)
                          .filter((design) => design !== ItemDesigns.Custom)
                          .map((design) => (
                            <option key={design} value={design}>
                              {design}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Size Card (moved to be under design controls) */}
            {!isViewingSharedDesign && (
              <section className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/70 shadow-sm p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Size
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Enter your art size in blocks, inches, or feet.
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <SizeSelector
                    label="Width"
                    min={1}
                    max={
                      sizeUnit === "blocks"
                        ? 50
                        : sizeUnit === "inches"
                        ? 150
                        : 12.5
                    }
                    defaultValue={
                      typeof widthVal === "string"
                        ? parseFloat(widthVal)
                        : widthVal
                    }
                    step={
                      sizeUnit === "feet"
                        ? blockSizeFeet
                        : sizeUnit === "inches"
                        ? blockSizeInches
                        : 1
                    }
                    onChange={(value) => {
                      setWidthVal(value);
                      handleSizeChange(value, heightVal);
                    }}
                    className="col-span-1"
                  />
                  <SizeSelector
                    label="Height"
                    min={1}
                    max={
                      sizeUnit === "blocks"
                        ? 50
                        : sizeUnit === "inches"
                        ? 150
                        : 12.5
                    }
                    defaultValue={
                      typeof heightVal === "string"
                        ? parseFloat(heightVal)
                        : heightVal
                    }
                    step={
                      sizeUnit === "feet"
                        ? blockSizeFeet
                        : sizeUnit === "inches"
                        ? blockSizeInches
                        : 1
                    }
                    onChange={(value) => {
                      setHeightVal(value);
                      handleSizeChange(widthVal, value);
                    }}
                    className="col-span-1"
                  />
                  <div className="space-y-1">
                    <label className="text-xs text-gray-600 dark:text-gray-300 mb-1 font-medium">
                      Units
                    </label>
                    <select
                      value={sizeUnit}
                      onChange={(e) => setSizeUnit(e.target.value as any)}
                      className="w-full h-8 rounded-md border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="blocks">Blocks</option>
                      <option value="inches">Inches</option>
                      <option value="feet">Feet</option>
                    </select>
                  </div>
                </div>
                {anyInvalid && (
                  <div className="mt-2 rounded-md border border-amber-300/60 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 text-[11px] text-amber-800 dark:text-amber-200">
                    <div className="flex items-center justify-between gap-2">
                      <p>
                        Each block equals {blockSizeInches} inches. Please use{" "}
                        {isFeet
                          ? `${blockSizeFeet.toFixed(2)} ft`
                          : `${blockSizeInches} inch`}{" "}
                        increments.
                      </p>
                      <button
                        type="button"
                        onClick={snapToNearest}
                        className="shrink-0 rounded border border-amber-300/80 px-2 py-0.5 text-[10px] font-medium hover:bg-amber-100 dark:hover:bg-amber-900/30"
                      >
                        Snap
                      </button>
                    </div>
                  </div>
                )}
                <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                  1 block = {blockSizeInches} inches.
                </p>
              </section>
            )}

            {/* Pattern Controls - Only visible when NOT viewing shared design */}
            {!isViewingSharedDesign && (
              <section className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/70 shadow-sm p-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Pattern
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Choose how colors are distributed across the design.
                    </p>
                  </div>
                </div>

                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setColorPattern("fade")}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      colorPattern === "fade"
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    Fade
                  </button>
                  <button
                    onClick={() => setColorPattern("center-fade")}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      colorPattern === "center-fade"
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    Center
                  </button>
                  <button
                    onClick={() => setColorPattern("random")}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      colorPattern === "random"
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    Random
                  </button>
                </div>
              </section>
            )}

            {/* Orientation and Options Controls - Only visible when NOT viewing shared design */}
            {!isViewingSharedDesign && (
              <section className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/70 shadow-sm p-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Layout Controls
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Adjust orientation and display options.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Orientation Toggle */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Orientation
                    </label>
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                      <button
                        onClick={() => setOrientation("horizontal")}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                          orientation === "horizontal"
                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        }`}
                      >
                        Horizontal
                      </button>
                      <button
                        onClick={() => setOrientation("vertical")}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                          orientation === "vertical"
                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        }`}
                      >
                        Vertical
                      </button>
                    </div>
                  </div>

                  {/* Options Toggles */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Options
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Reversed
                        </span>
                        <Switch
                          checked={isReversed}
                          onCheckedChange={setIsReversed}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Rotated
                        </span>
                        <Switch
                          checked={isRotated}
                          onCheckedChange={setIsRotated}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Advanced Customization Section (only shown when viewing shared design) */}
            {isViewingSharedDesign && (
              <section className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/70 shadow-sm p-3">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <div className="text-left">
                    <h3>Advanced Customization</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-normal">
                      Modify design, size, and pattern settings.
                    </p>
                  </div>
                  {showAdvanced ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 space-y-4"
                  >
                    {/* Design Selector */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Design
                      </label>
                      <select
                        value={selectedDesign}
                        onChange={(e) =>
                          setSelectedDesignWithSharedHandling(
                            e.target.value as ItemDesigns
                          )
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        {/* Show Custom option for shared designs */}
                        {isViewingSharedDesign && (
                          <option value={ItemDesigns.Custom}>
                            Custom (Original Shared Design)
                          </option>
                        )}
                        {Object.values(ItemDesigns)
                          .filter((design) => design !== ItemDesigns.Custom)
                          .map((design) => (
                            <option key={design} value={design}>
                              {design}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Pattern Controls */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Pattern
                      </label>
                      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                          onClick={() => setColorPattern("fade")}
                          className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                            colorPattern === "fade"
                              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                          }`}
                        >
                          Fade
                        </button>
                        <button
                          onClick={() => setColorPattern("center-fade")}
                          className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                            colorPattern === "center-fade"
                              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                          }`}
                        >
                          Center Fade
                        </button>
                        <button
                          onClick={() => setColorPattern("random")}
                          className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                            colorPattern === "random"
                              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                          }`}
                        >
                          Random
                        </button>
                      </div>
                    </div>

                    {/* Layout Controls - Moved here for shared designs */}
                    <div>
                      <div className="space-y-4">
                        {/* Orientation Toggle */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Orientation
                          </label>
                          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            <button
                              onClick={() => setOrientation("horizontal")}
                              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                                orientation === "horizontal"
                                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                              }`}
                            >
                              Horizontal
                            </button>
                            <button
                              onClick={() => setOrientation("vertical")}
                              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                                orientation === "vertical"
                                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                              }`}
                            >
                              Vertical
                            </button>
                          </div>
                        </div>

                        {/* Options Toggles */}
                        <div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Reversed
                              </span>
                              <Switch
                                checked={isReversed}
                                onCheckedChange={setIsReversed}
                                className="data-[state=checked]:bg-blue-600"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Rotated
                              </span>
                              <Switch
                                checked={isRotated}
                                onCheckedChange={setIsRotated}
                                className="data-[state=checked]:bg-blue-600"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Size Controls */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Size
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <SizeSelector
                          label="Width"
                          min={1}
                          max={
                            sizeUnit === "blocks"
                              ? 50
                              : sizeUnit === "inches"
                              ? 150
                              : 12.5
                          }
                          defaultValue={
                            typeof widthVal === "string"
                              ? parseFloat(widthVal)
                              : widthVal
                          }
                          step={
                            sizeUnit === "feet"
                              ? blockSizeFeet
                              : sizeUnit === "inches"
                              ? blockSizeInches
                              : 1
                          }
                          onChange={(value) => {
                            setWidthVal(value);
                            handleSizeChange(value, heightVal);
                          }}
                          className="col-span-1"
                        />
                        <SizeSelector
                          label="Height"
                          min={1}
                          max={
                            sizeUnit === "blocks"
                              ? 50
                              : sizeUnit === "inches"
                              ? 150
                              : 12.5
                          }
                          defaultValue={
                            typeof heightVal === "string"
                              ? parseFloat(heightVal)
                              : heightVal
                          }
                          step={
                            sizeUnit === "feet"
                              ? blockSizeFeet
                              : sizeUnit === "inches"
                              ? blockSizeInches
                              : 1
                          }
                          onChange={(value) => {
                            setHeightVal(value);
                            handleSizeChange(widthVal, value);
                          }}
                          className="col-span-1"
                        />
                        <div className="space-y-1">
                          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1 font-medium">
                            Units
                          </label>
                          <select
                            value={sizeUnit}
                            onChange={(e) => setSizeUnit(e.target.value as any)}
                            className="w-full h-8 px-2 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="blocks">Blocks</option>
                            <option value="inches">Inches</option>
                            <option value="feet">Feet</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </section>
            )}
          </TabsContent>

          {/* Scene Tab */}
          <TabsContent value="scene" className="space-y-4">
            {/* Background Card */}
            <section className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/70 shadow-sm p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Wall Color
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Pick a wall color to preview your art at home.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {/* Show first 5 colors by default */}
                {WALL_PRESETS.filter((c) => c.primary).map((c) => (
                  <button
                    key={c.hex}
                    title={c.name}
                    onClick={() => handleWallPresetClick(c.hex)}
                    className={`h-7 w-7 rounded-md border transition ring-offset-2 ${
                      originalBackgroundColor.toLowerCase() ===
                      c.hex.toLowerCase()
                        ? "ring-2 ring-blue-500 ring-offset-white dark:ring-offset-gray-900"
                        : "border-gray-300 dark:border-gray-700"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}

                {/* Show/hide additional colors */}
                {showAllWallColors && (
                  <>
                    {WALL_PRESETS.filter((c) => !c.primary).map((c) => (
                      <button
                        key={c.hex}
                        title={c.name}
                        onClick={() => handleWallPresetClick(c.hex)}
                        className={`h-7 w-7 rounded-md border transition ring-offset-2 ${
                          originalBackgroundColor.toLowerCase() ===
                          c.hex.toLowerCase()
                            ? "ring-2 ring-blue-500 ring-offset-white dark:ring-offset-gray-900"
                            : "border-gray-300 dark:border-gray-700"
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </>
                )}

                {/* Expand/collapse button */}
                {WALL_PRESETS.filter((c) => !c.primary).length > 0 && (
                  <button
                    onClick={() => setShowAllWallColors(!showAllWallColors)}
                    className="h-7 px-2 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {showAllWallColors ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                )}

                <label className="ml-auto inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  Custom
                  <input
                    aria-label="Custom background color"
                    type="color"
                    value={originalBackgroundColor}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="h-7 w-10 p-0 border rounded cursor-pointer bg-transparent"
                  />
                </label>
              </div>
            </section>

            {/* Lighting Card */}
            <section className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/70 shadow-sm p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Lighting
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Choose a mood and fine-tune brightness and shadows.
                  </p>
                </div>
              </div>

              {/* Presets */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(Object.keys(LIGHTING_PRESETS) as LightingPresetKey[]).map(
                  (key) => (
                    <button
                      key={key}
                      onClick={() => handlePresetClick(key)}
                      className={`text-xs px-2.5 py-1.5 rounded-md border transition text-left ${
                        selectedPreset === key
                          ? "border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950/30"
                          : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      {LIGHTING_PRESETS[key].label}
                    </button>
                  )
                )}
              </div>

              {/* Brightness and Shadows Presets */}
              <div className="mt-3 space-y-3">
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                    Overall Brightness
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {BRIGHTNESS_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() =>
                          handleBrightnessChange(
                            preset.label as "Low" | "Medium" | "High"
                          )
                        }
                        className={`text-xs px-2 py-1.5 rounded-md border transition ${
                          selectedBrightness === preset.label
                            ? "border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950/30"
                            : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                    Shadows
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {SHADOW_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() =>
                          handleShadowsChange(
                            preset.label as "Low" | "Medium" | "High"
                          )
                        }
                        className={`text-xs px-2 py-1.5 rounded-md border transition ${
                          selectedShadows === preset.label
                            ? "border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950/30"
                            : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Advanced */}
              <div className="mt-3">
                <button
                  onClick={() => setShowLightingAdvanced((v) => !v)}
                  className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  {showLightingAdvanced ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      Hide advanced
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      Show advanced
                    </>
                  )}
                </button>
                {showLightingAdvanced && (
                  <div className="mt-3 space-y-3">
                    {intensitySlider(
                      "Ambient",
                      lighting.ambientIntensity,
                      (n) => setLighting({ ambientIntensity: n })
                    )}
                    {intensitySlider("Key", lighting.keyIntensity, (n) =>
                      setLighting({ keyIntensity: n })
                    )}
                    {intensitySlider("Fill", lighting.fillIntensity, (n) =>
                      setLighting({ fillIntensity: n })
                    )}
                    {intensitySlider("Back", lighting.backIntensity, (n) =>
                      setLighting({ backIntensity: n })
                    )}
                    {intensitySlider("Rim", lighting.rimIntensity, (n) =>
                      setLighting({ rimIntensity: n })
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* View Options */}
            <section className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/70 shadow-sm p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    View Options
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Toggle visual aids.
                  </p>
                </div>
              </div>
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Show Ruler
                  </span>
                  <Switch
                    checked={viewSettings.showRuler}
                    onCheckedChange={setShowRuler}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>
            </section>
          </TabsContent>

          {/* Share Tab */}
          <TabsContent value="share" className="space-y-4">
            {/* Multi-design shelf sharing */}
            <section className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/70 shadow-sm p-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Design Shelf
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Add multiple designs, then share one link.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={handleAddToShelf}
                  className="flex-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md px-3 py-2 text-xs font-medium hover:bg-gray-800 dark:hover:bg-white transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Current
                </button>
                <button
                  onClick={handleGenerateSetLink}
                  disabled={isGeneratingSet || shelfDesigns.length === 0}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-md px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGeneratingSet ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Share Shelf
                    </>
                  )}
                </button>
              </div>

              <div className="text-xs text-gray-600 dark:text-gray-400">
                Shelf contains{" "}
                <span className="font-medium">{shelfDesigns.length}</span>{" "}
                design{shelfDesigns.length === 1 ? "" : "s"}.
              </div>

              {(shelfShareableLink || sharedSetId) && (
                <div className="mt-3 space-y-2">
                  {sharedSetId && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      Set ID: {sharedSetId}
                    </div>
                  )}
                  {shelfShareableLink && (
                    <div className="flex items-center gap-2">
                      <input
                        value={shelfShareableLink}
                        readOnly
                        className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-xs"
                      />
                      <button
                        onClick={handleCopySetLink}
                        className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                          copiedSetLink
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {copiedSetLink ? (
                          <>
                            <Check className="w-3 h-3 mr-1 inline" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1 inline" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* For shared designs that haven't been modified - show copy link option */}
            {isViewingSharedDesign && !hasChangesFromShared && (
              <section className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/70 shadow-sm p-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Share This Design
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Copy the link to share this exact design with others.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      value={window.location.href}
                      readOnly
                      className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-xs"
                      placeholder="Loading current URL..."
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setCopied(true);
                        showShareMessage(
                          "success",
                          "Link copied to clipboard!"
                        );
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                        copied
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 mr-1 inline" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1 inline" />
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50">
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      💡 <strong>Tip:</strong> If you modify this design, you
                      can create a new shareable link for your changes.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* For new designs or modified shared designs - show generate link option */}
            {(!isViewingSharedDesign || hasChangesFromShared) && (
              <section className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/70 shadow-sm p-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {hasChangesFromShared
                        ? "Share Modified Design"
                        : "Share Your Design"}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {hasChangesFromShared
                        ? "Create a new shareable link for your modified version."
                        : "Create a shareable link for your current design."}
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {shareMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className={`mb-3 flex items-center gap-2 rounded-md border px-2.5 py-2 text-xs ${
                        shareMessage.type === "success"
                          ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300"
                          : shareMessage.type === "error"
                          ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300"
                          : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300"
                      }`}
                    >
                      {shareMessage.type === "success" ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5" />
                      )}
                      <span>{shareMessage.text}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!shareableLink ? (
                  <button
                    onClick={handleGenerateLink}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-md px-4 py-3 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating Link...
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4" />
                        {hasChangesFromShared
                          ? "Create New Share Link"
                          : "Generate Shareable Link"}
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-3">
                    {shareId && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        Share ID: {shareId}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        value={shareableLink}
                        readOnly
                        className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-xs"
                      />
                      <button
                        onClick={handleCopyLink}
                        className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                          copied
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 mr-1 inline" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1 inline" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      onClick={handleGenerateLink}
                      className="w-full text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                    >
                      Generate New Link
                    </button>
                  </div>
                )}
              </section>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </motion.aside>
  );
}

export default ControlPanel;
