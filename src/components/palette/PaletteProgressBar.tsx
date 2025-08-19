"use client";

import { useCustomStore } from "@/store/customStore";
import { motion } from "framer-motion";
import { ArrowLeft, Palette, Sparkles, Eye, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const stageConfig = {
  choice: {
    label: "Choose Your Path",
    icon: Palette,
    step: 1,
    description: "Start fresh or modify official designs",
  },
  official: {
    label: "Official Designs",
    icon: Sparkles,
    step: 2,
    description: "Customize our curated palettes",
  },
  custom: {
    label: "Design Palette",
    icon: Palette,
    step: 2,
    description: "Create your unique color combination",
  },
  preview: {
    label: "Preview",
    icon: Eye,
    step: 3,
    description: "See your design come to life",
  },
  save: {
    label: "Save & Use",
    icon: Save,
    step: 4,
    description: "Save your palette and apply it",
  },
};

export function PaletteProgressBar() {
  const { paletteCreation, setPaletteStage } = useCustomStore();
  const router = useRouter();
  const { currentStage } = paletteCreation;

  const currentConfig = stageConfig[currentStage];
  const totalSteps = 4;
  const progress = (currentConfig.step / totalSteps) * 100;

  const handleBackClick = () => {
    switch (currentStage) {
      case "official":
      case "custom":
        setPaletteStage("choice");
        break;
      case "preview":
        setPaletteStage(
          paletteCreation.selectedOfficialDesign ? "official" : "custom"
        );
        break;
      case "save":
        setPaletteStage("preview");
        break;
      default:
        router.push("/");
        break;
    }
  };

  const handleHomeClick = () => {
    router.push("/");
  };

  const Icon = currentConfig.icon;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center h-14">
          {/* Left side - Back button */}
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>

          {/* Center - Title and Progress bar */}
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Icon className="w-3 h-3 text-white" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {currentConfig.label}
              </h1>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-xs">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 relative overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="text-center mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Step {currentConfig.step} of {totalSteps}
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Home button */}
          <div className="flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleHomeClick}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <span className="hidden sm:inline">Home</span>
              <span className="sm:hidden">✕</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
