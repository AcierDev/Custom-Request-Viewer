"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Dimensions, ItemDesigns } from "@/typings/types";
import type { ColorPattern } from "@/lib/patternUtils";
import { useCustomStore } from "@/store/customStore";

export type ShareableDesignData = {
  dimensions: Dimensions;
  selectedDesign: ItemDesigns;
  colorPattern: ColorPattern;
  orientation: "horizontal" | "vertical";
  isReversed: boolean;
  customPalette: Array<{ hex: string; name?: string }>;
  isRotated: boolean;
  useMini: boolean;
};

export type CompareDesign = {
  id: string;
  label?: string | null;
  designData: ShareableDesignData;
  thumbnailDataUrl?: string | null;
};

type SharedDesignSetResponse = {
  setId: string;
  designs: Array<{ designData: ShareableDesignData; label?: string | null }>;
  createdAt: string;
  accessCount: number;
};

type ShareSetResult =
  | { success: true; setId: string; setUrl: string }
  | { success: false; error: string };

type CompareStore = {
  setId: string | null;
  designs: CompareDesign[];
  activeDesignId: string | null;

  setActiveDesignId: (id: string) => void;
  addCurrentDesignToShelf: (label?: string) => string;
  removeDesign: (id: string) => void;
  clearShelf: () => void;

  setThumbnail: (id: string, thumbnailDataUrl: string | null) => void;

  hydrateFromSharedSet: (data: SharedDesignSetResponse) => void;
  createSharedDesignSet: (
    userId?: string,
    email?: string
  ) => Promise<ShareSetResult>;
};

export const useCompareStore = create<CompareStore>((set, get) => ({
  setId: null,
  designs: [],
  activeDesignId: null,

  setActiveDesignId: (id) => set({ activeDesignId: id }),

  addCurrentDesignToShelf: (label) => {
    const designData = useCustomStore.getState().getShareableDesignData();
    const id = nanoid(10);

    set((state) => {
      const nextDesigns: CompareDesign[] = [
        ...state.designs,
        { id, label: label ?? null, designData, thumbnailDataUrl: null },
      ];
      return {
        setId: null, // local edits invalidate remote set link
        designs: nextDesigns,
        activeDesignId: state.activeDesignId ?? id,
      };
    });

    return id;
  },

  removeDesign: (id) =>
    set((state) => {
      const nextDesigns = state.designs.filter((d) => d.id !== id);
      const nextActive =
        state.activeDesignId === id
          ? nextDesigns[0]?.id ?? null
          : state.activeDesignId;
      return { designs: nextDesigns, activeDesignId: nextActive, setId: null };
    }),

  clearShelf: () => set({ designs: [], activeDesignId: null, setId: null }),

  setThumbnail: (id, thumbnailDataUrl) =>
    set((state) => ({
      designs: state.designs.map((d) =>
        d.id === id ? { ...d, thumbnailDataUrl } : d
      ),
    })),

  hydrateFromSharedSet: (data) => {
    const designs: CompareDesign[] = data.designs.map((d) => ({
      id: nanoid(10),
      label: d.label ?? null,
      designData: d.designData,
      thumbnailDataUrl: null,
    }));

    set({
      setId: data.setId,
      designs,
      activeDesignId: designs[0]?.id ?? null,
    });
  },

  createSharedDesignSet: async (userId, email) => {
    const { designs } = get();
    if (designs.length === 0) {
      return { success: false, error: "Add at least one design to the shelf." };
    }

    try {
      const response = await fetch("/api/shared-design-sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          designs: designs.map((d) => ({
            designData: d.designData,
            label: d.label,
          })),
          userId,
          email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create shared design set");
      }

      const result: { setId: string; setUrl: string } = await response.json();
      set({ setId: result.setId });
      return { success: true, setId: result.setId, setUrl: result.setUrl };
    } catch (error) {
      console.error("Error creating shared design set:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
}));

