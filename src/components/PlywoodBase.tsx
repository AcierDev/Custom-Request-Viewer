"use client";

import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { useCustomStore } from "@/store/customStore";
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
    <mesh
      position={[centerX, centerY, -baseThickness / 2]}
      material={material}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[totalWidth, totalHeight, baseThickness]} />
    </mesh>
  );
});
