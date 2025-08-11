import { ItemDesigns } from "./types";

export const COASTAL_COLORS: Record<number, { hex: string; name: string }> = {
  1: { hex: "#B0744A", name: "Santa Fe" },
  2: { hex: "#C18F6A", name: "Antique Brass" },
  3: { hex: "#D1AA8A", name: "Tan" },
  4: { hex: "#BEAF99", name: "Malta" },
  5: { hex: "#A9B4A5", name: "Bud" },
  6: { hex: "#92A099", name: "Pewter" },
  7: { hex: "#849290", name: "Oslo Gray" },
  8: { hex: "#6E7F83", name: "Sirocco" },
  10: { hex: "#77919D", name: "Gothic" },
  11: { hex: "#7C9DAD", name: "Gumbo" },
  12: { hex: "#567E8B", name: "Smalt Blue" },
  13: { hex: "#3E6974", name: "William" },
  14: { hex: "#194A51", name: "Blue Dianne" },
  15: { hex: "#1C424E", name: "Blue Dianne" },
  16: { hex: "#21394B", name: "Nile Blue" },
};

export const DESIGN_COLORS: Record<
  ItemDesigns,
  Record<number, { hex: string; name: string }>
> = {
  [ItemDesigns.Coastal]: COASTAL_COLORS,
  [ItemDesigns.Custom]: {},
  [ItemDesigns.Tidal]: COASTAL_COLORS,
  [ItemDesigns.Oceanic_Harmony]: COASTAL_COLORS,
  [ItemDesigns.Timberline]: COASTAL_COLORS,
  [ItemDesigns.Amber]: COASTAL_COLORS,
  [ItemDesigns.Sapphire]: COASTAL_COLORS,
  [ItemDesigns.Winter]: COASTAL_COLORS,
  [ItemDesigns.Forest]: COASTAL_COLORS,
  [ItemDesigns.Autumn]: COASTAL_COLORS,
  [ItemDesigns.Elemental]: COASTAL_COLORS,
  [ItemDesigns.Abyss]: COASTAL_COLORS,
  [ItemDesigns.Spectrum]: COASTAL_COLORS,
  [ItemDesigns.Aloe]: COASTAL_COLORS,
  [ItemDesigns.Mirage]: COASTAL_COLORS,
};
