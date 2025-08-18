"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCustomStore } from "@/store/customStore";
import { HexColorPicker } from "react-colorful";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Palette,
  ArrowRight,
  Sparkles,
  Upload,
  Wand2,
  Edit,
  Eye,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export function CustomPaletteStage() {
  const {
    paletteCreation,
    addCustomColor,
    removeCustomColor,
    updateCustomColor,
    setPaletteStage,
  } = useCustomStore();

  const [activeTab, setActiveTab] = useState("blend");
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(
    null
  );
  const [colorPickerValue, setColorPickerValue] = useState("#6366f1");
  const [colorName, setColorName] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [blendColor1, setBlendColor1] = useState("");
  const [blendColor2, setBlendColor2] = useState("");
  const [blendRatio, setBlendRatio] = useState(50);
  const [blendedColor, setBlendedColor] = useState("");
  const [blendMode, setBlendMode] = useState<"simple" | "advanced">("simple");
  const [blendSteps, setBlendSteps] = useState(5);
  const [blendedColors, setBlendedColors] = useState<string[]>([]);

  const { customPalette, selectedOfficialDesign } = paletteCreation;

  // Update color picker when selecting a color
  useEffect(() => {
    if (selectedColorIndex !== null && customPalette[selectedColorIndex]) {
      setColorPickerValue(customPalette[selectedColorIndex].hex);
      setColorName(customPalette[selectedColorIndex].name || "");
    }
  }, [selectedColorIndex, customPalette]);

  // Auto-update blended color when inputs change
  useEffect(() => {
    if (blendColor1 && blendColor2) {
      const result = blendColors(blendColor1, blendColor2, blendRatio);
      setBlendedColor(result);
    }
  }, [blendColor1, blendColor2, blendRatio]);

  const handleAddColor = () => {
    addCustomColor(colorPickerValue, colorName || "");
    setColorName("");
    setShowColorPicker(false);
    toast.success("Color added to palette!");
  };

  const handleEditColor = (index: number) => {
    setSelectedColorIndex(index);
    setShowColorPicker(true);
  };

  const handleUpdateColor = () => {
    if (selectedColorIndex !== null) {
      updateCustomColor(selectedColorIndex, colorPickerValue, colorName || "");
      setSelectedColorIndex(null);
      setShowColorPicker(false);
      toast.success("Color updated!");
    }
  };

  const handleRemoveColor = (index: number) => {
    removeCustomColor(index);
    if (selectedColorIndex === index) {
      setSelectedColorIndex(null);
      setShowColorPicker(false);
    }
    toast.success("Color removed from palette");
  };

  const handleRandomColor = () => {
    const randomColor = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;
    setColorPickerValue(randomColor);
  };

  const blendColors = (color1: string, color2: string, ratio: number) => {
    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    };

    // Convert RGB to hex
    const rgbToHex = (r: number, g: number, b: number) => {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) return color1;

    const ratio1 = ratio / 100;
    const ratio2 = 1 - ratio1;

    const blendedR = Math.round(rgb1.r * ratio1 + rgb2.r * ratio2);
    const blendedG = Math.round(rgb1.g * ratio1 + rgb2.g * ratio2);
    const blendedB = Math.round(rgb1.b * ratio1 + rgb2.b * ratio2);

    return rgbToHex(blendedR, blendedG, blendedB);
  };

  const handleBlendColors = () => {
    if (!blendColor1 || !blendColor2) {
      toast.error("Please select two colors to blend");
      return;
    }
    const result = blendColors(blendColor1, blendColor2, blendRatio);
    setBlendedColor(result);
  };

  const handleAddBlendedColor = () => {
    if (!blendedColor) {
      toast.error("Please blend colors first");
      return;
    }
    addCustomColor(blendedColor, `Blended ${blendRatio}%`);
    toast.success("Blended color added to palette!");
  };

  const generateBlendSteps = () => {
    if (!blendColor1 || !blendColor2) {
      toast.error("Please select two colors to blend");
      return;
    }

    const colors: string[] = [];
    for (let i = 0; i <= blendSteps; i++) {
      const ratio = (i / blendSteps) * 100;
      const color = blendColors(blendColor1, blendColor2, ratio);
      colors.push(color);
    }
    setBlendedColors(colors);
  };

  const handleAddAllBlendedColors = () => {
    if (blendedColors.length === 0) {
      toast.error("Please generate blend steps first");
      return;
    }

    blendedColors.forEach((color, index) => {
      const ratio = Math.round((index / (blendedColors.length - 1)) * 100);
      addCustomColor(color, `Blend ${ratio}%`);
    });

    toast.success(`Added ${blendedColors.length} blended colors to palette!`);
  };

  const handleContinue = () => {
    if (customPalette.length === 0) {
      toast.error("Please add at least one color to your palette");
      return;
    }
    setPaletteStage("preview");
  };

  const getContrastColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#FFFFFF";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {selectedOfficialDesign
            ? `Customize ${selectedOfficialDesign}`
            : "Create Your Palette"}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {selectedOfficialDesign
            ? "Modify the official palette to match your vision. Add, remove, or adjust colors as needed."
            : "Build your unique color palette from scratch. Use our tools to create perfect color combinations."}
        </p>
        {selectedOfficialDesign && (
          <Badge variant="secondary" className="mt-2">
            Based on {selectedOfficialDesign}
          </Badge>
        )}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Palette Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Palette */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  Your Palette ({customPalette.length} colors)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customPalette.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Start Building Your Palette
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Add colors using the tools on the right, or click below to
                      add your first color
                    </p>
                    <Button
                      onClick={() => setShowColorPicker(true)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Color
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Color Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      <AnimatePresence>
                        {customPalette.map((color, index) => (
                          <motion.div
                            key={`${color.hex}-${index}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                            className="group relative"
                          >
                            <div
                              className="aspect-square rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105 border-2 border-gray-200 dark:border-gray-700"
                              style={{ backgroundColor: color.hex }}
                              onClick={() => handleEditColor(index)}
                            >
                              {/* Color info overlay */}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <Edit className="w-4 h-4 text-white mx-auto mb-1" />
                                  <span className="text-xs text-white">
                                    Edit
                                  </span>
                                </div>
                              </div>

                              {/* Remove button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveColor(index);
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                              >
                                <Trash2 className="w-3 h-3 text-white" />
                              </button>
                            </div>

                            {/* Color name and hex */}
                            <div className="mt-2 text-center">
                              <div className="text-xs font-mono text-gray-600 dark:text-gray-400">
                                {color.hex}
                              </div>
                              {color.name && (
                                <div className="text-xs text-gray-800 dark:text-gray-200 font-medium">
                                  {color.name}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* Add Color Button */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: customPalette.length * 0.1,
                        }}
                      >
                        <button
                          onClick={() => setShowColorPicker(true)}
                          className="h-30 w-30 aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 flex items-center justify-center transition-colors group"
                        >
                          <div className="text-center">
                            <Plus className="w-7 h-6 text-gray-400 group-hover:text-purple-500 mx-auto mb-1" />
                            <span className="text-xs text-gray-500 group-hover:text-purple-600">
                              Add Color
                            </span>
                          </div>
                        </button>
                      </motion.div>
                    </div>

                    {/* Palette Preview Strip */}
                    <div className="mt-6">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Palette Preview
                      </Label>
                      <div className="h-16 rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 flex">
                        {customPalette.map((color, index) => (
                          <div
                            key={`${color.hex}-preview-${index}`}
                            className="flex-1 h-full relative group cursor-pointer"
                            style={{ backgroundColor: color.hex }}
                            onClick={() => handleEditColor(index)}
                          >
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                              <Edit
                                className="w-4 h-4"
                                style={{ color: getContrastColor(color.hex) }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex justify-end">
              <Button
                onClick={handleContinue}
                disabled={customPalette.length === 0}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Palette
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Tools Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="blend" className="text-xs">
                <Wand2 className="w-4 h-4 mr-1" />
                Blend
              </TabsTrigger>

              <TabsTrigger value="extract" className="text-xs">
                <Upload className="w-4 h-4 mr-1" />
                Extract
              </TabsTrigger>
            </TabsList>

            <TabsContent value="blend" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Blend Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Mix two colors together to create new shades
                  </p>

                  {/* Mode Toggle */}
                  <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <button
                      onClick={() => setBlendMode("simple")}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        blendMode === "simple"
                          ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}
                    >
                      Simple
                    </button>
                    <button
                      onClick={() => setBlendMode("advanced")}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        blendMode === "advanced"
                          ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}
                    >
                      Advanced
                    </button>
                  </div>

                  {/* Color Selection */}
                  <div className="space-y-3">
                    <Label>First Color</Label>
                    <div className="flex gap-2">
                      <Input
                        value={blendColor1}
                        onChange={(e) => setBlendColor1(e.target.value)}
                        placeholder="#hexcode"
                        className="font-mono"
                      />
                      <div
                        className="w-10 h-10 rounded border-2 border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: blendColor1 || "#f3f4f6" }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Second Color</Label>
                    <div className="flex gap-2">
                      <Input
                        value={blendColor2}
                        onChange={(e) => setBlendColor2(e.target.value)}
                        placeholder="#hexcode"
                        className="font-mono"
                      />
                      <div
                        className="w-10 h-10 rounded border-2 border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: blendColor2 || "#f3f4f6" }}
                      />
                    </div>
                  </div>

                  {blendMode === "simple" ? (
                    <>
                      {/* Simple Mode - Multiple Steps */}
                      <div className="space-y-3">
                        <Label>Number of Steps: {blendSteps}</Label>
                        <input
                          type="range"
                          min="2"
                          max="10"
                          value={blendSteps}
                          onChange={(e) =>
                            setBlendSteps(Number(e.target.value))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>2 colors</span>
                          <span>10 colors</span>
                        </div>
                      </div>

                      {/* Generate Steps Button */}
                      <Button
                        onClick={generateBlendSteps}
                        disabled={!blendColor1 || !blendColor2}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50"
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate {blendSteps + 1} Colors
                      </Button>

                      {/* Results Grid */}
                      {blendedColors.length > 0 && (
                        <div className="space-y-3">
                          <Label>
                            Generated Colors ({blendedColors.length})
                          </Label>
                          <div className="grid grid-cols-3 gap-2">
                            {blendedColors.map((color, index) => (
                              <div key={index} className="text-center">
                                <div
                                  className="w-full aspect-square rounded-lg border-2 border-gray-300 dark:border-gray-600 mb-1"
                                  style={{ backgroundColor: color }}
                                />
                                <div className="text-xs font-mono text-gray-600 dark:text-gray-400">
                                  {color}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {Math.round(
                                    (index / (blendedColors.length - 1)) * 100
                                  )}
                                  %
                                </div>
                              </div>
                            ))}
                          </div>
                          <Button
                            onClick={handleAddAllBlendedColors}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add All {blendedColors.length} Colors
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Advanced Mode - Single Blend Ratio */}
                      <div className="space-y-3">
                        <Label>Blend Ratio: {blendRatio}%</Label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={blendRatio}
                          onChange={(e) =>
                            setBlendRatio(Number(e.target.value))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>More Color 1</span>
                          <span>More Color 2</span>
                        </div>
                      </div>

                      {/* Blend Button */}
                      <Button
                        onClick={handleBlendColors}
                        disabled={!blendColor1 || !blendColor2}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50"
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        Blend Colors
                      </Button>

                      {/* Result */}
                      {blendedColor && (
                        <div className="space-y-3">
                          <Label>Blended Result</Label>
                          <div className="flex gap-2 items-center">
                            <div
                              className="w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                              style={{ backgroundColor: blendedColor }}
                            />
                            <div className="flex-1">
                              <div className="text-sm font-mono text-gray-600 dark:text-gray-400">
                                {blendedColor}
                              </div>
                              <div className="text-xs text-gray-500">
                                {blendRatio}% blend
                              </div>
                            </div>
                            <Button
                              onClick={handleAddBlendedColor}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Quick Color Picker from Palette */}
                  {customPalette.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm">Quick Pick from Palette</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {customPalette.map((color, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              if (!blendColor1) {
                                setBlendColor1(color.hex);
                              } else if (!blendColor2) {
                                setBlendColor2(color.hex);
                              }
                            }}
                            className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:border-purple-500 transition-colors"
                            style={{ backgroundColor: color.hex }}
                            title={color.name || color.hex}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="extract" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Extract from Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Upload an image to extract its color palette
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      toast.info("Image color extraction coming soon!")
                    }
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Color Picker Modal */}
      <AnimatePresence>
        {showColorPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowColorPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">
                {selectedColorIndex !== null ? "Edit Color" : "Add New Color"}
              </h3>

              <div className="space-y-4">
                <HexColorPicker
                  color={colorPickerValue}
                  onChange={setColorPickerValue}
                  style={{ width: "100%" }}
                />

                <Input
                  value={colorPickerValue}
                  onChange={(e) => setColorPickerValue(e.target.value)}
                  placeholder="#hexcode"
                  className="font-mono"
                />

                <Input
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  placeholder="Color name (optional)"
                />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowColorPicker(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={
                      selectedColorIndex !== null
                        ? handleUpdateColor
                        : handleAddColor
                    }
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    {selectedColorIndex !== null ? "Update" : "Add"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
