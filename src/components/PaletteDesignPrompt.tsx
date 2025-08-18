"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Sparkles, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PaletteDesignPrompt() {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleCreatePalette = () => {
    router.push("/palette");
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Store dismissal in localStorage to remember user preference
    localStorage.setItem("palettePromptDismissed", "true");
  };

  // Check if user has dismissed this before
  useState(() => {
    const dismissed = localStorage.getItem("palettePromptDismissed");
    if (dismissed === "true") {
      setIsVisible(false);
    }
  });

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{
          duration: 0.4,
          delay: 2, // Show after 2 seconds to let user see the design first
          ease: "easeOut",
        }}
        className="fixed bottom-6 left-6 z-40 max-w-sm"
      >
        <Card
          className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 shadow-lg backdrop-blur-sm"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <motion.div
                  animate={{
                    rotate: isHovered ? 12 : 0,
                    scale: isHovered ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-md"
                >
                  <Palette className="w-5 h-5 text-white" />
                </motion.div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Love this design?
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                  Create your own custom palette by modifying official designs
                  or starting from scratch
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleCreatePalette}
                    size="sm"
                    className="h-8 px-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    <motion.div
                      animate={{ x: isHovered ? 2 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Design Your Own</span>
                      <ArrowRight className="w-3 h-3" />
                    </motion.div>
                  </Button>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="h-6 w-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 flex-shrink-0"
              >
                <X className="h-3 w-3 text-gray-500" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
