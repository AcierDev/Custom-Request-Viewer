"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useProgress } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import { GeometricLighting } from "@/components/GeometricLighting";
import { GeometricPattern } from "@/components/GeometricPattern";
import { useCustomStore } from "@/store/customStore";
import { Loader2 } from "lucide-react";
import { Hand } from "lucide-react";

type DesignCanvasProps = {
  className?: string;
  camera?: {
    position?: [number, number, number];
    fov?: number;
    zoom?: number;
  };
};

function InteractionHint({
  show,
  onDismiss,
}: {
  show: boolean;
  onDismiss: () => void;
}) {
  if (!show) return null;

  return (
    <div
      className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-opacity duration-500"
      style={{ opacity: show ? 1 : 0 }}
    >
      <div className="flex flex-col items-center gap-2 bg-gray-900/60 backdrop-blur-md px-4 py-3 rounded-full border border-white/10 shadow-lg">
        <div className="relative">
          <Hand className="w-6 h-6 text-white animate-pulse" />
          <div className="absolute top-0 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
        </div>
        <span className="text-white text-sm font-medium whitespace-nowrap">
          Drag to Rotate
        </span>
      </div>
    </div>
  );
}



function LoadingOverlayWrapper({
  onFinished,
}: {
  onFinished: () => void;
}) {
  const { progress, active } = useProgress();
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!active && progress === 100) {
      const timer = setTimeout(() => {
        setShow(false);
        onFinished();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShow(true);
    }
  }, [active, progress, onFinished]);

  if (!show) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm transition-opacity duration-500"
      style={{ opacity: show ? 1 : 0 }}
    >
      <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-gray-800/50 border border-gray-700 shadow-xl">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        <div className="flex flex-col items-center gap-2">
          <span className="text-white font-medium text-lg">Loading Design</span>
          <div className="w-48 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-gray-400 text-sm">{progress.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}

export function DesignCanvas({ className, camera }: DesignCanvasProps) {
  const { viewSettings } = useCustomStore();
  const { showWoodGrain, showColorInfo } = viewSettings;
  const [hasInteracted, setHasInteracted] = useState(false);
  const [loadingFinished, setLoadingFinished] = useState(false);

  // Show hint if loading is done and user hasn't interacted yet
  const showHint = loadingFinished && !hasInteracted;

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div 
      className="relative w-full h-full"
      onPointerDown={handleInteraction}
      onWheel={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <LoadingOverlayWrapper onFinished={() => setLoadingFinished(true)} />
      <InteractionHint show={showHint} onDismiss={handleInteraction} />
      <Canvas
        shadows
        className={className || "w-full h-full"}
        camera={{
          position: camera?.position || [0, 0, 20],
          fov: camera?.fov ?? 40,
          zoom: camera?.zoom ?? 1,
        }}
      >
        <Suspense fallback={null}>
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
        </Suspense>
      </Canvas>
    </div>
  );
}

export default DesignCanvas;
