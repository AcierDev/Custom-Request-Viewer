import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Dimensions, ItemSizes } from "@/typings/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDimensionsDetails(dimensions: Dimensions) {
  const sizeKey = `${dimensions.width} x ${dimensions.height}` as ItemSizes;

  const details = {
    [ItemSizes.TwentyEight_By_Twelve]: {
      blocks: { width: 56, height: 24 },
      inches: { width: 28, height: 12 },
    },
    [ItemSizes.TwentyFour_By_Twelve]: {
      blocks: { width: 48, height: 24 },
      inches: { width: 24, height: 12 },
    },
    [ItemSizes.Twenty_By_Twelve]: {
      blocks: { width: 40, height: 24 },
      inches: { width: 20, height: 12 },
    },
    [ItemSizes.Twenty_By_Ten]: {
      blocks: { width: 40, height: 20 },
      inches: { width: 20, height: 10 },
    },
    [ItemSizes.Sixteen_By_Ten]: {
      blocks: { width: 32, height: 20 },
      inches: { width: 16, height: 10 },
    },
    [ItemSizes.Sixteen_By_Six]: {
      blocks: { width: 32, height: 12 },
      inches: { width: 16, height: 6 },
    },
    [ItemSizes.Fourteen_By_Seven]: {
      blocks: { width: 28, height: 14 },
      inches: { width: 14, height: 7 },
    },
  };

  return details[sizeKey] || details[ItemSizes.TwentyEight_By_Twelve];
}
