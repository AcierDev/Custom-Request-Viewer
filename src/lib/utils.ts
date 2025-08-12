import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Dimensions, ItemSizes } from "@/typings/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDimensionsDetails(dimensions: Dimensions) {
  // For this viewer, dimensions are already in blocks, not inches
  // So we return the block dimensions directly
  return {
    blocks: {
      width: dimensions.width,
      height: dimensions.height,
    },
    inches: {
      width: dimensions.width * 3, // Each block is 3 inches
      height: dimensions.height * 3,
    },
  };
}

// Color utility functions for lighting adjustments
export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function adjustColorBrightness(hex: string, factor: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = Math.max(0, Math.min(255, Math.round(rgb.r * factor)));
  const g = Math.max(0, Math.min(255, Math.round(rgb.g * factor)));
  const b = Math.max(0, Math.min(255, Math.round(rgb.b * factor)));

  return rgbToHex(r, g, b);
}

export function adjustColorTemperature(hex: string, warmth: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  // Warmth factor: positive = warmer (more red/orange), negative = cooler (more blue)
  const r = Math.max(0, Math.min(255, Math.round(rgb.r + warmth * 20)));
  const g = Math.max(0, Math.min(255, Math.round(rgb.g + warmth * 10)));
  const b = Math.max(0, Math.min(255, Math.round(rgb.b - warmth * 15)));

  return rgbToHex(r, g, b);
}

export function getBackgroundColorForLighting(
  baseColor: string,
  lightingPreset: "gallery" | "contrast" | "cozy" | "sunlit"
): string {
  switch (lightingPreset) {
    case "gallery":
      // Neutral, slight darkening for gallery feel
      return adjustColorBrightness(baseColor, 0.95);

    case "contrast":
      // Darker background for high contrast
      return adjustColorBrightness(baseColor, 0.7);

    case "cozy":
      // Warmer, darker background for evening feel
      let cozyColor = adjustColorBrightness(baseColor, 0.6);
      cozyColor = adjustColorTemperature(cozyColor, 0.3); // Add warmth
      return cozyColor;

    case "sunlit":
      // Lighter, warmer background for bright daylight
      let sunlitColor = adjustColorBrightness(baseColor, 1.2);
      sunlitColor = adjustColorTemperature(sunlitColor, 0.2); // Slight warmth
      return sunlitColor;

    default:
      return baseColor;
  }
}
