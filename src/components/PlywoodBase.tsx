"use client";

import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { useCustomStore } from "@/store/customStore";
import { getColorEntries } from "@/lib/patternUtils";
import { useEffect, useState, useMemo, memo } from "react";
import * as THREE from "three";

interface PlywoodBaseProps {
  width: number;
  height: number;
  showWoodGrain?: boolean;
  blockSize: number;
  adjustedModelWidth: number;
  adjustedModelHeight: number;
  useMini: boolean;
}

export const PlywoodBase = memo(function PlywoodBase({
  width,
  height,
  showWoodGrain = true,
  blockSize,
  adjustedModelWidth,
  adjustedModelHeight,
  useMini,
}: PlywoodBaseProps) {
  // Load texture using useLoader for better performance
  const texture = showWoodGrain
    ? useLoader(TextureLoader, "/textures/plywood.jpg", (loader) => {
        console.log("Plywood texture loaded successfully");
      })
    : null;

  // Debug texture loading
  useEffect(() => {
    if (showWoodGrain) {
      console.log("Plywood texture status:", texture ? "loaded" : "not loaded");
    }
  }, [texture, showWoodGrain]);

  // Get store values for color calculation
  const { selectedDesign, customPalette, isReversed, colorPattern } =
    useCustomStore();

  // Memoize all calculations to prevent recalculation on every render
  const dimensions = useMemo(() => {
    // Use the same blockSpacing factor as in GeometricPattern
    const blockSpacing = useMini ? 0.9 : 1;
    const baseThickness = 0.07;

    // Compute accurate dimensions using the same calculation as the geometric pattern
    const totalWidth = adjustedModelWidth * blockSize * blockSpacing;
    const totalHeight = adjustedModelHeight * blockSize * blockSpacing;

    const offsetX = -totalWidth / 2 - 0.25 + (useMini ? 0.03 : 0);
    const offsetY = -totalHeight / 2 - 0.25 + (useMini ? 0.03 : 0);

    // Compute center position to align with the blocks grid
    const centerX =
      offsetX +
      blockSize / 2 +
      ((adjustedModelWidth - 1) * blockSize * blockSpacing) / 2;
    const centerY =
      offsetY +
      blockSize / 2 +
      ((adjustedModelHeight - 1) * blockSize * blockSpacing) / 2;

    return {
      baseThickness,
      totalWidth,
      totalHeight,
      centerX,
      centerY,
      offsetX,
      offsetY,
    };
  }, [adjustedModelWidth, adjustedModelHeight, blockSize, useMini]);

  // Destructure memoized values
  const { baseThickness, totalWidth, totalHeight, centerX, centerY } =
    dimensions;

  // Memoize colors to prevent recalculation
  const colors = useMemo(() => {
    // Get the appropriate color entries
    const colorEntries = getColorEntries(selectedDesign, customPalette);

    // Determine the colors based on pattern and reverse settings
    let leftColor = "#8B5E3B";
    let rightColor = "#8B5E3B";

    if (colorEntries.length > 0) {
      // For all patterns, respect the reverse setting
      if (isReversed) {
        leftColor = colorEntries[colorEntries.length - 1][1].hex;
        rightColor = colorEntries[0][1].hex;
      } else {
        leftColor = colorEntries[0][1].hex;
        rightColor = colorEntries[colorEntries.length - 1][1].hex;
      }
    }

    return { leftColor, rightColor };
  }, [selectedDesign, customPalette, isReversed, colorPattern]);

  const { leftColor, rightColor } = colors;

  // Process texture if available
  useEffect(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(totalWidth / 2, totalHeight / 2);
      texture.anisotropy = 8;
      texture.needsUpdate = true;
    }
  }, [texture, totalWidth, totalHeight]);

  // Create material with memoization
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      color: showWoodGrain ? "#FFFFFF" : "#D2B48C", // Use white when texture is applied
      roughness: 0.9,
      metalness: 0.1,
    });

    // Ensure the material updates when texture changes
    if (texture) {
      mat.needsUpdate = true;
    }

    return mat;
  }, [texture, showWoodGrain]);

  return (
    <>
      {/* Main plywood base */}
      <mesh
        position={[centerX, centerY, -baseThickness / 2]}
        material={material}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[totalWidth, totalHeight, baseThickness]} />
      </mesh>

      {/* Left side panel - colored */}
      <mesh
        position={[
          (useMini ? 0.03 : 0) - 0.248 - totalWidth / 2,
          (useMini ? 0.03 : 0) - 0.25,
          -0.035,
        ]}
        rotation={[0, Math.PI / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[baseThickness + 0.001, totalHeight + 0.001, 0.005]}
        />
        <meshStandardMaterial
          color={leftColor}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Right side panel - colored */}
      <mesh
        position={[
          (useMini ? -0.47 : -0.5) + 0.248 + totalWidth / 2 + 0.001,
          (useMini ? 0.03 : 0) - 0.25,
          -0.035,
        ]}
        rotation={[0, Math.PI / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[baseThickness + 0.001, totalHeight + 0.001, 0.005]}
        />
        <meshStandardMaterial
          color={rightColor}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
    </>
  );
});
