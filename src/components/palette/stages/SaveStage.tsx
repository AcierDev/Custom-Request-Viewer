"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCustomStore } from "@/store/customStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Save,
  ArrowRight,
  ArrowLeft,
  Eye,
  Share2,
  Lock,
  Globe,
  Palette,
  Check,
  Sparkles,
  Home,
} from "lucide-react";
import { toast } from "sonner";

export function SaveStage() {
  const router = useRouter();
  const {
    paletteCreation,
    savePalette,
    setPaletteStage,
    setPaletteName,
    resetPaletteCreation,
    setCustomPalette,
  } = useCustomStore();

  const [isPublic, setIsPublic] = useState(false);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { customPalette, paletteName, selectedOfficialDesign } =
    paletteCreation;

  const handleSave = async () => {
    if (!paletteName.trim()) {
      toast.error("Please enter a name for your palette");
      return;
    }

    if (customPalette.length === 0) {
      toast.error("Cannot save an empty palette");
      return;
    }

    setIsSaving(true);

    try {
      // Create the palette object
      const paletteToSave = {
        id: Date.now().toString(),
        name: paletteName.trim(),
        colors: customPalette,
        createdAt: new Date().toISOString(),
        isPublic,
        description: description.trim(),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        basedOn: selectedOfficialDesign,
      };

      // Save to localStorage (in a real app, this would be an API call)
      const existingPalettes = JSON.parse(
        localStorage.getItem("savedPalettes") || "[]"
      );
      const updatedPalettes = [...existingPalettes, paletteToSave];
      localStorage.setItem("savedPalettes", JSON.stringify(updatedPalettes));

      // Update the store
      useCustomStore.setState((state) => ({
        paletteCreation: {
          ...state.paletteCreation,
          savedPalettes: updatedPalettes,
        },
      }));

      setSaved(true);
      toast.success("Palette saved successfully!");
    } catch (error) {
      toast.error("Failed to save palette. Please try again.");
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyAndGoHome = () => {
    // Apply the palette to the main design
    setCustomPalette(
      customPalette.map((color) => ({ hex: color.hex, name: color.name }))
    );

    // Reset the palette creation state
    resetPaletteCreation();

    // Navigate home
    router.push("/");

    toast.success("Palette applied to your design!");
  };

  const handleCreateAnother = () => {
    resetPaletteCreation();
    toast.success("Ready to create another palette!");
  };

  const handleBackToPreview = () => {
    setPaletteStage("preview");
  };

  if (saved) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6 shadow-lg">
            <Check className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Palette Saved Successfully!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Your palette &quot;{paletteName}&quot; has been saved and is ready
            to use.
          </p>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleApplyAndGoHome}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Home className="w-5 h-5 mr-2" />
                Apply & Go to Design
              </Button>

              <Button
                onClick={handleCreateAnother}
                variant="outline"
                size="lg"
                className="border-gray-300 dark:border-gray-600"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create Another Palette
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isPublic
                  ? "Your palette is public and can be shared"
                  : "Your palette is private"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 shadow-lg">
          <Save className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Save Your Palette
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Give your palette a name and choose how you&apos;d like to save it for
          future use.
        </p>
      </motion.div>

      {/* Palette Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-600" />
              Your Palette Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-16 rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 flex mb-4">
              {customPalette.map((color, index) => (
                <div
                  key={`${color.hex}-${index}`}
                  className="flex-1 h-full"
                  style={{ backgroundColor: color.hex }}
                  title={`${color.name || color.hex}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{customPalette.length} colors</span>
              {selectedOfficialDesign && (
                <>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs">
                    Based on {selectedOfficialDesign}
                  </Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Palette Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Palette Name */}
            <div className="space-y-2">
              <Label htmlFor="palette-name" className="text-sm font-medium">
                Palette Name *
              </Label>
              <Input
                id="palette-name"
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                placeholder={
                  selectedOfficialDesign
                    ? `Custom ${selectedOfficialDesign}`
                    : "My Beautiful Palette"
                }
                className="w-full"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your palette inspiration, use case, or mood..."
                className="w-full min-h-[80px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {description.length}/500 characters
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-sm font-medium">
                Tags (Optional)
              </Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="modern, warm, nature, corporate (separate with commas)"
                className="w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add tags to help organize and find your palette later
              </p>
            </div>

            {/* Privacy Setting */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <Globe className="w-5 h-5 text-blue-500" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-500" />
                )}
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {isPublic ? "Public Palette" : "Private Palette"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {isPublic
                      ? "Others can discover and use this palette"
                      : "Only you can see and use this palette"}
                  </div>
                </div>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
                aria-label="Make palette public"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-8 flex flex-col sm:flex-row gap-4"
      >
        <Button
          variant="outline"
          onClick={handleBackToPreview}
          className="flex-1 border-gray-300 dark:border-gray-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Preview
        </Button>

        <Button
          onClick={handleSave}
          disabled={!paletteName.trim() || isSaving}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Palette
            </>
          )}
        </Button>
      </motion.div>

      {/* Help Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400"
      >
        Your palette will be saved locally and available in your saved palettes
        collection.
      </motion.div>
    </div>
  );
}
