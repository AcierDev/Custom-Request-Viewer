"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCustomStore } from "@/store/customStore";
import { DESIGN_COLORS, DESIGN_IMAGES } from "@/typings/color-maps";
import { ItemDesigns } from "@/typings/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight, Palette, Star, Filter, Check } from "lucide-react";

// Design categories for filtering
const categories = {
  all: "All Designs",
  blues: "Blues & Teals",
  earthy: "Earth Tones",
  greens: "Greens",
  neutrals: "Neutrals",
  colorful: "Vibrant",
};

// Map designs to categories
const designCategories: Record<ItemDesigns, string[]> = {
  [ItemDesigns.Custom]: [],
  [ItemDesigns.Coastal]: ["blues", "neutrals"],
  [ItemDesigns.Tidal]: ["blues", "neutrals"],
  [ItemDesigns.Oceanic_Harmony]: ["blues"],
  [ItemDesigns.Timberline]: ["earthy", "neutrals"],
  [ItemDesigns.Amber]: ["earthy", "neutrals"],
  [ItemDesigns.Sapphire]: ["blues", "greens"],
  [ItemDesigns.Winter]: ["blues"],
  [ItemDesigns.Forest]: ["greens", "earthy"],
  [ItemDesigns.Autumn]: ["earthy", "colorful"],
  [ItemDesigns.Elemental]: ["neutrals", "earthy"],
  [ItemDesigns.Abyss]: ["blues", "neutrals"],
  [ItemDesigns.Spectrum]: ["blues", "colorful"],
  [ItemDesigns.Aloe]: ["greens"],
  [ItemDesigns.Mirage]: ["neutrals", "blues"],
};

const popularDesigns = [ItemDesigns.Coastal, ItemDesigns.Tidal];

export function OfficialDesignStage() {
  const { setPaletteStage, setSelectedOfficialDesign } = useCustomStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDesign, setSelectedDesign] = useState<ItemDesigns | null>(
    null
  );

  // Get all designs except Custom
  const allDesigns = Object.values(ItemDesigns).filter(
    (d) => d !== ItemDesigns.Custom
  );

  // Filter designs based on search and category
  const filteredDesigns = allDesigns.filter((design) => {
    const matchesSearch = design
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      designCategories[design].includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleDesignSelect = (design: ItemDesigns) => {
    setSelectedDesign(design);
  };

  const handleDesignDoubleClick = (design: ItemDesigns) => {
    setSelectedDesign(design);
    // Immediately proceed to next stage
    setSelectedOfficialDesign(design);

    // Load the official design colors into custom palette for editing
    const officialColors = Object.values(DESIGN_COLORS[design]).map(
      (color) => ({
        hex: color.hex,
        name: color.name,
      })
    );

    useCustomStore.setState((state) => ({
      paletteCreation: {
        ...state.paletteCreation,
        customPalette: officialColors,
      },
    }));

    setPaletteStage("custom");
  };

  const handleContinue = () => {
    if (selectedDesign) {
      setSelectedOfficialDesign(selectedDesign);

      // Load the official design colors into custom palette for editing
      const officialColors = Object.values(DESIGN_COLORS[selectedDesign]).map(
        (color) => ({
          hex: color.hex,
          name: color.name,
        })
      );

      useCustomStore.setState((state) => ({
        paletteCreation: {
          ...state.paletteCreation,
          customPalette: officialColors,
        },
      }));

      setPaletteStage("custom");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Choose an Official Design
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Select a professionally curated palette to customize. Each design has
          been carefully crafted for perfect color harmony.
        </p>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8 space-y-4"
      >
        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search designs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2">
          {Object.entries(categories).map(([key, label]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(key)}
              className={`text-xs ${
                selectedCategory === key
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <Filter className="w-3 h-3 mr-1" />
              {label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Popular Designs Section */}
      {selectedCategory === "all" && searchQuery === "" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Popular Choices
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {popularDesigns.map((design, index) => (
              <DesignCard
                key={design}
                design={design}
                isSelected={selectedDesign === design}
                onSelect={handleDesignSelect}
                onDoubleClick={handleDesignDoubleClick}
                delay={0.3 + index * 0.1}
                isPopular
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* All Designs Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          {selectedCategory === "all"
            ? "All Designs"
            : categories[selectedCategory as keyof typeof categories]}
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({filteredDesigns.length} designs)
          </span>
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredDesigns.map((design, index) => (
              <DesignCard
                key={design}
                design={design}
                isSelected={selectedDesign === design}
                onSelect={handleDesignSelect}
                onDoubleClick={handleDesignDoubleClick}
                delay={0.5 + index * 0.05}
                isPopular={popularDesigns.includes(design)}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredDesigns.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No designs found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Continue Button */}
      <AnimatePresence>
        {selectedDesign && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <Button
              onClick={handleContinue}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8"
            >
              <span>Customize {selectedDesign}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DesignCardProps {
  design: ItemDesigns;
  isSelected: boolean;
  onSelect: (design: ItemDesigns) => void;
  onDoubleClick?: (design: ItemDesigns) => void;
  delay?: number;
  isPopular?: boolean;
}

function DesignCard({
  design,
  isSelected,
  onSelect,
  onDoubleClick,
  delay = 0,
  isPopular,
}: DesignCardProps) {
  const colors = Object.values(DESIGN_COLORS[design]);
  const imageUrl = DESIGN_IMAGES[design];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay }}
      layout
    >
      <Card
        className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg group pt-0 pb-0 ${
          isSelected
            ? "ring-2 ring-purple-500 shadow-lg scale-105"
            : "hover:scale-105 border-gray-200 dark:border-gray-700"
        }`}
        onClick={() => onSelect(design)}
        onDoubleClick={() => onDoubleClick?.(design)}
      >
        {isPopular && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-yellow-500 text-white text-xs">
              <Star className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          </div>
        )}

        {isSelected && (
          <div className="absolute top-2 left-2 z-10">
            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        <div className="h-75 relative ">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${imageUrl})`,
              opacity: 1,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Color preview strip */}
          <div className="absolute bottom-0 left-0 right-0 h-6 flex">
            {colors.map((color, index) => (
              <div
                key={index}
                className="flex-1 h-full"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <CardContent className="px-4 pt-0 pb-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {design}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {colors.length} colors
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Double-click to select
          </p>
        </CardContent>

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 bg-gray-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            isSelected ? "opacity-100" : ""
          }`}
        />
      </Card>
    </motion.div>
  );
}
