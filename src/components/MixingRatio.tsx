import { Box } from "@mui/material";
import { useMemo, useState } from "react";
import { SketchPicker, type RGBColor } from "react-color";
import { areColorsLinearlyIndependent, getMixingRatios } from "../libs";
import { RED, type PrimaryColors } from "../types";
import { ColorBox } from "./ColorBox";
import { FlexRow } from "./FlexRow";

type MixingRatioProps = {
  primaryColors: PrimaryColors;
};

export const MixingRatio = ({ primaryColors }: MixingRatioProps) => {
  const [targetColor, setTargetColor] = useState<RGBColor>(RED);
  const mixingRatios = useMemo(
    () => getMixingRatios(primaryColors, targetColor),
    [primaryColors, targetColor]
  );
  const hasLinearlyIndependentError = useMemo(
    () => !areColorsLinearlyIndependent(primaryColors),
    [primaryColors]
  );
  return (
    <>
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
          <ColorBox {...targetColor} />
          can be expressed as a combination of:
        </FlexRow>
        <Box sx={{ ml: 3, mt: 1 }}>
          <FlexRow>
            <ColorBox {...primaryColors.color1} />
            {hasLinearlyIndependentError ? "ERROR" : mixingRatios.x}
          </FlexRow>
          <FlexRow>
            <ColorBox {...primaryColors.color2} />
            {hasLinearlyIndependentError ? "ERROR" : mixingRatios.y}
          </FlexRow>
          <FlexRow>
            <ColorBox {...primaryColors.color3} />
            {hasLinearlyIndependentError ? "ERROR" : mixingRatios.z}
          </FlexRow>
        </Box>
      </Box>
    </>
  );
};