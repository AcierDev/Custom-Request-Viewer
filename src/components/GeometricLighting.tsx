"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useCustomStore } from "@/store/customStore";

export function GeometricLighting() {
  const lightGroupRef = useRef<THREE.Group>(null);
  const { lighting } = useCustomStore();

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
      <ambientLight intensity={lighting.ambientIntensity} color="#ffffff" />

      {/* Key light - top right */}
      <directionalLight
        position={[15, 5, 5]}
        castShadow
        color="#ffffff"
        intensity={lighting.keyIntensity}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Fill light - bottom right */}
      <directionalLight
        position={[15, -5, 5]}
        castShadow
        color="#ffffff"
        intensity={lighting.fillIntensity}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Back lights */}
      <directionalLight
        position={[-5, -5, 10]}
        castShadow
        color="#ffffff"
        intensity={lighting.backIntensity}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Rim light */}
      <directionalLight
        position={[-15, -2, 5]}
        castShadow
        color="#ffffff"
        intensity={lighting.rimIntensity}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Rear back light */}
      <directionalLight
        position={[0, 0, -5]}
        castShadow
        color="#ffffff"
        intensity={lighting.backIntensity}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </group>
  );
}
