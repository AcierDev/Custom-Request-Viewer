"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Palette, Eye, ArrowLeft } from "lucide-react";
import { useCustomStore } from "@/store/customStore";
import { motion } from "framer-motion";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { paletteCreation, setPaletteStage, viewSettings } = useCustomStore();
  const { showUIControls } = viewSettings;

  const handleLogoClick = () => {
    router.push("/");
  };

  const handlePreviewClick = () => {
    router.push("/");
  };

  const handleDesignerClick = () => {
    router.push("/palette");
  };

  const handleBackClick = () => {
    const { currentStage, selectedOfficialDesign } = paletteCreation;
    switch (currentStage) {
      case "official":
      case "custom":
        setPaletteStage("choice");
        break;
      case "preview":
        setPaletteStage(selectedOfficialDesign ? "official" : "custom");
        break;
      case "save":
        setPaletteStage("preview");
        break;
      default:
        router.push("/");
        break;
    }
  };

  const isOnPalettePage = pathname === "/palette";
  const isOnHomePage = pathname === "/";
  const { currentStage } = paletteCreation;

  // Stage configuration for progress bar
  const stageConfig = {
    choice: { label: "Choose Your Path", step: 1 },
    official: { label: "Official Designs", step: 2 },
    custom: { label: "Design Palette", step: 2 },
    preview: { label: "Preview", step: 3 },
    save: { label: "Save & Use", step: 4 },
  };

  const currentConfig = stageConfig[currentStage] || stageConfig.choice;
  const totalSteps = 4;
  const progress = (currentConfig.step / totalSteps) * 100;

  if (!showUIControls) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-[60] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="w-full px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Left side - Logo or Back button */}
          <div className="flex items-center gap-4">
            {isOnPalettePage ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            ) : (
              <button
                onClick={handleLogoClick}
                className="select-none cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="text-xl sm:text-3xl font-extrabold tracking-wide bg-gradient-to-r from-orange-700 via-gray-400 to-sky-700 bg-clip-text text-transparent drop-shadow-sm">
                  EVERWOOD
                </span>
              </button>
            )}
          </div>

          {/* Center - Progress bar (only on palette page) */}
          {isOnPalettePage && (
            <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-md">
              <div className="w-full">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 relative overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <div className="text-center mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {currentConfig.label} • Step {currentConfig.step} of{" "}
                    {totalSteps}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Right side - Navigation */}
          <nav className="flex items-center gap-1">
            <button
              onClick={handlePreviewClick}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isOnHomePage
                  ? "text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Preview
            </button>

            <button
              onClick={handleDesignerClick}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isOnPalettePage
                  ? "text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Designer
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
