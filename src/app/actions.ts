"use server";

import fs from "fs";
import path from "path";

export async function getGrainTextures(): Promise<string[]> {
  const textureDir = path.join(process.cwd(), "public/textures/grain");
  
  try {
    const files = await fs.promises.readdir(textureDir);
    
    // Filter for image files and ignore hidden files like .DS_Store
    const textureFiles = files
      .filter((file) => !file.startsWith(".") && /\.(png|jpg|jpeg|webp)$/i.test(file))
      .sort(); // Sort to ensure consistent order
      
    // Return public paths
    return textureFiles.map((file) => `/textures/grain/${file}`);
  } catch (error) {
    console.error("Error reading texture directory:", error);
    return [];
  }
}
