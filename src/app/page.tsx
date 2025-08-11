"use client";

import { useEffect, useState } from "react";
import { useCustomStore } from "@/store/customStore";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GeometricPattern } from "@/components/GeometricPattern";
import { GeometricLighting } from "@/components/GeometricLighting";
import ControlPanel from "@/components/ControlPanel";
import Navbar from "@/components/Navbar";

export default function PreviewPage() {
  const [mounted, setMounted] = useState(false);
  const { viewSettings, backgroundColor, setShowUIControls } = useCustomStore();
  const { showWoodGrain, showColorInfo, showUIControls } = viewSettings;

  useEffect(() => {
    setMounted(true);

    // Trigger resize event to ensure canvas renders correctly
    const resizeEvent = new Event("resize");
    window.dispatchEvent(resizeEvent);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="w-full h-screen relative"
      style={{ background: backgroundColor }}
    >
      <Navbar />
      {/* Main canvas */}
      <div className="w-full h-full">
        <Canvas
          shadows
          className="w-full h-full"
          camera={{
            position: [20, 20, 20],
            fov: 40,
            zoom: 1.4,
          }}
        >
          {/* Lighting */}
          <GeometricLighting />

          {/* Geometric Pattern */}
          <GeometricPattern
            showWoodGrain={showWoodGrain}
            showColorInfo={showColorInfo}
          />

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            minDistance={4}
            maxDistance={50}
            target={[0, 0, 0]}
            makeDefault
          />
        </Canvas>
      </div>
      {showUIControls ? (
        <ControlPanel />
      ) : (
        <button
          aria-label="Show settings"
          onClick={() => setShowUIControls(true)}
          className="absolute top-4 right-4 z-50 px-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow hover:bg-white dark:hover:bg-gray-800"
        >
          Settings
        </button>
      )}
    </div>
  );
}
