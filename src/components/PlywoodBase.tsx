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
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load texture
  useEffect(() => {
    if (!showWoodGrain) {
      setTexture(null);
      setIsLoading(false);
      return;
    }

    const loader = new TextureLoader();
    loader.load(
      "/textures/plywood.jpg",
      (loadedTexture) => {
        loadedTexture.wrapS = loadedTexture.wrapT = THREE.RepeatWrapping;
        loadedTexture.repeat.set(width / 2, height / 2);
        loadedTexture.anisotropy = 8;
        setTexture(loadedTexture);
        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.error("Error loading plywood texture:", error);
        setIsLoading(false);
      }
    );
  }, [showWoodGrain, width, height]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      color: showWoodGrain ? "#8B5E3B" : "#D2B48C",
      roughness: 0.9,
      metalness: 0.1,
    });
  }, [texture, showWoodGrain]);

  // Calculate base dimensions
  const baseWidth = width + blockSize * 2;
  const baseHeight = height + blockSize * 2;
  const baseDepth = blockSize * 0.1; // Very thin base

  return (
    <mesh
      position={[0, 0, -baseDepth / 2]}
      material={material}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[baseWidth, baseHeight, baseDepth]} />
    </mesh>
  );
});
