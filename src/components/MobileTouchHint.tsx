"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, ZoomIn, Move } from "lucide-react";

const STORAGE_KEY = "everwood_touch_hint_dismissed";

interface TouchHintProps {
  /** Force show the hint even if previously dismissed */
  forceShow?: boolean;
  /** Auto-dismiss after a certain time (ms). Set to 0 to disable */
  autoDismissMs?: number;
}

export function MobileTouchHint({
  forceShow = false,
  autoDismissMs = 6000,
}: TouchHintProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    // Check if hint was previously dismissed
    if (!forceShow) {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (dismissed) {
        return;
      }
    }

    // Show the hint after a short delay
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(showTimer);
  }, [forceShow]);

  // Auto-dismiss timer
  useEffect(() => {
    if (!isVisible || autoDismissMs === 0) return;

    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, autoDismissMs);

    return () => clearTimeout(dismissTimer);
  }, [isVisible, autoDismissMs]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Save to localStorage so we don't show again
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (!hasMounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-24 left-4 right-4 z-30 pointer-events-auto"
        >
          <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-gray-700/50">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-700/50 transition-colors"
              aria-label="Dismiss hint"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>

            {/* Title */}
            <h3 className="text-white text-sm font-medium mb-3 pr-6">
              Interact with your design
            </h3>

            {/* Gesture hints */}
            <div className="flex justify-around gap-2">
              {/* Rotate hint */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-xs text-gray-400 text-center">
                  Drag to
                  <br />
                  rotate
                </span>
              </div>

              {/* Zoom hint */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <ZoomIn className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-xs text-gray-400 text-center">
                  Pinch to
                  <br />
                  zoom
                </span>
              </div>

              {/* Pan hint */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Move className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-xs text-gray-400 text-center">
                  Two-finger
                  <br />
                  drag to pan
                </span>
              </div>
            </div>

            {/* Progress bar for auto-dismiss */}
            {autoDismissMs > 0 && (
              <div className="mt-3 h-0.5 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: autoDismissMs / 1000, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MobileTouchHint;






