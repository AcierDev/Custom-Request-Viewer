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
