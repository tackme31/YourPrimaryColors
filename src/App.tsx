import { useMemo, useState } from "react";
import { type RGBColor, SketchPicker } from "react-color";
import styled from "@emotion/styled";
import { det, matrix, inv, multiply } from "mathjs";
import { Box } from "@mui/material";

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

function App() {
  const [isColorPickerDisplayed, setIsColorPickerDisplayed] =
    useState<Boolean>(false);
  const [currentColor, setCurrentColor] =
    useState<keyof PrimaryColors>("color1");
  const [primaryColors, setPrimaryColors] = useState<PrimaryColors>({
    color1: { r: 255, g: 0, b: 0 },
    color2: { r: 0, g: 255, b: 0 },
    color3: { r: 0, g: 0, b: 255 },
  });
  const [targetColor, setTargetColor] = useState<RGBColor>({
    r: 255,
    g: 0,
    b: 0,
  });
  const hasLinearlyIndependentError = useMemo(
    () => !areColorsLinearlyIndependent(primaryColors),
    [primaryColors]
  );
  const mixingRatios = useMemo(
    () => getMixingRatios(primaryColors, targetColor),
    [primaryColors, targetColor]
  );

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
        </Right>
      </Container>
    </>
  );
}

export default App;
