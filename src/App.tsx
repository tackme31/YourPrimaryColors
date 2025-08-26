import { useCallback, useMemo, useState } from "react";
import { type RGBColor, SketchPicker } from "react-color";
import styled from "@emotion/styled";
import { det, matrix, inv, multiply } from "mathjs";
import { Box, Button, Slider } from "@mui/material";

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

type PrimaryColors = {
  color1: RGBColor;
  color2: RGBColor;
  color3: RGBColor;
};

/**
 * 3つのRGBColorが線形独立かどうか判定する
 */
function areColorsLinearlyIndependent(colors: PrimaryColors): boolean {
  const mat = matrix([
    [colors.color1.r, colors.color2.r, colors.color3.r],
    [colors.color1.g, colors.color2.g, colors.color3.g],
    [colors.color1.b, colors.color2.b, colors.color3.b],
  ]);

  const determinant = det(mat);

  // 行列式が0でなければ線形独立
  return Math.abs(determinant) > 1e-6;
}

/**
 * targetColorをprimaryColorsで表すときの配合割合を計算
 */
export function getMixingRatios(
  primaryColors: PrimaryColors,
  targetColor: RGBColor
): { x: number; y: number; z: number } {
  if (!areColorsLinearlyIndependent(primaryColors)) {
    return { x: 0, y: 0, z: 0 };
  }

  // 三原色行列
  const M = matrix([
    [primaryColors.color1.r, primaryColors.color2.r, primaryColors.color3.r],
    [primaryColors.color1.g, primaryColors.color2.g, primaryColors.color3.g],
    [primaryColors.color1.b, primaryColors.color2.b, primaryColors.color3.b],
  ]);

  // 逆行列を計算
  const M_inv = inv(M);

  // targetColorベクトル
  const T = matrix([targetColor.r, targetColor.g, targetColor.b]);

  // 配合割合を計算
  const ratios = multiply(M_inv, T).toArray() as number[];

  return { x: ratios[0], y: ratios[1], z: ratios[2] };
}

function mixColors(
  primaryColors: PrimaryColors,
  ratios: RGBColor
): [RGBColor, string] {
  const [x, y, z] = [ratios.r, ratios.g, ratios.b];

  const r =
    (primaryColors.color1.r * x +
      primaryColors.color2.r * y +
      primaryColors.color3.r * z) /
    255;
  const g =
    (primaryColors.color1.g * x +
      primaryColors.color2.g * y +
      primaryColors.color3.g * z) /
    255;
  const b =
    (primaryColors.color1.b * x +
      primaryColors.color2.b * y +
      primaryColors.color3.b * z) /
    255;

  // 0~255にクリップして整数化
  const color = {
    r: Math.min(Math.max(Math.round(r), 0), 255),
    g: Math.min(Math.max(Math.round(g), 0), 255),
    b: Math.min(Math.max(Math.round(b), 0), 255),
  };

  // HEXに変換
  const hex = {
    r: ratios.r.toString(16).padStart(2, "0").toUpperCase(),
    g: ratios.g.toString(16).padStart(2, "0").toUpperCase(),
    b: ratios.b.toString(16).padStart(2, "0").toUpperCase(),
  };
  return [color, `#${hex.r}${hex.g}${hex.b}`];
}

/**
 * 数値格子サンプリングで再現可能な色の割合を計算
 */
async function estimateCoverageGridAsync(
  primaryColors: PrimaryColors,
  step = 16
): Promise<number> {
  if (!areColorsLinearlyIndependent(primaryColors)) {
    return 0;
  }

  let insideCount = 0;
  let totalCount = 0;

  for (let r = 0; r <= 255; r += step) {
    for (let g = 0; g <= 255; g += step) {
      for (let b = 0; b <= 255; b += step) {
        totalCount++;
        const target: RGBColor = { r, g, b };
        const { x, y, z } = getMixingRatios(primaryColors, target);
        if (x >= 0 && y >= 0 && z >= 0) insideCount++;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return (insideCount / totalCount) * 100;
}

const BLACK: RGBColor = { r: 0, g: 0, b: 0 } as const;
const RED: RGBColor = { r: 255, g: 0, b: 0 } as const;
const GREEN: RGBColor = { r: 0, g: 255, b: 0 } as const;
const BLUE: RGBColor = { r: 0, g: 0, b: 255 } as const;

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
  const handleOnClickCalculate = useCallback(async () => {
    setCalculating(true);
    const result = await estimateCoverageGridAsync(primaryColors);
    setCoverage(result);
    setCalculating(false);
  }, [primaryColors]);

  return (
    <>
      <Container>
        <Left>
          <h2>Primary Colors</h2>
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

            <Button
              variant="contained"
              size="small"
              onClick={() =>
                setPrimaryColors({ color1: RED, color2: GREEN, color3: BLUE })
              }
            >
              Reset
            </Button>
          </FlexRow>

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
          <Box sx={{ m: 3 }}>
            <FlexRow>HEX: {mixedHex}</FlexRow>
            <FlexRow>
              Mixed color:
              <Color {...mixedColor} />
            </FlexRow>
          </Box>

          <hr />
          <h2>Color coverage</h2>
          <Button variant="contained" onClick={handleOnClickCalculate}>
            Calculate
          </Button>
          <Box sx={{ m: 3 }}>
            <FlexRow>
              Coverage: {calculating ? "calculating" : coverage}%
            </FlexRow>
          </Box>
        </Right>
      </Container>
    </>
  );
}

export default App;
