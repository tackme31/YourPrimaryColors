import { Box, Slider } from "@mui/material";
import { useState } from "react";
import type { RGBColor } from "react-color";
import { mixColors } from "../libs";
import { BLACK, type PrimaryColors } from "../types";
import { ColorBox } from "./ColorBox";
import { FlexRow } from "./FlexRow";

type ColorMixerProps = {
  primaryColors: PrimaryColors;
};

export const ColorMixer = ({ primaryColors }: ColorMixerProps) => {
  const [targetMixRatio, setTargetMixRatio] = useState<RGBColor>(BLACK);
  const [mixedColor, mixedHex] = mixColors(primaryColors, targetMixRatio);
  return (
    <>
      <Box sx={{ m: 3 }}>
        <FlexRow>
          <ColorBox {...primaryColors.color1} />
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
          <ColorBox {...primaryColors.color2} />

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
          <ColorBox {...primaryColors.color3} />

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
          The color {mixedHex} is <ColorBox {...mixedColor} /> in your
          primaries.
        </FlexRow>
      </Box>
    </>
  );
};
