"use client";

import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useCustomStore } from "@/store/customStore";

interface BlockProps {
  position: [number, number, number];
  size: number;
  height: number;
  color: string;
  isHovered?: boolean;
  onHover?: (isHovering: boolean) => void;
  onClick?: () => void;
  showWoodGrain?: boolean;
  showColorInfo?: boolean;
  isGeometric?: boolean;
  rotation?: number;
  reducedSize?: boolean;
  textureVariation?: {
    scale: number;
    offsetX: number;
    offsetY: number;
    rotation: number;
  };
}

// Create a wedge geometry function - moved outside component for reuse
const createWedgeGeometry = (): THREE.BufferGeometry => {
  // Use a static variable to cache the geometry
  if ((createWedgeGeometry as any).cachedGeometry) {
    return (createWedgeGeometry as any).cachedGeometry;
  }

  const geometry = new THREE.BufferGeometry();

  // Calculate height based on 21.5 degree angle
  const angleInRadians = (21.5 * Math.PI) / 180;
  const height = Math.tan(angleInRadians);

  // Define vertices for a wedge with square base
  const positions: number[] = [
    // Base (bottom)
    -0.5, -0.5, 0, // v0 - back left
    0.5, -0.5, 0, // v1 - back right
    0.5, 0.5, 0, // v2 - front right
    -0.5, 0.5, 0, // v3 - front left

    // Top
    -0.5, -0.5, height, // v4 - back left (elevated)
    0.5, -0.5, height, // v5 - back right (elevated)
    0.5, 0.5, 0, // v6 - front right (same as base)
    -0.5, 0.5, 0, // v7 - front left (same as base)
  ];

  // Define faces using triangle indices
  const indices: number[] = [
    // Bottom face
    0, 2, 1, 0, 3, 2,

    // Top sloped face
    4, 5, 6, 4, 6, 7,

    // Left face
    0, 4, 7, 0, 7, 3,

    // Right face
    1, 2, 6, 1, 6, 5,

    // Back face
    0, 1, 5, 0, 5, 4,

    // Front face
    3, 7, 6, 3, 6, 2,
  ];

  // Calculate normals
  const normals: number[] = [];
  // Create a temporary geometry to compute normals
  const tempGeometry = new THREE.BufferGeometry();
  tempGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  tempGeometry.setIndex(indices);
  tempGeometry.computeVertexNormals();

  // Extract computed normals
  const normalAttribute = tempGeometry.getAttribute("normal");
  for (let i = 0; i < normalAttribute.count; i++) {
    normals.push(
      normalAttribute.getX(i),
      normalAttribute.getY(i),
      normalAttribute.getZ(i)
    );
  }

  // Generate UVs for texture mapping
  const uvs: number[] = [
    // Base
    0, 0, 1, 0, 1, 1, 0, 1,

    // Top
    0, 0, 1, 0, 1, 1, 0, 1,
  ];

  // Set attributes
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  // Center the geometry
  geometry.center();

  // Cache the geometry
  (createWedgeGeometry as any).cachedGeometry = geometry;
  return geometry;
};

// Memoize the wedge geometry - now outside of render cycles and shared across all instances
const wedgeGeometry = createWedgeGeometry();
// Create a shared box geometry
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

// Create texture loader outside components to reuse
let textureCache: Record<string, THREE.Texture> = {};

export function Block({
  position,
  size,
  height,
  color,
  isHovered,
  onHover,
  onClick,
  showWoodGrain = true,
  showColorInfo = true,
  isGeometric = false,
  rotation = 0,
  textureVariation = {
    scale: 0.2,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
  },
}: BlockProps) {
  const [x, y, z] = position;
  const adjustedPosition: [number, number, number] = [x, y, z + height / 2];
  const meshRef = useRef<THREE.Mesh>(null);

  // Load textures with caching - load only if wood grain is shown
  const texturePaths = showWoodGrain
    ? ["/textures/bw-wood-texture-4.jpg", "/textures/wood-side-grain.jpg"]
    : [];

  const textures = useTexture(texturePaths);
  const topTexture = showWoodGrain ? textures[0] : null;
  const sideTexture = showWoodGrain ? textures[1] : null;

  // Create unique textures with useMemo to prevent unnecessary recreation
  const { uniqueTopTexture, uniqueSideTexture } = useMemo(() => {
    if (!showWoodGrain)
      return { uniqueTopTexture: null, uniqueSideTexture: null };

    const top = topTexture?.clone();
    const side = sideTexture?.clone();

    if (top) {
      // Process top texture
      top.wrapS = top.wrapT = THREE.RepeatWrapping;
      // Always use the provided textureVariation regardless of isGeometric
      const topScale = textureVariation.scale;
      top.repeat.set(topScale, topScale);
      top.anisotropy = 8; // Reduced from 16 for performance

      // Always use the provided textureVariation for offsets
      const topOffsetX = textureVariation.offsetX;
      const topOffsetY = textureVariation.offsetY;
      const textureRotation = textureVariation.rotation;

      top.rotation = textureRotation;
      top.offset.set(topOffsetX, topOffsetY);
    }

    if (side) {
      // Process side texture
      side.wrapS = side.wrapT = THREE.RepeatWrapping;
      const sideScale = 0.2;
      side.repeat.set(sideScale, sideScale);
      side.anisotropy = 8; // Reduced from 16 for performance
    }

    return { uniqueTopTexture: top, uniqueSideTexture: side };
  }, [showWoodGrain, topTexture, sideTexture, textureVariation]);

  // Create materials with better memoization pattern
  const materialKey = `${color}-${isHovered}-${showWoodGrain}-${showColorInfo}`;

  // Create a single material for geometric blocks
  const geometricMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: showWoodGrain ? uniqueTopTexture : null,
        color,
        roughness: 0.8,
        metalness: 0.05,
        emissive: isHovered && showColorInfo ? color : "#000000",
        emissiveIntensity: isHovered && showColorInfo ? 0.5 : 0,
      }),
    [uniqueTopTexture, color, isHovered, showWoodGrain, showColorInfo]
  );

  // Update material properties for existing material instead of creating new materials
  useEffect(() => {
    if (meshRef.current) {
      const material = meshRef.current.material;

      if (Array.isArray(material)) {
        material.forEach((m) => {
          if (m instanceof THREE.MeshStandardMaterial) {
            m.emissive.set(isHovered && showColorInfo ? color : "#000000");
            m.emissiveIntensity = isHovered && showColorInfo ? 0.5 : 0;
            m.needsUpdate = true;
          }
        });
      } else if (material instanceof THREE.MeshStandardMaterial) {
        material.emissive.set(isHovered && showColorInfo ? color : "#000000");
        material.emissiveIntensity = isHovered && showColorInfo ? 0.5 : 0;
        material.needsUpdate = true;
      }
    }
  }, [isHovered, color, showColorInfo]);

  const { useMini } = useCustomStore();

  if (isGeometric) {
    // Apply 10% size reduction if reducedSize is true
    const sizeScale = useMini ? 0.9 : 1.0;
    const adjustedSize = size * sizeScale;
    const adjustedHeight = height * sizeScale;

    return (
      <mesh
        ref={meshRef}
        position={adjustedPosition}
        rotation={[0, 0, rotation]}
        scale={[adjustedSize, adjustedSize, adjustedHeight]}
        geometry={wedgeGeometry}
        material={geometricMaterial}
        castShadow
        receiveShadow
        onPointerEnter={(e) => {
          e.stopPropagation();
          onHover?.(true);
        }}
        onPointerLeave={() => onHover?.(false)}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      />
    );
  }

  // For non-geometric blocks, use a simple box
  return (
    <mesh
      ref={meshRef}
      position={adjustedPosition}
      scale={[size, size, height]}
      geometry={boxGeometry}
      material={geometricMaterial}
      castShadow
      receiveShadow
      onPointerEnter={(e) => {
        e.stopPropagation();
        onHover?.(true);
      }}
      onPointerLeave={() => onHover?.(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    />
  );
}
