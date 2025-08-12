"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCustomStore } from "@/store/customStore";
import {
  Share2,
  Copy,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { ItemDesigns } from "@/typings/types";
import { getBackgroundColorForLighting } from "@/lib/utils";
import { SizeSelector } from "@/components/ui/size-selector";

const WALL_PRESETS: Array<{ name: string; hex: string }> = [
  { name: "White", hex: "#ffffff" },
  { name: "Warm White", hex: "#faf7f2" },
  { name: "Light Gray", hex: "#e5e7eb" },
  { name: "Greige", hex: "#dedad2" },
  { name: "Soft Beige", hex: "#efe7dd" },
  { name: "Pale Blue", hex: "#e6f0f7" },
  { name: "Sage", hex: "#e6efe6" },
  { name: "Blush", hex: "#f9e9ea" },
  { name: "Charcoal", hex: "#374151" },
  { name: "Midnight", hex: "#111827" },
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
  } = useCustomStore();

  const [shareableLink, setShareableLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareId, setShareId] = useState("");
  const [shareMessage, setShareMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
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
  // Store the original background color to avoid recursive adjustments
  const [originalBackgroundColor, setOriginalBackgroundColor] =
    useState("#111827");

  // Check if we're viewing a shared design
  const isViewingSharedDesign = originalSharedData !== null;

  // Local derived values for size inputs
  const unitDimensions = useMemo(() => {
    if (sizeUnit === "blocks")
      return { w: dimensions.width, h: dimensions.height };
    if (sizeUnit === "inches")
      return {
        w: Math.round(dimensions.width * 3),
        h: Math.round(dimensions.height * 3),
      };
    // feet
    return {
      w: parseFloat(((dimensions.width * 3) / 12).toFixed(2)),
      h: parseFloat(((dimensions.height * 3) / 12).toFixed(2)),
    };
  }, [dimensions, sizeUnit]);

  const [widthVal, setWidthVal] = useState<number | string>(unitDimensions.w);
  const [heightVal, setHeightVal] = useState<number | string>(unitDimensions.h);

  // Sync local state when store or unit changes
  useEffect(() => {
    setWidthVal(unitDimensions.w);
    setHeightVal(unitDimensions.h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitDimensions.w, unitDimensions.h, sizeUnit]);

  const commitSize = (w: number, h: number) => {
    if (Number.isFinite(w) && Number.isFinite(h)) {
      setDimensionsByUnit(w, h, sizeUnit);
    }
  };

  // Apply size changes only on blur to avoid automatic snapping
  const handleSizeCommit = () => {
    const w = typeof widthVal === "string" ? parseFloat(widthVal) : widthVal;
    const h = typeof heightVal === "string" ? parseFloat(heightVal) : heightVal;
    if (Number.isFinite(w) && Number.isFinite(h) && w >= 1 && h >= 1) {
      setDimensionsByUnit(w, h, sizeUnit);
    }
  };

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
      targetBlocksW = w / 3;
      targetBlocksH = h / 3;
    } else if (sizeUnit === "feet") {
      targetBlocksW = (w * 12) / 3;
      targetBlocksH = (h * 12) / 3;
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

  // Validation for block increments (1 block = 3 inches)
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
    ? isMultipleOf(numericW, 3)
    : isMultipleOf(numericW, 0.25);
  const validH = isBlocks
    ? Number.isFinite(numericH) && Number.isInteger(numericH) && numericH >= 1
    : isInches
    ? isMultipleOf(numericH, 3)
    : isMultipleOf(numericH, 0.25);
  const anyInvalid =
    Number.isFinite(numericW) &&
    Number.isFinite(numericH) &&
    (!validW || !validH) &&
    (isInches || isFeet);

  const snapToNearest = () => {
    if (!Number.isFinite(numericW) || !Number.isFinite(numericH)) return;
    if (isInches) {
      const w = Math.round(numericW / 3) * 3;
      const h = Math.round(numericH / 3) * 3;
      setWidthVal(Math.max(1, w));
      setHeightVal(Math.max(1, h));
    } else if (isFeet) {
      // 1 block = 0.25 ft
      const w = Math.round(numericW / 0.25) * 0.25;
      const h = Math.round(numericH / 0.25) * 0.25;
      setWidthVal(parseFloat(Math.max(0.25, w).toFixed(2)));
      setHeightVal(parseFloat(Math.max(0.25, h).toFixed(2)));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleBrightnessChange = (val: number) => {
    setBrightness(val);
    applyLightingFromBase(
      LIGHTING_PRESETS[selectedPreset],
      val,
      shadowContrast
    );

    // Re-apply background color adjustment for current preset
    const adjustedBackgroundColor = getBackgroundColorForLighting(
      originalBackgroundColor,
      selectedPreset
    );
    setBackgroundColor(adjustedBackgroundColor);
  };

  const handleShadowsChange = (val: number) => {
    setShadowContrast(val);
    applyLightingFromBase(LIGHTING_PRESETS[selectedPreset], brightness, val);

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

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="absolute top-4 right-4 z-50 w-[360px] max-w-[94vw] max-h-[92vh] rounded-2xl border border-gray-200/70 dark:border-gray-700/70 bg-white/75 dark:bg-gray-900/75 backdrop-blur-xl shadow-xl overflow-hidden flex flex-col"
    >
      <div className="p-4 space-y-5 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Scene Settings
          </h2>
          <button
            aria-label="Hide settings"
            onClick={() => setShowUIControls(false)}
            className="text-xs px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Hide
          </button>
        </div>

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

        {/* Advanced Customization Section */}
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
                      setSelectedDesign(e.target.value as ItemDesigns)
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

                {/* Pattern Controls */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pattern
                  </label>
                  <select
                    value={colorPattern}
                    onChange={(e) => setColorPattern(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="horizontal">Horizontal</option>
                    <option value="vertical">Vertical</option>
                    <option value="fade">Fade</option>
                    <option value="gradient">Gradient</option>
                    <option value="diagonal">Diagonal</option>
                    <option value="striped">Striped</option>
                    <option value="checkerboard">Checkerboard</option>
                    <option value="center-fade">Center Fade</option>
                    <option value="random">Random</option>
                  </select>
                </div>

                {/* Orientation and Options */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Orientation
                    </label>
                    <select
                      value={orientation}
                      onChange={(e) => setOrientation(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="horizontal">Horizontal</option>
                      <option value="vertical">Vertical</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Options
                    </label>
                    <div className="space-y-1">
                      <label className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={isReversed}
                          onChange={(e) => setIsReversed(e.target.checked)}
                          className="mr-2"
                        />
                        Reversed
                      </label>
                      <label className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={isRotated}
                          onChange={(e) => setIsRotated(e.target.checked)}
                          className="mr-2"
                        />
                        Rotated
                      </label>
                      <label className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={useMini}
                          onChange={(e) => setUseMini(e.target.checked)}
                          className="mr-2"
                        />
                        Mini
                      </label>
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
                          ? 0.25
                          : sizeUnit === "inches"
                          ? 3
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
                          ? 0.25
                          : sizeUnit === "inches"
                          ? 3
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

        {/* Standard Design Selector (only shown when NOT viewing shared design) */}
        {!isViewingSharedDesign && (
          <section className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/70 shadow-sm p-3">
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
                  setSelectedDesign(e.target.value as ItemDesigns)
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
          </section>
        )}

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
            {WALL_PRESETS.map((c) => (
              <button
                key={c.hex}
                title={c.name}
                onClick={() => handleWallPresetClick(c.hex)}
                className={`h-7 w-7 rounded-md border transition ring-offset-2 ${
                  originalBackgroundColor.toLowerCase() === c.hex.toLowerCase()
                    ? "ring-2 ring-blue-500 ring-offset-white dark:ring-offset-gray-900"
                    : "border-gray-300 dark:border-gray-700"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
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

          {/* Simplified sliders */}
          <div className="mt-3 space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                <span>Overall Brightness</span>
                <span>{brightness.toFixed(2)}</span>
              </div>
              <input
                aria-label="Overall brightness"
                type="range"
                min={0.5}
                max={1.5}
                step={0.01}
                value={brightness}
                onChange={(e) =>
                  handleBrightnessChange(parseFloat(e.target.value))
                }
                className="w-full accent-gray-800 dark:accent-gray-200"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                <span>Shadows</span>
                <span>{shadowContrast.toFixed(2)}</span>
              </div>
              <input
                aria-label="Shadows"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={shadowContrast}
                onChange={(e) =>
                  handleShadowsChange(parseFloat(e.target.value))
                }
                className="w-full accent-gray-800 dark:accent-gray-200"
              />
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
                {intensitySlider("Ambient", lighting.ambientIntensity, (n) =>
                  setLighting({ ambientIntensity: n })
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

        {/* Size Card (only shown when NOT viewing shared design) */}
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
                  typeof widthVal === "string" ? parseFloat(widthVal) : widthVal
                }
                step={
                  sizeUnit === "feet" ? 0.25 : sizeUnit === "inches" ? 3 : 1
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
                  sizeUnit === "feet" ? 0.25 : sizeUnit === "inches" ? 3 : 1
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
                    Each block equals 3 inches. Please use{" "}
                    {isFeet ? "0.25 ft" : "3 inch"} increments.
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
              1 block = 3 inches.
            </p>
          </section>
        )}

        {/* Share Card (only shown when changes have been made to shared design or not viewing shared design) */}
        {(!isViewingSharedDesign || hasChangesFromShared) && (
          <section className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/70 shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Share Design
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Create a shareable link for your current design.
                </p>
              </div>
            </div>

            <AnimatePresence>
              {shareMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={`mt-3 flex items-center gap-2 rounded-md border px-2.5 py-2 text-xs ${
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
                className="mt-3 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                    Generating Link...
                  </>
                ) : (
                  <>
                    <Share2 className="mr-2 h-4 w-4 inline" />
                    Generate Shareable Link
                  </>
                )}
              </button>
            ) : (
              <div className="mt-3 space-y-2">
                {shareId && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    Share ID: {shareId}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    value={shareableLink}
                    readOnly
                    className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      copied
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {copied ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>

                <button
                  onClick={handleGenerateLink}
                  className="w-full text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Generate New Link
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </motion.aside>
  );
}

export default ControlPanel;
