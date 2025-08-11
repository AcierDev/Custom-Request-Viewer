import { DESIGN_COLORS } from "@/typings/color-maps";
import { ItemDesigns } from "@/typings/types";

export type ColorPattern = "horizontal" | "vertical" | "diagonal" | "random";

export interface PatternProps {
  showColorInfo?: boolean;
  showWoodGrain?: boolean;
  customDesign?: any;
}

export interface ColorMapRef extends Array<Array<number>> {
  orientation?: string;
  colorPattern?: ColorPattern;
  isReversed?: boolean;
  isRotated?: boolean;
  selectedDesign?: string;
  customPaletteLength?: number;
}

export interface TextureVariation {
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
}

export function getColorEntries(selectedDesign: string, customPalette: any[]) {
  let colorEntries: [string, { hex: string; name?: string }][] = [];

  if (selectedDesign === ItemDesigns.Custom && customPalette.length > 0) {
    colorEntries = customPalette.map((color, i) => [
      i.toString(),
      { hex: color.hex, name: `Color ${i + 1}` },
    ]);
  } else {
    const colorMap = DESIGN_COLORS[selectedDesign as ItemDesigns];
    if (colorMap) {
      colorEntries = Object.entries(colorMap);
    }
  }

  return colorEntries;
}

export function shouldBeHorizontal(x: number, y: number): boolean {
  return (x + y) % 2 === 0;
}

export function getRotation(
  x: number,
  y: number,
  isHorizontal: boolean,
  rotationSeeds: boolean[][]
): number {
  const seed = rotationSeeds[x][y];

  if (isHorizontal) {
    return seed ? Math.PI / 2 : -Math.PI / 2;
  } else {
    return seed ? 0 : Math.PI;
  }
}

export function initializeRotationSeeds(
  width: number,
  height: number
): boolean[][] {
  return Array(width)
    .fill(0)
    .map(() =>
      Array(height)
        .fill(0)
        .map(() => Math.random() < 0.5)
    );
}

export function initializeTextureVariations(
  width: number,
  height: number
): TextureVariation[][] {
  return Array(width)
    .fill(0)
    .map(() =>
      Array(height)
        .fill(0)
        .map(() => ({
          scale: 0.2 + Math.random() * 0.1,
          offsetX: Math.random(),
          offsetY: Math.random(),
          rotation: Math.random() * Math.PI * 2,
        }))
    );
}

export function shuffleArray(array: number[], seed: number = 12345): number[] {
  const shuffled = [...array];
  let currentSeed = seed;

  const random = (max: number) => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return (currentSeed / 233280) * max;
  };

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random(i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export function generateColorMap(
  adjustedModelWidth: number,
  adjustedModelHeight: number,
  colorEntries: [string, { hex: string; name?: string }][],
  orientation: "horizontal" | "vertical",
  colorPattern: ColorPattern,
  isReversed: boolean,
  isRotated: boolean,
  selectedDesign: string,
  customPaletteLength: number
): ColorMapRef {
  const colorMap: ColorMapRef = Array(adjustedModelWidth)
    .fill(0)
    .map(() => Array(adjustedModelHeight).fill(0));

  const numColors = colorEntries.length;
  if (numColors === 0) return colorMap;

  // Create array of color indices
  const colorIndices = Array.from({ length: numColors }, (_, i) => i);

  // Apply pattern logic
  let patternIndices: number[] = [];

  switch (colorPattern) {
    case "horizontal":
      patternIndices = colorIndices;
      break;
    case "vertical":
      patternIndices = colorIndices;
      break;
    case "diagonal":
      patternIndices = shuffleArray(colorIndices);
      break;
    case "random":
      patternIndices = shuffleArray(colorIndices);
      break;
    default:
      patternIndices = colorIndices;
  }

  // Fill the color map based on pattern
  for (let x = 0; x < adjustedModelWidth; x++) {
    for (let y = 0; y < adjustedModelHeight; y++) {
      let colorIndex: number;

      if (colorPattern === "horizontal") {
        // Create a smooth horizontal gradient
        const progress = x / (adjustedModelWidth - 1);
        const colorPosition = progress * (numColors - 1);
        const lowerIndex = Math.floor(colorPosition);
        const upperIndex = Math.min(lowerIndex + 1, numColors - 1);
        const fraction = colorPosition - lowerIndex;

        // Interpolate between colors for smooth transition
        colorIndex = lowerIndex;
        if (fraction > 0.5 && upperIndex !== lowerIndex) {
          colorIndex = upperIndex;
        }
      } else if (colorPattern === "vertical") {
        colorIndex = patternIndices[y % numColors];
      } else if (colorPattern === "diagonal") {
        colorIndex = patternIndices[(x + y) % numColors];
      } else {
        // random
        colorIndex = patternIndices[Math.floor(Math.random() * numColors)];
      }

      // Apply reversal and rotation
      if (isReversed) {
        colorIndex = numColors - 1 - colorIndex;
      }

      if (isRotated) {
        const tempX = x;
        const tempY = y;
        x = tempY;
        y = adjustedModelWidth - 1 - tempX;
      }

      colorMap[x][y] = colorIndex;
    }
  }

  return colorMap;
}

export function calculateBlockLayout(
  modelWidth: number,
  modelHeight: number,
  blockSize: number,
  blockSpacing: number,
  useMini: boolean = false
) {
  const adjustedModelWidth = modelWidth;
  const adjustedModelHeight = modelHeight;

  const totalWidth = adjustedModelWidth * blockSpacing * blockSize;
  const totalHeight = adjustedModelHeight * blockSpacing * blockSize;

  const offsetX = -totalWidth / 2 + blockSize / 2;
  const offsetY = -totalHeight / 2 + blockSize / 2;

  return {
    adjustedModelWidth,
    adjustedModelHeight,
    totalWidth,
    totalHeight,
    offsetX,
    offsetY,
  };
}
