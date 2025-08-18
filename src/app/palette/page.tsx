"use client";

import { useEffect } from "react";
import { useCustomStore } from "@/store/customStore";
import { PaletteStageRouter } from "@/components/palette/PaletteStageRouter";
import { motion } from "framer-motion";

export default function PalettePage() {
  const { paletteCreation, resetPaletteCreation } = useCustomStore();

  // Load saved palettes from localStorage on mount
  useEffect(() => {
    const savedPalettes = JSON.parse(
      localStorage.getItem("savedPalettes") || "[]"
    );
    useCustomStore.setState((state) => ({
      paletteCreation: {
        ...state.paletteCreation,
        savedPalettes,
      },
    }));
  }, []);

  // Reset to choice stage on component mount if not already in a flow
  useEffect(() => {
    if (paletteCreation.currentStage === "choice") {
      resetPaletteCreation();
    }
  }, [paletteCreation.currentStage, resetPaletteCreation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-16" // Account for navbar height only
      >
        <PaletteStageRouter />
      </motion.div>
    </div>
  );
}
