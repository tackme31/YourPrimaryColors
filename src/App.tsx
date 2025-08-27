import { useCallback, useMemo, useState } from "react";
import { type RGBColor, SketchPicker } from "react-color";
import styled from "@emotion/styled";
import { Box, Button, Slider } from "@mui/material";
import { BLACK, BLUE, GREEN, RED, type PrimaryColors } from "./types";
import {
  areColorsLinearlyIndependent,
  estimateCoverageGridAsync,
  getMixingRatios,
  getRandomInt,
  mixColors,
} from "./libs";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const Container = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  justify-content: center;
  margin-top: 100px;
`;

const Left = styled.div`
  width: 20%;
  height: 100%;
`;

const Right = styled.div`
  width: 40%; /* 右側30% */
  height: 100%;
`;
const Swatch = styled.div`
  padding: 5px;
  background: #fff;
  border-radius: 1px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  display: inline-block;
  cursor: pointer;
`;

const Popover = styled.div`
  position: absolute;
  z-index: 2;
`;

const Cover = styled.div`
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
`;

const Color = styled.div<RGBColor>`
  width: 36px;
  height: 14px;
  border-radius: 2px;
  background: ${(props) => `rgb(${props.r}, ${props.g}, ${props.b})`};
`;

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const getRandomColor = (): RGBColor => {
  return {
    r: getRandomInt(256),
    g: getRandomInt(256),
    b: getRandomInt(256),
  };
};

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

function App() {
  const [isColorPickerDisplayed, setIsColorPickerDisplayed] =
    useState<Boolean>(false);
  const [currentColor, setCurrentColor] =
    useState<keyof PrimaryColors>("color1");
  const [primaryColors, setPrimaryColors] = useState<PrimaryColors>({
    color1: RED,
    color2: GREEN,
    color3: BLUE,
  });
  const [targetColor, setTargetColor] = useState<RGBColor>(RED);
  const [targetMixRatio, setTargetMixRatio] = useState<RGBColor>(BLACK);
  const hasLinearlyIndependentError = useMemo(
    () => !areColorsLinearlyIndependent(primaryColors),
    [primaryColors]
  );
  const mixingRatios = useMemo(
    () => getMixingRatios(primaryColors, targetColor),
    [primaryColors, targetColor]
  );
  const [mixedColor, mixedHex] = mixColors(primaryColors, targetMixRatio);
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
      <Container>
        <Left>
          <h2>Primary Colors</h2>
          Pick the primary colors you believe in.
          <Box sx={{ m: 3 }}>
            <FlexRow>
              <Swatch
                onClick={() => {
                  setCurrentColor("color1");
                  setIsColorPickerDisplayed(!isColorPickerDisplayed);
                }}
              >
                <Color {...primaryColors.color1} />
              </Swatch>
              <Swatch
                onClick={() => {
                  setCurrentColor("color2");
                  setIsColorPickerDisplayed(!isColorPickerDisplayed);
                }}
              >
                <Color {...primaryColors.color2} />
              </Swatch>
              <Swatch
                onClick={() => {
                  setCurrentColor("color3");
                  setIsColorPickerDisplayed(!isColorPickerDisplayed);
                }}
              >
                <Color {...primaryColors.color3} />
              </Swatch>
            </FlexRow>
          </Box>
          <Box sx={{ m: 3 }}>
            <Button
              variant="contained"
              size="small"
              onClick={() =>
                setPrimaryColors({ color1: RED, color2: GREEN, color3: BLUE })
              }
            >
              Reset
            </Button>
            <Button
              sx={{ ml: 1 }}
              variant="contained"
              size="small"
              onClick={() =>
                setPrimaryColors({
                  color1: getRandomColor(),
                  color2: getRandomColor(),
                  color3: getRandomColor(),
                })
              }
            >
              Random
            </Button>
          </Box>
          {isColorPickerDisplayed && (
            <Popover>
              <Cover onClick={() => setIsColorPickerDisplayed(false)} />
              <SketchPicker
                color={primaryColors[currentColor]}
                onChange={(value) =>
                  setPrimaryColors((prev) => ({
                    ...prev,
                    [currentColor]: value.rgb,
                  }))
                }
                disableAlpha
              />
            </Popover>
          )}
        </Left>
        <Right>
          <h2>Mixing Ratio</h2>
          Mixing ratios with your primaries.
          <Box sx={{ m: 3 }}>
            <SketchPicker
              color={targetColor}
              onChange={(value) => setTargetColor(value.rgb)}
              disableAlpha
            />
          </Box>
          <Box sx={{ m: 3 }}>
            <FlexRow>
              The color
              <Color {...targetColor} />
              can be expressed as a combination of:
            </FlexRow>
            <Box sx={{ ml: 3, mt: 1 }}>
              <FlexRow>
                <Color {...primaryColors.color1} />
                {hasLinearlyIndependentError ? "ERROR" : mixingRatios.x}
              </FlexRow>
              <FlexRow>
                <Color {...primaryColors.color2} />
                {hasLinearlyIndependentError ? "ERROR" : mixingRatios.y}
              </FlexRow>
              <FlexRow>
                <Color {...primaryColors.color3} />
                {hasLinearlyIndependentError ? "ERROR" : mixingRatios.z}
              </FlexRow>
            </Box>
          </Box>
          <hr />
          <h2>Color Mixer</h2>
          Mix your primaries.
          <Box sx={{ m: 3 }}>
            <FlexRow>
              <Color {...primaryColors.color1} />
              <Slider
                value={targetMixRatio.r}
                onChange={(_, v) =>
                  setTargetMixRatio((prev) => ({ ...prev, r: v }))
                }
                sx={{ mx: 1 }}
                step={1}
                min={0}
                max={255}
              />
              <Box width={30}>{targetMixRatio.r}</Box>
            </FlexRow>
            <FlexRow>
              <Color {...primaryColors.color2} />

              <Slider
                value={targetMixRatio.g}
                onChange={(_, v) =>
                  setTargetMixRatio((prev) => ({ ...prev, g: v }))
                }
                sx={{ mx: 1 }}
                step={1}
                min={0}
                max={255}
              />
              <Box width={30}>{targetMixRatio.g}</Box>
            </FlexRow>
            <FlexRow>
              <Color {...primaryColors.color3} />

              <Slider
                value={targetMixRatio.b}
                onChange={(_, v) =>
                  setTargetMixRatio((prev) => ({ ...prev, b: v }))
                }
                sx={{ mx: 1 }}
                step={1}
                min={0}
                max={255}
              />
              <Box width={30}>{targetMixRatio.b}</Box>
            </FlexRow>
          </Box>
          <Box sx={{ m: 3 }}>
            <FlexRow>
              The color {mixedHex} is <Color {...mixedColor} /> in your primaries.
            </FlexRow>
          </Box>
          <hr />
          <h2>Color coverage</h2>
          Calculate color coverage with your primaries.
          <Box sx={{ m: 3 }}>
            <FlexRow>
              <Button variant="contained" onClick={handleOnClickCalculate}>
                Go
              </Button>
              Coverage: {calculating ? "calculating" : coverage}%
            </FlexRow>
          </Box>
          <Canvas
            style={{ height: 600 }}
            camera={{ position: [3, 3, 3], fov: 50 }}
          >
            <ambientLight />
            <GradientCube />
            {coveredColors.map(({ r, g, b }) => (
              <RGBPoint x={r} y={g} z={b} />
            ))}
            <OrbitControls />
          </Canvas>
        </Right>
      </Container>
    </>
  );
}

export default App;
