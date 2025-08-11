"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GeometricLighting } from "@/components/GeometricLighting";
import { GeometricPattern } from "@/components/GeometricPattern";
import { useCustomStore } from "@/store/customStore";

type DesignCanvasProps = {
  className?: string;
  camera?: {
    position?: [number, number, number];
    fov?: number;
    zoom?: number;
  };
};

export function DesignCanvas({ className, camera }: DesignCanvasProps) {
  const { viewSettings } = useCustomStore();
  const { showWoodGrain, showColorInfo } = viewSettings;

  return (
    <Canvas
      shadows
      className={className || "w-full h-full"}
      camera={{
        position: camera?.position || [20, 20, 20],
        fov: camera?.fov ?? 40,
        zoom: camera?.zoom ?? 1.4,
      }}
    >
      <GeometricLighting />
      <GeometricPattern
        showWoodGrain={showWoodGrain}
        showColorInfo={showColorInfo}
      />
      <OrbitControls
        enablePan={true}
        minDistance={4}
        maxDistance={50}
        target={[0, 0, 0]}
        makeDefault
      />
    </Canvas>
  );
}

export default DesignCanvas;
