"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

export function GeometricLighting() {
  const lightGroupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    // Clean up function to remove lights when component unmounts
    return () => {
      if (lightGroupRef.current) {
        lightGroupRef.current.children.forEach((light) => {
          if (light instanceof THREE.Light) {
            light.dispose();
          }
        });
      }
    };
  }, []);

  return (
    <group ref={lightGroupRef}>
      {/* Ambient light - softer for geometric patterns to enhance shadows */}
      <ambientLight intensity={1} />

      {/* Primary directional light - top right */}
      <directionalLight
        position={[15, 5, 5]}
        castShadow
        intensity={0.7}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      ></directionalLight>

      <directionalLight
        position={[15, -5, 5]}
        castShadow
        intensity={0.7}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      ></directionalLight>

      {/* Secondary light source (bottom-left-back) */}
      <directionalLight
        position={[-5, -5, 10]}
        castShadow
        intensity={0.5}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      ></directionalLight>

      <directionalLight
        position={[-15, -2, 5]}
        castShadow
        intensity={0.3}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      ></directionalLight>

      <directionalLight
        position={[0, 0, -5]}
        castShadow
        intensity={0.5}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      ></directionalLight>
    </group>
  );
}
