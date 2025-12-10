"use client";

import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useCustomStore } from "@/store/customStore";

// Adjust this value to lighten the texture (0.0 to 1.0)
// Higher values = lighter/brighter appearance
// 0.2 provides a subtle lift to the dark grain
const TEXTURE_BRIGHTNESS_BOOST = 0;

const SIDE_TEXTURE_PATH = "/textures/wood-side-grain.jpg";

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
  grainTexturePaths?: string[]; // New prop for dynamic textures
  grainOpacity?: number; // Opacity of the grain texture (0-1)
  textureVariation?: {
    scale: number;
    offsetX: number;
    offsetY: number;
    rotation: number;
    textureIndex: number;
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
    scale: 0.2, // kept for compatibility but simplified in logic
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    textureIndex: 0,
  },
  grainTexturePaths = [], // Default to empty array
  grainOpacity = .3, 
}: BlockProps) {
  const [x, y, z] = position;
  const adjustedPosition: [number, number, number] = [x, y, z + height / 2];
  const meshRef = useRef<THREE.Mesh>(null);

  // Common onBeforeCompile for both materials
  const onBeforeCompile = useMemo(() => {
    return (shader: any) => {
      shader.uniforms.uGrainOpacity = { value: grainOpacity };
      
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `
        #ifdef USE_MAP
          vec4 sampledDiffuseColor = texture2D( map, vMapUv );
          #ifdef DECODE_VIDEO_TEXTURE
            // inline decode video texture if needed, but usually not for simple maps
            // defaulting to standard map behavior
          #endif
          
          // Mix with white based on opacity (assuming multiplicative texture)
          // refinedDiffuseColor = mix(white, textureColor, opacity)
          vec4 mixedColor = mix(vec4(1.0), sampledDiffuseColor, uGrainOpacity);
          
          diffuseColor *= mixedColor;
        #endif
        `
      );
      
      shader.fragmentShader = `uniform float uGrainOpacity;\n` + shader.fragmentShader;
      
      // Save reference to update uniform later
      (shader as any).userData = { shader };
    };
  }, []); // Compile function doesn't need to change, we update uniform values directly

  // Load textures
  // We load all possible grain textures + the side texture
  const allTexturePaths = useMemo(
    () => (showWoodGrain && grainTexturePaths.length > 0 ? [...grainTexturePaths, SIDE_TEXTURE_PATH] : []),
    [showWoodGrain, grainTexturePaths]
  );
  
  const textures = useTexture(allTexturePaths);
  
  // Use the texture index from variation, or default to 0
  const textureIndex = textureVariation.textureIndex !== undefined 
    ? textureVariation.textureIndex % Math.max(1, grainTexturePaths.length)
    : 0;

  // Ensure we don't try to access out of bounds or undefined textures
  const topTexture = (showWoodGrain && textures.length > 0 && textureIndex < textures.length - 1) 
    ? textures[textureIndex] 
    : null;
    
  // Side texture is always the last one in the list
  const sideTexture = (showWoodGrain && textures.length > 0) 
    ? textures[textures.length - 1] 
    : null;

  // Create unique textures with useMemo
  const { uniqueTopTexture, uniqueSideTexture } = useMemo(() => {
    if (!showWoodGrain)
      return { uniqueTopTexture: null, uniqueSideTexture: null };

    const top = topTexture?.clone();
    const side = sideTexture?.clone();

    if (top) {
      // Process top texture - full face mapping
      // We don't need complex repeating logic for the full face textures
      // But we can still apply the rotation from textureVariation if desired
      top.center.set(0.5, 0.5);
      top.rotation = 0; // Disabled rotation as per user request
            
      // Fix color space if needed (usually handled by THREE but can ensure sRGB)
      top.colorSpace = THREE.SRGBColorSpace;
    }

    if (side) {
      // Process side texture
      side.wrapS = side.wrapT = THREE.RepeatWrapping;
      const sideScale = 0.2;
      side.repeat.set(sideScale, sideScale);
      
      // Fix color space
      side.colorSpace = THREE.SRGBColorSpace;
    }

    return { uniqueTopTexture: top, uniqueSideTexture: side };
  }, [showWoodGrain, topTexture, sideTexture, textureVariation.rotation]);

  // Create materials with useMemo
  const geometricMaterials = useMemo(
    () => {
      const topMat = new THREE.MeshStandardMaterial({
        map: showWoodGrain ? uniqueTopTexture : null,
        color,
        roughness: 0.8,
        metalness: 0.05,
        emissive: isHovered && showColorInfo ? color : color, // Always use base color for tinting
        emissiveIntensity:
          (isHovered && showColorInfo ? 0.5 : 0) + TEXTURE_BRIGHTNESS_BOOST,
      });
      topMat.onBeforeCompile = onBeforeCompile;

      const sideMat = new THREE.MeshStandardMaterial({
        map: showWoodGrain ? uniqueSideTexture : null,
        color,
        roughness: 0.8,
        metalness: 0.05,
        emissive: isHovered && showColorInfo ? color : color,
        emissiveIntensity:
          (isHovered && showColorInfo ? 0.5 : 0) + TEXTURE_BRIGHTNESS_BOOST,
      });
      sideMat.onBeforeCompile = onBeforeCompile;

      return [topMat, sideMat];
    },
    [
      uniqueTopTexture,
      uniqueSideTexture,
      color,
      isHovered,
      showWoodGrain,
      showColorInfo,
      onBeforeCompile,
    ]
  );

  // Create a single material for non-geometric blocks
  const boxMaterial = useMemo(
    () => {
      const mat = new THREE.MeshStandardMaterial({
        map: showWoodGrain ? uniqueTopTexture : null,
        color,
        roughness: 0.8,
        metalness: 0.05,
        emissive: isHovered && showColorInfo ? color : color,
        emissiveIntensity:
          (isHovered && showColorInfo ? 0.5 : 0) + TEXTURE_BRIGHTNESS_BOOST,
      });
      mat.onBeforeCompile = onBeforeCompile;
      return mat;
    },
    [uniqueTopTexture, color, isHovered, showWoodGrain, showColorInfo, onBeforeCompile]
  );

  // Update material properties for existing material
  useEffect(() => {
    if (meshRef.current) {
      const material = meshRef.current.material;

      if (Array.isArray(material)) {
        material.forEach((m) => {
          if (m instanceof THREE.MeshStandardMaterial) {
            m.emissive.set(isHovered && showColorInfo ? color : color);
            m.emissiveIntensity =
              (isHovered && showColorInfo ? 0.5 : 0) + TEXTURE_BRIGHTNESS_BOOST;
            m.needsUpdate = true;
          }
        });
      } else if (material instanceof THREE.MeshStandardMaterial) {
        material.emissive.set(isHovered && showColorInfo ? color : color);
        material.emissiveIntensity =
          (isHovered && showColorInfo ? 0.5 : 0) + TEXTURE_BRIGHTNESS_BOOST;
        material.needsUpdate = true;
      }
    }
  }, [isHovered, color, showColorInfo]);

  // Update grain opacity uniform
  useEffect(() => {
    if (meshRef.current) {
      const material = meshRef.current.material;
      const updateShader = (m: THREE.Material) => {
        if (m instanceof THREE.MeshStandardMaterial && m.userData.shader) {
          m.userData.shader.uniforms.uGrainOpacity.value = grainOpacity;
        }
      };

      if (Array.isArray(material)) {
        material.forEach(updateShader);
      } else {
        updateShader(material);
      }
    }
  }, [grainOpacity]);

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
