"use client";

import { useCustomStore } from "@/store/customStore";
import { ChoiceStage } from "./stages/ChoiceStage";
import { OfficialDesignStage } from "./stages/OfficialDesignStage";
import { CustomPaletteStage } from "./stages/CustomPaletteStage";
import { PreviewStage } from "./stages/PreviewStage";
import { SaveStage } from "./stages/SaveStage";

export function PaletteStageRouter() {
  const { paletteCreation } = useCustomStore();

  switch (paletteCreation.currentStage) {
    case "choice":
      return <ChoiceStage />;
    case "official":
      return <OfficialDesignStage />;
    case "custom":
      return <CustomPaletteStage />;
    case "preview":
      return <PreviewStage />;
    case "save":
      return <SaveStage />;
    default:
      return <ChoiceStage />;
  }
}
