"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCustomStore } from "@/store/customStore";

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

type LightingPresetKey = "gallery" | "soft" | "contrast" | "cozy" | "sunlit";

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
  soft: {
    label: "Soft Studio",
    ambient: 1.2,
    key: 0.8,
    fill: 0.7,
    back: 0.4,
    rim: 0.4,
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
  } = useCustomStore();

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
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePresetClick = (key: LightingPresetKey) => {
    setSelectedPreset(key);
    applyLightingFromBase(LIGHTING_PRESETS[key], brightness, shadowContrast);
  };

  const handleBrightnessChange = (val: number) => {
    setBrightness(val);
    applyLightingFromBase(
      LIGHTING_PRESETS[selectedPreset],
      val,
      shadowContrast
    );
  };

  const handleShadowsChange = (val: number) => {
    setShadowContrast(val);
    applyLightingFromBase(LIGHTING_PRESETS[selectedPreset], brightness, val);
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="absolute top-4 right-4 z-50 w-[360px] max-w-[94vw] rounded-2xl border border-gray-200/70 dark:border-gray-700/70 bg-white/75 dark:bg-gray-900/75 backdrop-blur-xl shadow-xl"
    >
      <div className="p-4 space-y-5">
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
                onClick={() => setBackgroundColor(c.hex)}
                className={`h-7 w-7 rounded-md border transition ring-offset-2 ${
                  backgroundColor.toLowerCase() === c.hex.toLowerCase()
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
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
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
              onClick={() => setShowAdvanced((v) => !v)}
              className="text-xs underline text-gray-600 dark:text-gray-300"
            >
              {showAdvanced ? "Hide advanced" : "Show advanced"}
            </button>
            {showAdvanced && (
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

        {/* Size Card */}
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
            <div className="col-span-2 grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-gray-600 dark:text-gray-300">
                  Width
                </label>
                <input
                  type="number"
                  step={
                    sizeUnit === "feet" ? 0.01 : sizeUnit === "inches" ? 1 : 1
                  }
                  min={1}
                  value={widthVal}
                  onChange={(e) => setWidthVal(e.target.valueAsNumber || 0)}
                  onBlur={() => commitSize(Number(widthVal), Number(heightVal))}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-600 dark:text-gray-300">
                  Height
                </label>
                <input
                  type="number"
                  step={
                    sizeUnit === "feet" ? 0.01 : sizeUnit === "inches" ? 1 : 1
                  }
                  min={1}
                  value={heightVal}
                  onChange={(e) => setHeightVal(e.target.valueAsNumber || 0)}
                  onBlur={() => commitSize(Number(widthVal), Number(heightVal))}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-600 dark:text-gray-300">
                Units
              </label>
              <select
                value={sizeUnit}
                onChange={(e) => setSizeUnit(e.target.value as any)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="blocks">Blocks</option>
                <option value="inches">Inches</option>
                <option value="feet">Feet</option>
              </select>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
            1 block = 3 inches.
          </p>
        </section>
      </div>
    </motion.aside>
  );
}

export default ControlPanel;
