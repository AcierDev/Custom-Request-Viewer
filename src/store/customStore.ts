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

interface CustomStore {
  // Dimensions and design
  dimensions: Dimensions;
  selectedDesign: ItemDesigns;

  // Pattern settings
  colorPattern: ColorPattern;
  orientation: "horizontal" | "vertical";
  isReversed: boolean;
  isRotated: boolean;
  useMini: boolean;

  // View settings
  viewSettings: ViewSettings;

  // Custom palette
  customPalette: Array<{ hex: string; name?: string }>;

  // Actions
  setDimensions: (dimensions: Dimensions) => void;
  setSelectedDesign: (design: ItemDesigns) => void;
  setColorPattern: (pattern: ColorPattern) => void;
  setOrientation: (orientation: "horizontal" | "vertical") => void;
  setIsReversed: (reversed: boolean) => void;
  setIsRotated: (rotated: boolean) => void;
  setUseMini: (useMini: boolean) => void;
  setShowUIControls: (show: boolean) => void;
  setCustomPalette: (palette: Array<{ hex: string; name?: string }>) => void;
}

export const useCustomStore = create<CustomStore>((set) => ({
  // Initial state
  dimensions: { width: 28, height: 12 },
  selectedDesign: ItemDesigns.Coastal,
  colorPattern: "horizontal",
  orientation: "horizontal",
  isReversed: false,
  isRotated: false,
  useMini: false,
  viewSettings: {
    showRuler: false,
    showWoodGrain: true,
    showColorInfo: true,
    showUIControls: true,
    showSplitPanel: false,
  },
  customPalette: [],

  // Actions
  setDimensions: (dimensions) => set({ dimensions }),
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
  setCustomPalette: (customPalette) => set({ customPalette }),
}));
