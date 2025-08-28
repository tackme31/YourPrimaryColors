import { Box, Button } from "@mui/material";
import { Line, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useCallback, useState } from "react";
import { type RGBColor } from "react-color";
import * as THREE from "three";
import { colorToVec3, estimateCoverageGridAsync } from "../libs";
import { BLACK, BLUE, RED, type PrimaryColors, type Vec3 } from "../types";
import { FlexRow } from "./FlexRow";

// -1~1 に変換してThree.js座標に
const normalize = (v: Vec3): [number, number, number] => [
  (v.x / 255) * 2 - 1,
  (v.y / 255) * 2 - 1,
  (v.z / 255) * 2 - 1,
];

// ベクトルと色立方体の交点を計算
const getCubeIntersection = (v: Vec3): Vec3 => {
  const tX = v.x > 0 ? 255 / v.x : Infinity;
  const tY = v.y > 0 ? 255 / v.y : Infinity;
  const tZ = v.z > 0 ? 255 / v.z : Infinity;

  const tMin = Math.min(tX, tY, tZ);

  return {
    x: v.x * tMin,
    y: v.y * tMin,
    z: v.z * tMin,
  };
};

type PointProps = {
  x: number; // 0~255
  y: number;
  z: number;
  color?: string;
};

const RGBPoint = ({ x, y, z, color = "black" }: PointProps) => {
  const pos = normalize({ x, y, z });

  return (
    <mesh position={[pos[0], pos[1], pos[2]]}>
      <sphereGeometry args={[0.02, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

const ColorAxis = ({ color }: { color: RGBColor }) => {
  const end1 = colorToVec3(color);
  const end2 = getCubeIntersection(colorToVec3(color));

  return (
    <>
      <Line
        points={[[-1, -1, -1], normalize(end1)]}
        lineWidth={2}
        color={"black"}
      />
      <Line
        points={[normalize(end1), normalize(end2)]}
        lineWidth={2}
        color={"red"}
      />
    </>
  );
};

const GradientCube = () => {
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
};

type CoverageCubeProps = {
  colorAxises: PrimaryColors;
  coveredColors: [RGBColor[], RGBColor[]];
};
const CoverageCube = ({
  colorAxises: primaryColors,
  coveredColors,
}: CoverageCubeProps) => {
  return (
    <Canvas style={{ height: 600 }} camera={{ position: [3, 3, 3], fov: 50 }}>
      <ambientLight />
      <GradientCube />
      {coveredColors[0].map(({ r, g, b }) => (
        <RGBPoint x={r} y={g} z={b} color="black" />
      ))}
      {coveredColors[1].map(({ r, g, b }) => (
        <RGBPoint x={r} y={g} z={b} color="red" />
      ))}
      <ColorAxis color={primaryColors.color1} />
      <ColorAxis color={primaryColors.color2} />
      <ColorAxis color={primaryColors.color3} />
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
  const [coveredColors, setCoveredColors] = useState<[RGBColor[], RGBColor[]]>([
    [],
    [],
  ]);
  const [colorAxises, setColorAxises] = useState<PrimaryColors>(primaryColors);
  const handleOnClickCalculate = useCallback(async () => {
    setCalculating(true);
    const [result, colorsIn255, colorsOut255] = await estimateCoverageGridAsync(
      primaryColors
    );
    setCoverage(result);
    setCoveredColors([colorsIn255, colorsOut255]);
    setColorAxises(primaryColors);
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
      <CoverageCube colorAxises={colorAxises} coveredColors={coveredColors} />
    </>
  );
};
