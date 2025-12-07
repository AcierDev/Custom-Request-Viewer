import { Text, Line } from "@react-three/drei";
import { useMemo } from "react";
import { getBlockSizeInches } from "@/lib/utils";
import * as THREE from "three";

interface RulerProps {
  width: number; // Three.js units
  height: number; // Three.js units
  useMini: boolean;
  showRuler: boolean;
}

export function Ruler({ width, height, useMini, showRuler }: RulerProps) {
  if (!showRuler) return null;

  const blockSizeInches = getBlockSizeInches(useMini);
  // 0.5 units in Three.js = blockSizeInches in real world
  // So 1 unit = 2 * blockSizeInches
  // 1 inch = 0.5 / blockSizeInches units
  const unitsPerInch = 0.5 / blockSizeInches;

  const rulerColor = "#a855f7"; // Purple-500
  const textColor = "#d8b4fe"; // Purple-300
  const tickSize = 0.2;
  const margin = 0.5; // Distance from the object

  const { topTicks, leftTicks, topLabels, leftLabels, mainLines } = useMemo(() => {
    const topTicks: JSX.Element[] = [];
    const leftTicks: JSX.Element[] = [];
    const topLabels: JSX.Element[] = [];
    const leftLabels: JSX.Element[] = [];
    const mainLines: JSX.Element[] = [];

    // Calculate total inches
    const totalInchesX = width / unitsPerInch;
    const totalInchesY = height / unitsPerInch;

    // Top Ruler (X-axis)
    // Starts at -width/2, goes to width/2
    // Corresponds to 0 to totalInchesX
    const startX = -width / 2;
    const yPos = height / 2 + margin;

    // Draw main line
    mainLines.push(
      <Line
        key="top-line"
        points={[
          [startX, yPos, 0],
          [width / 2, yPos, 0],
        ]}
        color={rulerColor}
        lineWidth={2}
      />
    );

    // Ticks and Labels for Top Ruler
    for (let i = 0; i <= Math.ceil(totalInchesX); i++) {
      // Show tick every 12 inches (1 foot)
      if (i % 12 === 0) {
        const x = startX + i * unitsPerInch;
        if (x > width / 2 + 0.01) continue;

        topTicks.push(
          <Line
            key={`top-tick-${i}`}
            points={[
              [x, yPos, 0],
              [x, yPos + tickSize, 0],
            ]}
            color={rulerColor}
            lineWidth={2}
          />
        );

        topLabels.push(
          <Text
            key={`top-label-${i}`}
            position={[x, yPos + tickSize + 0.3, 0]}
            fontSize={0.4}
            color={textColor}
            anchorX="center"
            anchorY="bottom"
          >
            {`${i}"`}
          </Text>
        );
      }
    }

    // Left Ruler (Y-axis)
    // Starts at height/2 (0 inches), goes to -height/2 (totalInchesY)
    const startY = height / 2;
    const xPos = -width / 2 - margin;

    // Draw main line
    mainLines.push(
      <Line
        key="left-line"
        points={[
          [xPos, startY, 0],
          [xPos, -height / 2, 0],
        ]}
        color={rulerColor}
        lineWidth={2}
      />
    );

    // Ticks and Labels for Left Ruler
    for (let i = 0; i <= Math.ceil(totalInchesY); i++) {
      // Show tick every 12 inches
      if (i % 12 === 0) {
        const y = startY - i * unitsPerInch;
        if (y < -height / 2 - 0.01) continue;

        leftTicks.push(
          <Line
            key={`left-tick-${i}`}
            points={[
              [xPos, y, 0],
              [xPos - tickSize, y, 0],
            ]}
            color={rulerColor}
            lineWidth={2}
          />
        );

        leftLabels.push(
          <Text
            key={`left-label-${i}`}
            position={[xPos - tickSize - 0.1, y, 0]}
            fontSize={0.4}
            color={textColor}
            anchorX="right"
            anchorY="middle"
          >
            {`${i}"`}
          </Text>
        );
      }
    }

    return { topTicks, leftTicks, topLabels, leftLabels, mainLines };
  }, [width, height, unitsPerInch]);

  return (
    <group>
      {mainLines}
      {topTicks}
      {leftTicks}
      {topLabels}
      {leftLabels}
    </group>
  );
}
