"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCustomStore } from "@/store/customStore";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GeometricPattern } from "@/components/GeometricPattern";
import { GeometricLighting } from "@/components/GeometricLighting";
import { cn } from "@/lib/utils";

export default function PreviewPage() {
  const [mounted, setMounted] = useState(false);
  const { viewSettings } = useCustomStore();
  const { showWoodGrain, showColorInfo } = viewSettings;

  useEffect(() => {
    setMounted(true);

    // Trigger resize event to ensure canvas renders correctly
    const resizeEvent = new Event("resize");
    window.dispatchEvent(resizeEvent);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full h-screen relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="absolute top-4 left-4 z-50">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Coastal Dream 28" x 12"
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          3D Geometric Pattern Viewer
        </p>
      </div>

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

      {/* Info overlay */}
      <div className="absolute bottom-6 left-6 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Coastal Dream Pattern
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            A beautiful geometric pattern featuring warm coastal colors in a 28"
            x 12" format.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
              Geometric Style
            </span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
              28" x 12"
            </span>
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded">
              Coastal Colors
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
