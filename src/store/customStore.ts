import { create } from "zustand";
import { Dimensions, ItemDesigns } from "@/typings/types";
import { ColorPattern } from "@/lib/patternUtils";

// Add types for hover state
export interface HoverInfo {
  position: [number, number];
  color: string;
  colorName?: string;
}

interface HoverState {
  hoverInfo: HoverInfo | null;
  pinnedInfo: HoverInfo | null;
  setHoverInfo: (info: HoverInfo | null) => void;
  setPinnedInfo: (info: HoverInfo | null) => void;
}

// Create a separate store for hover state
export const hoverStore = create<HoverState>((set) => ({
  hoverInfo: null,
  pinnedInfo: null,
  setHoverInfo: (info) => set({ hoverInfo: info }),
  setPinnedInfo: (info) => set({ pinnedInfo: info }),
}));

interface ViewSettings {
  showRuler: boolean;
  showWoodGrain: boolean;
  showColorInfo: boolean;
  showUIControls: boolean;
  showSplitPanel: boolean;
}

type SizeUnit = "blocks" | "inches" | "feet";

interface LightingSettings {
  ambientIntensity: number;
  keyIntensity: number;
  fillIntensity: number;
  backIntensity: number;
  rimIntensity: number;
}

interface CustomStore {
  // Dimensions and design
  dimensions: Dimensions;
  selectedDesign: ItemDesigns;
  sizeUnit: SizeUnit;

  // Pattern settings
  colorPattern: ColorPattern;
  orientation: "horizontal" | "vertical";
  isReversed: boolean;
  isRotated: boolean;
  useMini: boolean;

  // View settings
  viewSettings: ViewSettings;

  // Environment
  backgroundColor: string;
  lighting: LightingSettings;

  // Custom palette
  customPalette: Array<{ hex: string; name?: string }>;

  // Actions
  setDimensions: (dimensions: Dimensions) => void;
  setDimensionsByUnit: (width: number, height: number, unit: SizeUnit) => void;
  setSelectedDesign: (design: ItemDesigns) => void;
  setColorPattern: (pattern: ColorPattern) => void;
  setOrientation: (orientation: "horizontal" | "vertical") => void;
  setIsReversed: (reversed: boolean) => void;
  setIsRotated: (rotated: boolean) => void;
  setUseMini: (useMini: boolean) => void;
  setShowUIControls: (show: boolean) => void;
  setBackgroundColor: (hex: string) => void;
  setLighting: (updater: Partial<LightingSettings>) => void;
  setSizeUnit: (unit: SizeUnit) => void;
  setCustomPalette: (palette: Array<{ hex: string; name?: string }>) => void;
}

export const useCustomStore = create<CustomStore>((set) => ({
  // Initial state
  dimensions: { width: 28, height: 12 }, // 28 blocks wide, 12 blocks tall
  selectedDesign: ItemDesigns.Coastal,
  sizeUnit: "blocks",
  colorPattern: "horizontal",
  orientation: "horizontal",
  isReversed: false,
  isRotated: false,
  useMini: false,
  viewSettings: {
    showRuler: false,
    showWoodGrain: true,
    showColorInfo: false, // Disabled to remove hover effects
    showUIControls: true,
    showSplitPanel: false,
  },
  backgroundColor: "#f3f4f6", // Tailwind gray-100
  lighting: {
    ambientIntensity: 1,
    keyIntensity: 0.7,
    fillIntensity: 0.5,
    backIntensity: 0.3,
    rimIntensity: 0.5,
  },
  customPalette: [],

  // Actions
  setDimensions: (dimensions) => set({ dimensions }),
  setDimensionsByUnit: (width, height, unit) =>
    set(() => {
      // Convert provided units back to blocks for storage
      let blocksW = width;
      let blocksH = height;
      if (unit === "inches") {
        // 1 block = 3 inches
        blocksW = width / 3;
        blocksH = height / 3;
      } else if (unit === "feet") {
        // 1 foot = 12 inches, 1 block = 3 inches
        blocksW = (width * 12) / 3;
        blocksH = (height * 12) / 3;
      }
      // Clamp to minimums
      blocksW = Math.max(1, Math.round(blocksW));
      blocksH = Math.max(1, Math.round(blocksH));
      return { dimensions: { width: blocksW, height: blocksH } };
    }),
  setSelectedDesign: (selectedDesign) => set({ selectedDesign }),
  setColorPattern: (colorPattern) => set({ colorPattern }),
  setOrientation: (orientation) => set({ orientation }),
  setIsReversed: (isReversed) => set({ isReversed }),
  setIsRotated: (isRotated) => set({ isRotated }),
  setUseMini: (useMini) => set({ useMini }),
  setShowUIControls: (show) =>
    set((state) => ({
      viewSettings: { ...state.viewSettings, showUIControls: show },
    })),
  setBackgroundColor: (hex) => set({ backgroundColor: hex }),
  setLighting: (updater) =>
    set((state) => ({ lighting: { ...state.lighting, ...updater } })),
  setSizeUnit: (unit) => set({ sizeUnit: unit }),
  setCustomPalette: (customPalette) => set({ customPalette }),
}));
