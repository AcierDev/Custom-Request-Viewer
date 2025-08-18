"use client";

import { motion } from "framer-motion";
import { useCustomStore } from "@/store/customStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Palette,
  Sparkles,
  ArrowRight,
  Star,
  Zap,
  Users,
  Lightbulb,
} from "lucide-react";

export function ChoiceStage() {
  const { setPaletteStage } = useCustomStore();

  const options = [
    {
      id: "official",
      title: "Modify Official Designs",
      description:
        "Start with our professionally curated palettes and customize them to your vision",
      icon: Sparkles,
      benefits: [
        "Professional color combinations",
        "Proven design harmony",
        "Easy customization",
      ],
      badge: "Most Popular",
      badgeColor: "bg-green-500",
      gradient: "from-blue-500 to-purple-600",
      hoverGradient: "from-blue-600 to-purple-700",
    },
    {
      id: "custom",
      title: "Create From Scratch",
      description:
        "Design your own unique palette with complete creative freedom",
      icon: Palette,
      benefits: [
        "Complete creative control",
        "Unlimited possibilities",
        "Express your unique style",
      ],
      badge: "Creative",
      badgeColor: "bg-purple-500",
      gradient: "from-purple-500 to-pink-600",
      hoverGradient: "from-purple-600 to-pink-700",
    },
  ];

  const features = [
    {
      icon: Star,
      title: "Professional Tools",
      description:
        "Color harmony generator, image color extraction, and smart blending",
    },
    {
      icon: Zap,
      title: "Instant Preview",
      description: "See your palette applied to your design in real-time",
    },
    {
      icon: Users,
      title: "Share & Collaborate",
      description: "Save, share, and get feedback on your color creations",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 shadow-lg">
          <Palette className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Design Your{" "}
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Perfect Palette
          </span>
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Create stunning color combinations that bring your wooden art pieces
          to life. Choose your path and let&apos;s design something amazing
          together.
        </p>
      </motion.div>

      {/* Main Options */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {options.map((option, index) => {
          const Icon = option.icon;

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <Card
                className="relative overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-transparent transition-all duration-300 group cursor-pointer h-full"
                onClick={() =>
                  setPaletteStage(option.id as "official" | "custom")
                }
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                {option.badge && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge
                      className={`${option.badgeColor} text-white text-xs px-2 py-1`}
                    >
                      {option.badge}
                    </Badge>
                  </div>
                )}

                <CardContent className="p-8 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r ${option.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {option.title}
                    </h3>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed flex-grow">
                    {option.description}
                  </p>

                  <div className="space-y-3 mb-8">
                    {option.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full bg-gradient-to-r ${option.gradient} hover:bg-gradient-to-r hover:${option.hoverGradient} text-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105`}
                    size="lg"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Powerful Tools at Your Fingertips
        </h2>

        <div className="grid sm:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center mt-16 p-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800"
      >
        <Lightbulb className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Not sure where to start?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          We recommend starting with our official designs - they&apos;re
          professionally crafted and easy to customize!
        </p>
        <Button
          onClick={() => setPaletteStage("official")}
          variant="outline"
          className="border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30"
        >
          Explore Official Designs
        </Button>
      </motion.div>
    </div>
  );
}
