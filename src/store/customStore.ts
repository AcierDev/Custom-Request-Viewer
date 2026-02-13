import { create } from "zustand";
import { Dimensions, ItemDesigns } from "@/typings/types";
import { ColorPattern, validateColorPattern } from "@/lib/patternUtils";
import { getBlockSizeInches } from "@/lib/utils";

// Palette creation types
export interface CustomColor {
  hex: string;
  name?: string;
  /** Extra proportion of blocks for this color (e.g. 50 = +50%). Default 0. */
  extraPercent?: number;
}

export interface SavedPalette {
  id: string;
  name: string;
  colors: CustomColor[];
  createdAt: string;
  isPublic?: boolean;
}

export interface PaletteCreationState {
  currentStage: "choice" | "official" | "custom" | "preview" | "save";
  selectedOfficialDesign?: ItemDesigns;
  customPalette: CustomColor[];
  selectedColors: string[];
  paletteName: string;
  savedPalettes: SavedPalette[];
}

type PaletteCreationStore = {
  // Palette creation state
  paletteCreation: PaletteCreationState;

  // Actions
  setPaletteStage: (stage: PaletteCreationState["currentStage"]) => void;
  setSelectedOfficialDesign: (design: ItemDesigns) => void;
  addCustomColor: (hex: string, name?: string) => void;
  removeCustomColor: (index: number) => void;
  updateCustomColor: (index: number, hex: string, name?: string) => void;
  toggleColorSelection: (hex: string) => void;
  clearColorSelection: () => void;
  setPaletteName: (name: string) => void;
  savePalette: () => void;
  loadPalette: (palette: SavedPalette) => void;
  deletePalette: (id: string) => void;
  resetPaletteCreation: () => void;
};

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

interface CustomStore extends PaletteCreationStore {
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

  // Custom palette (keeping for backward compatibility)
  customPalette: Array<{ hex: string; name?: string; extraPercent?: number }>;

  // Shared design tracking
  originalSharedData: any | null;
  hasChangesFromShared: boolean;

  // Actions
  setDimensions: (dimensions: Dimensions) => void;
  setDimensionsByUnit: (width: number, height: number, unit: SizeUnit) => void;
  setSelectedDesign: (design: ItemDesigns) => void;
  setSelectedDesignWithSharedHandling: (design: ItemDesigns) => void;
  setColorPattern: (pattern: ColorPattern) => void;
  setOrientation: (orientation: "horizontal" | "vertical") => void;
  setIsReversed: (reversed: boolean) => void;
  setIsRotated: (rotated: boolean) => void;
  setUseMini: (useMini: boolean) => void;
  setShowUIControls: (show: boolean) => void;

  setBackgroundColor: (hex: string) => void;
  setLighting: (updater: Partial<LightingSettings>) => void;
  setSizeUnit: (unit: SizeUnit) => void;
  setCustomPalette: (
    palette: Array<{ hex: string; name?: string; extraPercent?: number }>
  ) => void;
  getShareableDesignData: () => {
    dimensions: Dimensions;
    selectedDesign: ItemDesigns;
    colorPattern: ColorPattern;
    orientation: "horizontal" | "vertical";
    isReversed: boolean;
    customPalette: Array<{
      hex: string;
      name?: string;
      extraPercent?: number;
    }>;
    isRotated: boolean;
    useMini: boolean;
  };
  createSharedDesign: (
    userId?: string,
    email?: string
  ) => Promise<{
    success: boolean;
    shareId?: string;
    shareUrl?: string;
    error?: string;
  }>;
  loadFromShareableData: (data: string) => boolean;
  loadFromDatabaseData: (designData: any) => boolean;
  setOriginalSharedData: (data: any) => void;
  clearSharedDesignTracking: () => void;
  revertToSharedDesign: () => void;
  checkForChanges: () => void;
}

export const useCustomStore = create<CustomStore>((set, get) => ({
  // Initial state
  dimensions: { width: 28, height: 12 }, // 28 blocks wide, 12 blocks tall
  selectedDesign: ItemDesigns.Coastal,
  sizeUnit: "blocks",
  colorPattern: "fade",
  orientation: "horizontal",
  isReversed: false,
  isRotated: false,
  useMini: false,
  viewSettings: {

    showWoodGrain: true,
    showColorInfo: false, // Disabled to remove hover effects
    showUIControls: true,
    showSplitPanel: false,
  },
  backgroundColor: "#374151", // Tailwind gray-100
  lighting: {
    ambientIntensity: 1,
    keyIntensity: 0.7,
    fillIntensity: 0.5,
    backIntensity: 0.3,
    rimIntensity: 0.5,
  },
  customPalette: [],
  originalSharedData: null,
  hasChangesFromShared: false,

  // Palette creation initial state
  paletteCreation: {
    currentStage: "choice",
    customPalette: [],
    selectedColors: [],
    paletteName: "",
    savedPalettes: [],
  },

  // Actions
  setDimensions: (dimensions) => {
    set({ dimensions });
    get().checkForChanges();
  },
  setDimensionsByUnit: (width, height, unit) =>
    set(() => {
      // Get the block size based on mini mode
      const blockSizeInches = getBlockSizeInches(get().useMini);

      // Convert provided units back to blocks for storage
      let blocksW = width;
      let blocksH = height;
      if (unit === "inches") {
        blocksW = width / blockSizeInches;
        blocksH = height / blockSizeInches;
      } else if (unit === "feet") {
        // 1 foot = 12 inches
        blocksW = (width * 12) / blockSizeInches;
        blocksH = (height * 12) / blockSizeInches;
      }
      // Clamp to minimums
      blocksW = Math.max(1, Math.round(blocksW));
      blocksH = Math.max(1, Math.round(blocksH));
      get().checkForChanges();
      return { dimensions: { width: blocksW, height: blocksH } };
    }),
  setSelectedDesign: (selectedDesign) => {
    set({ selectedDesign });
    get().checkForChanges();
  },
  setSelectedDesignWithSharedHandling: (design) => {
    const state = get();

    // If we're viewing a shared design and user selects Custom, revert to shared design
    if (state.originalSharedData && design === ItemDesigns.Custom) {
      state.revertToSharedDesign();
    } else {
      // If switching to an official design, clear the custom palette so official colors are used
      if (design !== ItemDesigns.Custom) {
        set({
          selectedDesign: design,
          customPalette: [], // Clear custom palette to use official design colors
        });
      } else {
        // If switching to Custom (but not from shared), keep current state
        set({ selectedDesign: design });
      }
      get().checkForChanges();
    }
  },
  setColorPattern: (colorPattern) => {
    const validatedPattern = validateColorPattern(colorPattern);
    set({ colorPattern: validatedPattern });
    get().checkForChanges();
  },
  setOrientation: (orientation) => {
    set({ orientation });
    get().checkForChanges();
  },
  setIsReversed: (isReversed) => {
    set({ isReversed });
    get().checkForChanges();
  },
  setIsRotated: (isRotated) => {
    set({ isRotated });
    get().checkForChanges();
  },
  setUseMini: (useMini) => {
    set({ useMini });
    get().checkForChanges();
  },
  setShowUIControls: (show) =>
    set((state) => ({
      viewSettings: { ...state.viewSettings, showUIControls: show },
    })),

  setBackgroundColor: (hex) => set({ backgroundColor: hex }),
  setLighting: (updater) =>
    set((state) => ({ lighting: { ...state.lighting, ...updater } })),
  setSizeUnit: (unit) => set({ sizeUnit: unit }),
  setCustomPalette: (customPalette) => {
    set({ customPalette });
    get().checkForChanges();
  },
  getShareableDesignData: () => {
    const state = get();
    return {
      dimensions: state.dimensions,
      selectedDesign: state.selectedDesign,
      colorPattern: state.colorPattern,
      orientation: state.orientation,
      isReversed: state.isReversed,
      customPalette: state.customPalette,
      isRotated: state.isRotated,
      useMini: state.useMini,
    };
  },
  createSharedDesign: async (userId?: string, email?: string) => {
    const shareableState = get().getShareableDesignData();

    try {
      const response = await fetch("/api/shared-designs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          designData: shareableState,
          userId,
          email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create shared design");
      }

      const result = await response.json();
      return {
        success: true,
        shareId: result.shareId,
        shareUrl: result.shareUrl,
      };
    } catch (error) {
      console.error("Error creating shared design:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
  loadFromShareableData: (data: string) => {
    try {
      const shareableState = JSON.parse(data);

      if (!shareableState.dimensions || !shareableState.selectedDesign) {
        return false;
      }

      const rawPalette = shareableState.customPalette || [];
      const customPalette = rawPalette.map(
        (c: { hex: string; name?: string; extraPercent?: number }) => ({
          ...c,
          extraPercent:
            typeof c.extraPercent === "number" && !Number.isNaN(c.extraPercent)
              ? c.extraPercent
              : 0,
        })
      );

      set({
        dimensions: shareableState.dimensions,
        selectedDesign: shareableState.selectedDesign,
        colorPattern: shareableState.colorPattern,
        orientation: shareableState.orientation,
        isReversed: shareableState.isReversed,
        customPalette,
        isRotated: shareableState.isRotated,
        useMini: shareableState.useMini,
      });

      return true;
    } catch (error) {
      console.error("Failed to load shared data:", error);
      return false;
    }
  },
  loadFromDatabaseData: (designData: any) => {
    try {
      if (!designData.dimensions || !designData.selectedDesign) {
        return false;
      }

      const rawPalette = designData.customPalette || [];
      const customPalette = rawPalette.map(
        (c: { hex: string; name?: string; extraPercent?: number }) => ({
          ...c,
          extraPercent:
            typeof c.extraPercent === "number" && !Number.isNaN(c.extraPercent)
              ? c.extraPercent
              : 0,
        })
      );

      set({
        dimensions: designData.dimensions,
        selectedDesign: designData.selectedDesign,
        colorPattern: designData.colorPattern,
        orientation: designData.orientation,
        isReversed: designData.isReversed,
        customPalette,
        isRotated: designData.isRotated,
        useMini: designData.useMini,
        originalSharedData: { ...designData },
        hasChangesFromShared: false,
      });

      return true;
    } catch (error) {
      console.error("Failed to load database data:", error);
      return false;
    }
  },
  setOriginalSharedData: (data) => {
    set({
      originalSharedData: data,
      hasChangesFromShared: false,
    });
  },
  clearSharedDesignTracking: () => {
    set({ originalSharedData: null, hasChangesFromShared: false });
  },
  revertToSharedDesign: () => {
    const originalData = get().originalSharedData;
    if (originalData) {
      const rawPalette = originalData.customPalette || [];
      const customPalette = rawPalette.map(
        (c: { hex: string; name?: string; extraPercent?: number }) => ({
          ...c,
          extraPercent:
            typeof c.extraPercent === "number" && !Number.isNaN(c.extraPercent)
              ? c.extraPercent
              : 0,
        })
      );
      set({
        dimensions: originalData.dimensions,
        selectedDesign: originalData.selectedDesign,
        colorPattern: originalData.colorPattern,
        orientation: originalData.orientation,
        isReversed: originalData.isReversed,
        customPalette,
        isRotated: originalData.isRotated,
        useMini: originalData.useMini,
        hasChangesFromShared: false,
      });
    }
  },
  checkForChanges: () => {
    const state = get();
    const original = state.originalSharedData;

    if (!original) {
      set({ hasChangesFromShared: false });
      return;
    }

    const hasChanges =
      state.dimensions.width !== original.dimensions?.width ||
      state.dimensions.height !== original.dimensions?.height ||
      state.selectedDesign !== original.selectedDesign ||
      state.colorPattern !== original.colorPattern ||
      state.orientation !== original.orientation ||
      state.isReversed !== original.isReversed ||
      state.isRotated !== original.isRotated ||
      state.useMini !== original.useMini ||
      JSON.stringify(state.customPalette) !==
        JSON.stringify(original.customPalette || []);

    set({ hasChangesFromShared: hasChanges });
  },

  // Palette creation actions
  setPaletteStage: (stage) =>
    set((state) => ({
      paletteCreation: { ...state.paletteCreation, currentStage: stage },
    })),

  setSelectedOfficialDesign: (design) =>
    set((state) => ({
      paletteCreation: {
        ...state.paletteCreation,
        selectedOfficialDesign: design,
      },
    })),

  addCustomColor: (hex, name = "") =>
    set((state) => ({
      paletteCreation: {
        ...state.paletteCreation,
        customPalette: [...state.paletteCreation.customPalette, { hex, name }],
      },
    })),

  removeCustomColor: (index) =>
    set((state) => ({
      paletteCreation: {
        ...state.paletteCreation,
        customPalette: state.paletteCreation.customPalette.filter(
          (_, i) => i !== index
        ),
        selectedColors: state.paletteCreation.selectedColors.filter(
          (color) => color !== state.paletteCreation.customPalette[index]?.hex
        ),
      },
    })),

  updateCustomColor: (index, hex, name = "") =>
    set((state) => {
      const newPalette = [...state.paletteCreation.customPalette];
      if (newPalette[index]) {
        newPalette[index] = { hex, name };
      }
      return {
        paletteCreation: {
          ...state.paletteCreation,
          customPalette: newPalette,
        },
      };
    }),

  toggleColorSelection: (hex) =>
    set((state) => {
      const selectedColors = state.paletteCreation.selectedColors.includes(hex)
        ? state.paletteCreation.selectedColors.filter((color) => color !== hex)
        : [...state.paletteCreation.selectedColors, hex];

      return {
        paletteCreation: {
          ...state.paletteCreation,
          selectedColors,
        },
      };
    }),

  clearColorSelection: () =>
    set((state) => ({
      paletteCreation: {
        ...state.paletteCreation,
        selectedColors: [],
      },
    })),

  setPaletteName: (name) =>
    set((state) => ({
      paletteCreation: { ...state.paletteCreation, paletteName: name },
    })),

  savePalette: () => {
    const state = get();
    const { customPalette, paletteName } = state.paletteCreation;

    if (customPalette.length === 0 || !paletteName.trim()) return;

    const newPalette: SavedPalette = {
      id: Date.now().toString(),
      name: paletteName.trim(),
      colors: customPalette,
      createdAt: new Date().toISOString(),
      isPublic: false,
    };

    set((state) => ({
      paletteCreation: {
        ...state.paletteCreation,
        savedPalettes: [...state.paletteCreation.savedPalettes, newPalette],
        paletteName: "",
      },
    }));

    // Save to localStorage
    const existingPalettes = JSON.parse(
      localStorage.getItem("savedPalettes") || "[]"
    );
    localStorage.setItem(
      "savedPalettes",
      JSON.stringify([...existingPalettes, newPalette])
    );
  },

  loadPalette: (palette) =>
    set((state) => ({
      paletteCreation: {
        ...state.paletteCreation,
        customPalette: [...palette.colors],
        paletteName: palette.name,
        currentStage: "custom",
      },
    })),

  deletePalette: (id) =>
    set((state) => {
      const newSavedPalettes = state.paletteCreation.savedPalettes.filter(
        (p) => p.id !== id
      );

      // Update localStorage
      localStorage.setItem("savedPalettes", JSON.stringify(newSavedPalettes));

      return {
        paletteCreation: {
          ...state.paletteCreation,
          savedPalettes: newSavedPalettes,
        },
      };
    }),

  resetPaletteCreation: () =>
    set((state) => ({
      paletteCreation: {
        currentStage: "choice",
        customPalette: [],
        selectedColors: [],
        paletteName: "",
        savedPalettes: state.paletteCreation.savedPalettes, // Keep saved palettes
      },
    })),
}));
