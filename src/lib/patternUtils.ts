import { DESIGN_COLORS } from "@/typings/color-maps";
import { ItemDesigns } from "@/typings/types";

export type ColorPattern =
  | "horizontal"
  | "vertical"
  | "diagonal"
  | "random"
  | "striped"
  | "gradient"
  | "checkerboard"
  | "fade"
  | "center-fade";

// Valid color patterns for validation
export const VALID_COLOR_PATTERNS: ColorPattern[] = [
  "horizontal",
  "vertical",
  "diagonal",
  "random",
  "striped",
  "gradient",
  "checkerboard",
  "fade",
  "center-fade",
];

// Helper function to validate and normalize color patterns
export function validateColorPattern(pattern: string): ColorPattern {
  return VALID_COLOR_PATTERNS.includes(pattern as ColorPattern)
    ? (pattern as ColorPattern)
    : "fade";
}

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

  // If there's a custom palette, use it regardless of selected design
  if (customPalette && customPalette.length > 0) {
    colorEntries = customPalette.map((color, i) => [
      i.toString(),
      { hex: color.hex, name: color.name || `Color ${i + 1}` },
    ]);
  } else {
    // Fall back to official design colors if no custom palette
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
    .map((_, x) =>
      Array(height)
        .fill(0)
        .map((_, y) => ({
          scale: 0.15 + Math.abs(Math.sin(x * y * 3.14)) * 0.2,
          offsetX: Math.abs((Math.sin(x * 2.5) * Math.cos(y * 1.7)) % 1),
          offsetY: Math.abs((Math.cos(x * 1.8) * Math.sin(y * 2.2)) % 1),
          rotation: (Math.sin(x * y) * Math.PI) / 6,
        }))
    );
}

export function shuffleArray(array: number[], seed: number = 12345): number[] {
  const result = [...array];
  let currentIndex = result.length;

  // Seeded random function
  const random = (max: number) => {
    const x = Math.sin(seed + currentIndex) * 10000;
    return Math.floor((x - Math.floor(x)) * max);
  };

  // Fisher-Yates shuffle with seeded randomness
  while (currentIndex > 0) {
    const randomIndex = random(currentIndex);
    currentIndex--;

    [result[currentIndex], result[randomIndex]] = [
      result[randomIndex],
      result[currentIndex],
    ];
  }

  return result;
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
  // Validate colorPattern and default to "fade" if unrecognized
  const effectiveColorPattern = validateColorPattern(colorPattern);

  // Total number of blocks
  const totalBlocks = adjustedModelWidth * adjustedModelHeight;

  // Create the 2D color map
  const colorMap: ColorMapRef = Array(adjustedModelWidth)
    .fill(0)
    .map(() => Array(adjustedModelHeight).fill(0));

  // Determine effective orientation based on rotation
  const effectiveOrientation = isRotated
    ? orientation === "horizontal"
      ? "vertical"
      : "horizontal"
    : orientation;

  console.log(effectiveColorPattern);

  if (
    effectiveColorPattern === "fade" ||
    effectiveColorPattern === "center-fade"
  ) {
    // For fade patterns, use the new column-based distribution approach
    const totalBlocks = adjustedModelWidth * adjustedModelHeight;

    // Calculate how many blocks each color should get
    const blocksPerColor = Math.floor(totalBlocks / colorEntries.length);
    const extraBlocks = totalBlocks % colorEntries.length;

    // Create an array with the exact number of blocks for each color
    const allColorIndices: number[] = [];
    for (let i = 0; i < colorEntries.length; i++) {
      const blockCount = blocksPerColor + (i < extraBlocks ? 1 : 0);
      for (let j = 0; j < blockCount; j++) {
        allColorIndices.push(i);
      }
    }

    // For fade, we want sequential progression, not random shuffling
    // The array is already in order: [0,0,0,...,1,1,1,...,2,2,2,...]
    const sequentialColors = [...allColorIndices];

    // Determine the progression direction based on orientation and pattern type
    let progressDirection: "horizontal" | "vertical";
    let isCenterFade = false;

    if (effectiveColorPattern === "center-fade") {
      isCenterFade = true;
      progressDirection = effectiveOrientation;
    } else {
      progressDirection = effectiveOrientation;
    }

    // Apply reversal if needed
    const shouldReverse = isReversed;

    // Fill the grid based on rotation mode
    let colorIndex = 0;

    if (isRotated) {
      // For rotated mode, always fill row by row regardless of original orientation
      const rowOrder = shouldReverse
        ? Array.from(
            { length: adjustedModelHeight },
            (_, i) => adjustedModelHeight - 1 - i
          )
        : Array.from({ length: adjustedModelHeight }, (_, i) => i);

      for (const y of rowOrder) {
        // Fill this row with the next available colors
        const rowPositions = Array.from(
          { length: adjustedModelWidth },
          (_, i) => i
        );

        for (let x = 0; x < adjustedModelWidth; x++) {
          if (colorIndex < sequentialColors.length) {
            colorMap[x][y] = sequentialColors[colorIndex++];
          } else {
            // Fallback if we run out of colors
            colorMap[x][y] = sequentialColors[sequentialColors.length - 1];
          }
        }

        // If this row has a color transition, randomize the positions within the row
        if (colorIndex > 0 && colorIndex < sequentialColors.length) {
          // Find where the color transition happened in this row
          let transitionX = -1;
          for (let x = 0; x < adjustedModelWidth; x++) {
            if (colorMap[x][y] !== colorMap[0][y]) {
              transitionX = x;
              break;
            }
          }

          if (transitionX !== -1) {
            // Randomize ALL positions in the row
            const shuffledPositions = shuffleArray([...rowPositions]);

            // Reassign the colors to the shuffled positions
            for (let i = 0; i < rowPositions.length; i++) {
              const originalX = rowPositions[i];
              const newX = shuffledPositions[i];
              const tempColor = colorMap[originalX][y];
              colorMap[originalX][y] = colorMap[newX][y];
              colorMap[newX][y] = tempColor;
            }
          }
        }
      }

      // For rotated mode, check for adjacent rows with different single colors and blend them
      for (let y = 0; y < adjustedModelHeight - 1; y++) {
        const currentRow = [];
        const nextRow = [];

        // Extract the current and next rows
        for (let x = 0; x < adjustedModelWidth; x++) {
          currentRow.push(colorMap[x][y]);
          nextRow.push(colorMap[x][y + 1]);
        }

        // Check if both rows are single color
        const currentColor = currentRow[0];
        const nextColor = nextRow[0];

        let currentRowSingleColor = true;
        let nextRowSingleColor = true;

        // Check if current row is all the same color
        for (let x = 0; x < adjustedModelWidth; x++) {
          if (currentRow[x] !== currentColor) {
            currentRowSingleColor = false;
            break;
          }
        }

        // Check if next row is all the same color
        for (let x = 0; x < adjustedModelWidth; x++) {
          if (nextRow[x] !== nextColor) {
            nextRowSingleColor = false;
            break;
          }
        }

        // If both rows are single color and different, blend them
        if (
          currentRowSingleColor &&
          nextRowSingleColor &&
          currentColor !== nextColor
        ) {
          const blocksToSwap = Math.floor(adjustedModelWidth * 0.25); // 25% of blocks

          // Choose random positions from the first row
          const allPositions = Array.from(
            { length: adjustedModelWidth },
            (_, i) => i
          );
          // Use a different seed for each row pair to ensure true randomization
          const shuffledPositions = shuffleArray(
            [...allPositions],
            Math.random() * 10000 + y
          );
          const positionsFromFirstRow = shuffledPositions.slice(
            0,
            blocksToSwap
          );

          // Choose random positions from the second row (excluding the ones from first row)
          const remainingPositions = shuffledPositions.slice(blocksToSwap);
          const positionsFromSecondRow = remainingPositions.slice(
            0,
            blocksToSwap
          );

          // Swap the blocks
          for (let i = 0; i < blocksToSwap; i++) {
            const firstX = positionsFromFirstRow[i];
            const secondX = positionsFromSecondRow[i];

            // Swap the colors
            const tempColor = colorMap[firstX][y];
            colorMap[firstX][y] = colorMap[secondX][y + 1];
            colorMap[secondX][y + 1] = tempColor;
          }
        }
      }
    } else if (progressDirection === "horizontal") {
      // Fill columns from left to right (or right to left if reversed)
      const columnOrder = shouldReverse
        ? Array.from(
            { length: adjustedModelWidth },
            (_, i) => adjustedModelWidth - 1 - i
          )
        : Array.from({ length: adjustedModelWidth }, (_, i) => i);

      for (const x of columnOrder) {
        // Fill this column with the next available colors
        const columnPositions = Array.from(
          { length: adjustedModelHeight },
          (_, i) => i
        );

        for (let y = 0; y < adjustedModelHeight; y++) {
          if (colorIndex < sequentialColors.length) {
            colorMap[x][y] = sequentialColors[colorIndex++];
          } else {
            // Fallback if we run out of colors
            colorMap[x][y] = sequentialColors[sequentialColors.length - 1];
          }
        }

        // If this column has a color transition, randomize the positions within the column
        if (colorIndex > 0 && colorIndex < sequentialColors.length) {
          // Find where the color transition happened in this column
          let transitionY = -1;
          for (let y = 0; y < adjustedModelHeight; y++) {
            if (colorMap[x][y] !== colorMap[x][0]) {
              transitionY = y;
              break;
            }
          }

          if (transitionY !== -1) {
            // Randomize ALL positions in the column
            const shuffledPositions = shuffleArray([...columnPositions]);

            // Reassign the colors to the shuffled positions
            for (let i = 0; i < columnPositions.length; i++) {
              const originalY = columnPositions[i];
              const newY = shuffledPositions[i];
              const tempColor = colorMap[x][originalY];
              colorMap[x][originalY] = colorMap[x][newY];
              colorMap[x][newY] = tempColor;
            }
          }
        }
      }
    } else {
      // Fill rows from top to bottom (or bottom to top if reversed)
      const rowOrder = shouldReverse
        ? Array.from(
            { length: adjustedModelHeight },
            (_, i) => adjustedModelHeight - 1 - i
          )
        : Array.from({ length: adjustedModelHeight }, (_, i) => i);

      for (const y of rowOrder) {
        // Fill this row with the next available colors
        const rowPositions = Array.from(
          { length: adjustedModelWidth },
          (_, i) => i
        );

        for (let x = 0; x < adjustedModelWidth; x++) {
          if (colorIndex < sequentialColors.length) {
            colorMap[x][y] = sequentialColors[colorIndex++];
          } else {
            // Fallback if we run out of colors
            colorMap[x][y] = sequentialColors[sequentialColors.length - 1];
          }
        }

        // If this row has a color transition, randomize the positions within the row
        if (colorIndex > 0 && colorIndex < sequentialColors.length) {
          // Find where the color transition happened in this row
          let transitionX = -1;
          for (let x = 0; x < adjustedModelWidth; x++) {
            if (colorMap[x][y] !== colorMap[0][y]) {
              transitionX = x;
              break;
            }
          }

          if (transitionX !== -1) {
            // Randomize ALL positions in the row
            const shuffledPositions = shuffleArray([...rowPositions]);

            // Reassign the colors to the shuffled positions
            for (let i = 0; i < rowPositions.length; i++) {
              const originalX = rowPositions[i];
              const newX = shuffledPositions[i];
              const tempColor = colorMap[originalX][y];
              colorMap[originalX][y] = colorMap[newX][y];
              colorMap[newX][y] = tempColor;
            }
          }
        }
      }
    }

    // After distributing all colors, check for adjacent columns with different single colors
    // and blend them by swapping 25% of blocks
    // Skip blending for rotated mode as requested
    if (!isRotated && effectiveOrientation === "horizontal") {
      for (let x = 0; x < adjustedModelWidth - 1; x++) {
        const currentColumn = colorMap[x];
        const nextColumn = colorMap[x + 1];

        // Check if both columns are single color
        const currentColor = currentColumn[0];
        const nextColor = nextColumn[0];

        let currentColumnSingleColor = true;
        let nextColumnSingleColor = true;

        // Check if current column is all the same color
        for (let y = 0; y < adjustedModelHeight; y++) {
          if (currentColumn[y] !== currentColor) {
            currentColumnSingleColor = false;
            break;
          }
        }

        // Check if next column is all the same color
        for (let y = 0; y < adjustedModelHeight; y++) {
          if (nextColumn[y] !== nextColor) {
            nextColumnSingleColor = false;
            break;
          }
        }

        // If both columns are single color and different, blend them
        if (
          currentColumnSingleColor &&
          nextColumnSingleColor &&
          currentColor !== nextColor
        ) {
          const blocksToSwap = Math.floor(adjustedModelHeight * 0.25); // 25% of blocks

          // Choose random positions from the first column
          const allPositions = Array.from(
            { length: adjustedModelHeight },
            (_, i) => i
          );
          // Use a different seed for each column pair to ensure true randomization
          const shuffledPositions = shuffleArray(
            [...allPositions],
            Math.random() * 10000 + x
          );
          const positionsFromFirstColumn = shuffledPositions.slice(
            0,
            blocksToSwap
          );

          // Choose random positions from the second column (excluding the ones from first column)
          const remainingPositions = shuffledPositions.slice(blocksToSwap);
          const positionsFromSecondColumn = remainingPositions.slice(
            0,
            blocksToSwap
          );

          // Swap the blocks
          for (let i = 0; i < blocksToSwap; i++) {
            const firstY = positionsFromFirstColumn[i];
            const secondY = positionsFromSecondColumn[i];

            // Swap the colors
            const tempColor = colorMap[x][firstY];
            colorMap[x][firstY] = colorMap[x + 1][secondY];
            colorMap[x + 1][secondY] = tempColor;
          }
        }
      }
    } else if (!isRotated) {
      // For vertical orientation, check rows instead of columns (skip blending for rotated mode)
      for (let y = 0; y < adjustedModelHeight - 1; y++) {
        const currentRow = [];
        const nextRow = [];

        // Extract the current and next rows
        for (let x = 0; x < adjustedModelWidth; x++) {
          currentRow.push(colorMap[x][y]);
          nextRow.push(colorMap[x][y + 1]);
        }

        // Check if both rows are single color
        const currentColor = currentRow[0];
        const nextColor = nextRow[0];

        let currentRowSingleColor = true;
        let nextRowSingleColor = true;

        // Check if current row is all the same color
        for (let x = 0; x < adjustedModelWidth; x++) {
          if (currentRow[x] !== currentColor) {
            currentRowSingleColor = false;
            break;
          }
        }

        // Check if next row is all the same color
        for (let x = 0; x < adjustedModelWidth; x++) {
          if (nextRow[x] !== nextColor) {
            nextRowSingleColor = false;
            break;
          }
        }

        // If both rows are single color and different, blend them
        if (
          currentRowSingleColor &&
          nextRowSingleColor &&
          currentColor !== nextColor
        ) {
          const blocksToSwap = Math.floor(adjustedModelWidth * 0.25); // 25% of blocks

          // Choose random positions from the first row
          const allPositions = Array.from(
            { length: adjustedModelWidth },
            (_, i) => i
          );
          // Use a different seed for each row pair to ensure true randomization
          const shuffledPositions = shuffleArray(
            [...allPositions],
            Math.random() * 10000 + y
          );
          const positionsFromFirstRow = shuffledPositions.slice(
            0,
            blocksToSwap
          );

          // Choose random positions from the second row (excluding the ones from first row)
          const remainingPositions = shuffledPositions.slice(blocksToSwap);
          const positionsFromSecondRow = remainingPositions.slice(
            0,
            blocksToSwap
          );

          // Swap the blocks
          for (let i = 0; i < blocksToSwap; i++) {
            const firstX = positionsFromFirstRow[i];
            const secondX = positionsFromSecondRow[i];

            // Swap the colors
            const tempColor = colorMap[firstX][y];
            colorMap[firstX][y] = colorMap[secondX][y + 1];
            colorMap[secondX][y + 1] = tempColor;
          }
        }
      }
    }
  } else if (effectiveColorPattern === "random") {
    // For random pattern, distribute colors evenly but randomly
    const blocksPerColor = Math.floor(totalBlocks / colorEntries.length);
    const extraBlocks = totalBlocks % colorEntries.length;

    // Create an array with the right number of each color index
    const allColorIndices: number[] = [];
    for (let i = 0; i < colorEntries.length; i++) {
      const blockCount = blocksPerColor + (i < extraBlocks ? 1 : 0);
      for (let j = 0; j < blockCount; j++) {
        allColorIndices.push(i);
      }
    }

    // Shuffle the colors
    const shuffledColors = shuffleArray([...allColorIndices]);

    // Distribute randomly
    let index = 0;
    for (let x = 0; x < adjustedModelWidth; x++) {
      for (let y = 0; y < adjustedModelHeight; y++) {
        colorMap[x][y] = shuffledColors[index++ % shuffledColors.length];
      }
    }
  } else {
    // For other patterns (striped, gradient, checkerboard), create more structured patterns
    for (let x = 0; x < adjustedModelWidth; x++) {
      for (let y = 0; y < adjustedModelHeight; y++) {
        let colorIndex: number;

        switch (effectiveColorPattern) {
          case "striped":
            // Create stripes based on effective orientation
            if (effectiveOrientation === "horizontal") {
              colorIndex = x % colorEntries.length;
            } else {
              colorIndex = y % colorEntries.length;
            }
            break;

          case "gradient":
            // Similar to fade but with more defined transitions
            const gradientProgress =
              effectiveOrientation === "horizontal"
                ? x / (adjustedModelWidth - 1)
                : y / (adjustedModelHeight - 1);

            const adjustedGradientProgress = isReversed
              ? 1 - gradientProgress
              : gradientProgress;
            colorIndex = Math.floor(
              adjustedGradientProgress * colorEntries.length
            );
            break;

          case "checkerboard":
            // Checkerboard pattern
            colorIndex = (x + y) % colorEntries.length;
            break;

          default:
            // Fallback to random
            colorIndex = Math.floor(Math.random() * colorEntries.length);
        }

        // Apply reversal if needed
        if (isReversed) {
          colorIndex = colorEntries.length - 1 - colorIndex;
        }

        colorMap[x][y] = Math.min(colorIndex, colorEntries.length - 1);
      }
    }
  }

  // Add properties to track the current settings
  Object.defineProperty(colorMap, "orientation", {
    value: orientation,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(colorMap, "colorPattern", {
    value: effectiveColorPattern,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(colorMap, "isReversed", {
    value: isReversed,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(colorMap, "isRotated", {
    value: isRotated,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(colorMap, "selectedDesign", {
    value: selectedDesign,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(colorMap, "customPaletteLength", {
    value: customPaletteLength,
    writable: true,
    configurable: true,
  });

  return colorMap;
}

export function calculateBlockLayout(
  modelWidth: number,
  modelHeight: number,
  blockSize: number,
  blockSpacing: number,
  useMini: boolean = false
) {
  // Calculate adjusted dimensions for mini mode
  const adjustedModelWidth = useMini ? Math.ceil(modelWidth * 1.1) : modelWidth;
  const adjustedModelHeight = useMini
    ? Math.ceil(modelHeight * 1.1)
    : modelHeight;

  // Calculate total dimensions based on actual block spacing
  const totalWidth = adjustedModelWidth * blockSize * blockSpacing;
  const totalHeight = adjustedModelHeight * blockSize * blockSpacing;

  // Calculate offsets with adjustment for mini mode
  const offsetX = -totalWidth / 2 - 0.25 + (useMini ? 0.03 : 0);
  const offsetY = -totalHeight / 2 - 0.25 + (useMini ? 0.03 : 0);

  return {
    adjustedModelWidth,
    adjustedModelHeight,
    totalWidth,
    totalHeight,
    offsetX,
    offsetY,
  };
}
