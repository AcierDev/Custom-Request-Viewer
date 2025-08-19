"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCustomStore } from "@/store/customStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  Save,
  Palette,
  Download,
  Share2,
  Heart,
  Check,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

export function PreviewStage() {
  const router = useRouter();
  const { paletteCreation, setPaletteStage, setCustomPalette } =
    useCustomStore();
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const { customPalette, selectedOfficialDesign } = paletteCreation;

  const handleApplyAndPreview = () => {
    // Apply the custom palette to the main design
    setCustomPalette(
      customPalette.map((color) => ({ hex: color.hex, name: color.name }))
    );

    // Navigate to the main preview with the applied palette
    router.push("/?preview=palette");

    toast.success("Palette applied! You can now see your design.");
  };

  const handleSaveAndContinue = () => {
    setPaletteStage("save");
  };

  const handleBackToEdit = () => {
    setPaletteStage("custom");
  };

  const copyColorToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
    toast.success(`Copied ${hex} to clipboard`);
  };

  const handleExportPalette = () => {
    const paletteData = {
      name: selectedOfficialDesign
        ? `Custom ${selectedOfficialDesign}`
        : "Custom Palette",
      colors: customPalette,
      createdAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(paletteData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${paletteData.name
      .replace(/\s+/g, "-")
      .toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Palette exported successfully!");
  };

  const getContrastColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#FFFFFF";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 shadow-lg">
          <Eye className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Your Palette is Ready!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Here&apos;s your beautiful color combination. You can preview it on
          your design, save it for later, or make final adjustments.
        </p>

        {selectedOfficialDesign && (
          <Badge variant="secondary" className="mt-4">
            Based on {selectedOfficialDesign}
          </Badge>
        )}
      </motion.div>

      {/* Palette Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <Card className="overflow-hidden shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-600" />
              Your Palette ({customPalette.length} colors)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Large Palette Strip */}
            <div className="h-32 flex">
              {customPalette.map((color, index) => (
                <motion.div
                  key={`${color.hex}-${index}`}
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex-1 relative group cursor-pointer"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => copyColorToClipboard(color.hex)}
                >
                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <div className="text-center">
                      {copiedColor === color.hex ? (
                        <Check
                          className="w-6 h-6 mx-auto mb-1"
                          style={{ color: getContrastColor(color.hex) }}
                        />
                      ) : (
                        <Copy
                          className="w-6 h-6 mx-auto mb-1"
                          style={{ color: getContrastColor(color.hex) }}
                        />
                      )}
                      <span
                        className="text-sm font-medium"
                        style={{ color: getContrastColor(color.hex) }}
                      >
                        {copiedColor === color.hex ? "Copied!" : "Copy"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Color Details */}
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customPalette.map((color, index) => (
                  <motion.div
                    key={`${color.hex}-detail-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => copyColorToClipboard(color.hex)}
                  >
                    <div
                      className="w-10 h-10 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
                        {color.hex}
                      </div>
                      {color.name && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {color.name}
                        </div>
                      )}
                    </div>
                    {copiedColor === color.hex ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="space-y-6"
      >
        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleApplyAndPreview}
            size="lg"
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Eye className="w-5 h-5 mr-2" />
            Apply & Preview on Design
          </Button>

          <Button
            onClick={handleSaveAndContinue}
            size="lg"
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Palette
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            variant="outline"
            onClick={handleBackToEdit}
            className="border-gray-300 dark:border-gray-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Edit
          </Button>

          <Button
            variant="outline"
            onClick={handleExportPalette}
            className="border-gray-300 dark:border-gray-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button
            variant="outline"
            onClick={() => toast.info("Sharing coming soon!")}
            className="border-gray-300 dark:border-gray-600"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
        >
          <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Love Your Palette?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Click on any color above to copy its hex code. You can use these
            colors in other design tools or share them with your team.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
