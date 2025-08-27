import { Box, Button } from "@mui/material";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useCallback, useState } from "react";
import { type RGBColor } from "react-color";
import * as THREE from "three";
import { estimateCoverageGridAsync } from "../libs";
import { BLACK, type PrimaryColors } from "../types";
import { FlexRow } from "./FlexRow";

function GradientCube() {
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const colors: number[] = [];

  for (let i = 0; i < geometry.attributes.position.count; i++) {
    const x = geometry.attributes.position.getX(i);
    const y = geometry.attributes.position.getY(i);
    const z = geometry.attributes.position.getZ(i);

    // -1〜1 の座標を 0〜1 に正規化
    const r = (x + 1) / 2;
    const g = (y + 1) / 2;
    const b = (z + 1) / 2;

    colors.push(r, g, b);
  }

  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial vertexColors={true} transparent={true} opacity={0.5} />
    </mesh>
  );
}

type PointProps = {
  x: number; // 0~255
  y: number;
  z: number;
  color?: RGBColor;
};

function RGBPoint({ x, y, z, color = BLACK }: PointProps) {
  // -1〜1 に正規化
  const nx = (x / 255) * 2 - 1;
  const ny = (y / 255) * 2 - 1;
  const nz = (z / 255) * 2 - 1;

  return (
    <mesh position={[nx, ny, nz]}>
      <sphereGeometry args={[0.02, 16, 16]} />
      <meshBasicMaterial color={[color.r, color.g, color.b]} />
    </mesh>
  );
}

type CoverageCubeProps = {
  coveredColors: RGBColor[];
};
const CoverageCube = ({ coveredColors }: CoverageCubeProps) => {
  return (
    <Canvas style={{ height: 600 }} camera={{ position: [3, 3, 3], fov: 50 }}>
      <ambientLight />
      <GradientCube />
      {coveredColors.map(({ r, g, b }) => (
        <RGBPoint x={r} y={g} z={b} />
      ))}
      <OrbitControls />
    </Canvas>
  );
};

type ColorCoverageProps = {
  primaryColors: PrimaryColors;
};

export const ColorCoverage = ({ primaryColors }: ColorCoverageProps) => {
  const [calculating, setCalculating] = useState(false);
  const [coverage, setCoverage] = useState(100);
  const [coveredColors, setCoveredColors] = useState<RGBColor[]>([]);
  const handleOnClickCalculate = useCallback(async () => {
    setCalculating(true);
    const [result, colors] = await estimateCoverageGridAsync(primaryColors);
    setCoverage(result);
    setCoveredColors(colors);
    setCalculating(false);
  }, [primaryColors]);

  return (
    <>
      <Box sx={{ m: 3 }}>
        <FlexRow>
          <Button variant="contained" onClick={handleOnClickCalculate}>
            Go
          </Button>
          Coverage: {calculating ? "calculating" : coverage}%
        </FlexRow>
      </Box>
      <CoverageCube coveredColors={coveredColors} />
    </>
  );
};
