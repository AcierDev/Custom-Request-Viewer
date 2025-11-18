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
    -0.5,
    -0.5,
    0, // v0 - back left
    0.5,
    -0.5,
    0, // v1 - back right
    0.5,
    0.5,
    0, // v2 - front right
    -0.5,
    0.5,
    0, // v3 - front left

    // Top
    -0.5,
    -0.5,
    height, // v4 - back left (elevated)
    0.5,
    -0.5,
    height, // v5 - back right (elevated)
    0.5,
    0.5,
    0, // v6 - front right (same as base)
    -0.5,
    0.5,
    0, // v7 - front left (same as base)
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
  // We need UVs for all 8 vertices
  // Bottom face vertices (0-3): map as square for top texture
  // Top face vertices (4-7): map as square for top texture
  // Side faces will use side texture via material groups
  const uvs: number[] = [
    // Bottom vertices (0-3) - for bottom face
    0,
    0, // v0 - back left
    1,
    0, // v1 - back right
    1,
    1, // v2 - front right
    0,
    1, // v3 - front left

    // Top vertices (4-7) - for top face
    0,
    0, // v4 - back left (elevated)
    1,
    0, // v5 - back right (elevated)
    1,
    1, // v6 - front right (same as v2)
    0,
    1, // v7 - front left (same as v3)
  ];

  // For proper UV mapping on side faces, we need to duplicate vertices
  // since side faces need different UV coordinates than top/bottom faces
  const finalPositions: number[] = [];
  const finalNormals: number[] = [];
  const finalUVs: number[] = [];
  const finalIndices: number[] = [];
  const groups: Array<{ start: number; count: number; materialIndex: number }> =
    [];

  // Track current index for groups
  let currentIndex = 0;

  // Helper to add a triangle with specific UVs
  const addTriangle = (
    v0Idx: number,
    v1Idx: number,
    v2Idx: number,
    uv0: [number, number],
    uv1: [number, number],
    uv2: [number, number],
    materialGroup: number
  ) => {
    const startIdx = finalPositions.length / 3;

    // Add vertices
    finalPositions.push(
      positions[v0Idx * 3],
      positions[v0Idx * 3 + 1],
      positions[v0Idx * 3 + 2],
      positions[v1Idx * 3],
      positions[v1Idx * 3 + 1],
      positions[v1Idx * 3 + 2],
      positions[v2Idx * 3],
      positions[v2Idx * 3 + 1],
      positions[v2Idx * 3 + 2]
    );

    // Add normals
    finalNormals.push(
      normals[v0Idx * 3],
      normals[v0Idx * 3 + 1],
      normals[v0Idx * 3 + 2],
      normals[v1Idx * 3],
      normals[v1Idx * 3 + 1],
      normals[v1Idx * 3 + 2],
      normals[v2Idx * 3],
      normals[v2Idx * 3 + 1],
      normals[v2Idx * 3 + 2]
    );

    // Add UVs
    finalUVs.push(uv0[0], uv0[1], uv1[0], uv1[1], uv2[0], uv2[1]);

    // Add indices
    finalIndices.push(startIdx, startIdx + 1, startIdx + 2);

    // Add to groups - check if we need to start a new group or extend existing one
    const lastGroup = groups[groups.length - 1];
    if (
      lastGroup &&
      lastGroup.materialIndex === materialGroup &&
      lastGroup.start + lastGroup.count === currentIndex
    ) {
      // Extend existing group
      lastGroup.count += 3;
    } else {
      // Start new group
      groups.push({
        start: currentIndex,
        count: 3,
        materialIndex: materialGroup,
      });
    }
    currentIndex += 3;
  };

  // Bottom face (material 0 - top texture)
  addTriangle(0, 2, 1, [0, 0], [1, 1], [1, 0], 0);
  addTriangle(0, 3, 2, [0, 0], [0, 1], [1, 1], 0);

  // Top face (material 0 - top texture)
  addTriangle(4, 5, 6, [0, 0], [1, 0], [1, 1], 0);
  addTriangle(4, 6, 7, [0, 0], [1, 1], [0, 1], 0);

  // Left face (material 1 - side texture)
  // Use normalized UVs (0-1) - texture repeat will handle scaling
  addTriangle(0, 4, 7, [0, 0], [0, 1], [1, 1], 1);
  addTriangle(0, 7, 3, [0, 0], [1, 1], [1, 0], 1);

  // Right face (material 1 - side texture)
  addTriangle(1, 2, 6, [0, 0], [1, 0], [1, 1], 1);
  addTriangle(1, 6, 5, [0, 0], [1, 1], [0, 1], 1);

  // Back face (material 1 - side texture)
  addTriangle(0, 1, 5, [0, 0], [1, 0], [1, 1], 1);
  addTriangle(0, 5, 4, [0, 0], [1, 1], [0, 1], 1);

  // Front face (material 1 - side texture)
  addTriangle(3, 7, 6, [0, 0], [0, 1], [1, 1], 1);
  addTriangle(3, 6, 2, [0, 0], [1, 1], [1, 0], 1);

  // Set attributes
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(finalPositions, 3)
  );
  geometry.setAttribute(
    "normal",
    new THREE.Float32BufferAttribute(finalNormals, 3)
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(finalUVs, 2));
  geometry.setIndex(finalIndices);

  // Apply material groups
  geometry.groups = groups;

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

  // Create material array for geometric blocks
  // Material 0: Top and bottom faces (use top texture)
  // Material 1: Side faces (use side texture)
  const geometricMaterials = useMemo(
    () => [
      // Material for top/bottom faces
      new THREE.MeshStandardMaterial({
        map: showWoodGrain ? uniqueTopTexture : null,
        color,
        roughness: 0.8,
        metalness: 0.05,
        emissive: isHovered && showColorInfo ? color : "#000000",
        emissiveIntensity: isHovered && showColorInfo ? 0.5 : 0,
      }),
      // Material for side faces
      new THREE.MeshStandardMaterial({
        map: showWoodGrain ? uniqueSideTexture : null,
        color,
        roughness: 0.8,
        metalness: 0.05,
        emissive: isHovered && showColorInfo ? color : "#000000",
        emissiveIntensity: isHovered && showColorInfo ? 0.5 : 0,
      }),
    ],
    [
      uniqueTopTexture,
      uniqueSideTexture,
      color,
      isHovered,
      showWoodGrain,
      showColorInfo,
    ]
  );

  // Create a single material for non-geometric blocks (box geometry handles UVs automatically)
  const boxMaterial = useMemo(
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
        material={geometricMaterials}
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
      material={boxMaterial}
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
