"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useCallback, useMemo, useState } from "react";
import { GeometricLighting } from "@/components/GeometricLighting";
import { GeometricPattern } from "@/components/GeometricPattern";
import type { ShareableDesignData } from "@/store/compareStore";

type DesignThumbnailRendererProps = {
  designData: ShareableDesignData;
  width?: number;
  height?: number;
  onReady: (thumbnailDataUrl: string) => void;
};

function CaptureOnce({ onReady }: { onReady: (dataUrl: string) => void }) {
  const { gl, scene, camera } = useThree();
  const [captured, setCaptured] = useState(false);

  useFrame(() => {
    if (captured) return;

    // Render at least a couple frames so materials settle.
    // We do an explicit render to ensure the buffer is fresh.
    gl.render(scene, camera);

    // Capture immediately after render.
    const dataUrl = gl.domElement.toDataURL("image/png");
    setCaptured(true);
    onReady(dataUrl);
  });

  return null;
}

export function DesignThumbnailRenderer({
  designData,
  width = 320,
  height = 240,
  onReady,
}: DesignThumbnailRendererProps) {
  const [done, setDone] = useState(false);

  const handleReady = useCallback(
    (dataUrl: string) => {
      if (done) return;
      setDone(true);
      onReady(dataUrl);
    },
    [done, onReady]
  );

  const camera = useMemo(
    () => ({
      position: [20, 20, 20] as [number, number, number],
      fov: 40,
      zoom: 1.3,
    }),
    []
  );

  return (
    <div style={{ width, height }} className="pointer-events-none opacity-0">
      <Canvas
        shadows={false}
        dpr={1}
        gl={{ preserveDrawingBuffer: true }}
        camera={camera}
      >
        <Suspense fallback={null}>
          <GeometricLighting />
          <GeometricPattern
            showWoodGrain={false}
            showColorInfo={false}
            customDesign={designData}
          />
          {!done && <CaptureOnce onReady={handleReady} />}
        </Suspense>
      </Canvas>
    </div>
  );
}



