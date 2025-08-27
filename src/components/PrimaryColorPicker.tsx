import styled from "@emotion/styled";
import { Box, Button } from "@mui/material";
import { useState } from "react";
import { SketchPicker } from "react-color";
import { type PrimaryColors } from "../types";
import { ColorBox } from "./ColorBox";
import { FlexRow } from "./FlexRow";

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

type PrimaryColorPickerProps = {
  primaryColors: PrimaryColors;
  onChangePrimaryColors: (value: PrimaryColors) => void;
  onClickReset: () => void;
  onClickRandom: () => void;
};

export const PrimaryColorPicker = ({
  primaryColors,
  onChangePrimaryColors,
  onClickReset,
  onClickRandom,
}: PrimaryColorPickerProps) => {
  const [currentColor, setCurrentColor] =
    useState<keyof PrimaryColors>("color1");
  const [isColorPickerDisplayed, setIsColorPickerDisplayed] =
    useState<Boolean>(false);

  return (
    <>
      <Box sx={{ m: 3 }}>
        <FlexRow>
          <Swatch
            onClick={() => {
              setCurrentColor("color1");
              setIsColorPickerDisplayed(!isColorPickerDisplayed);
            }}
          >
            <ColorBox {...primaryColors.color1} />
          </Swatch>
          <Swatch
            onClick={() => {
              setCurrentColor("color2");
              setIsColorPickerDisplayed(!isColorPickerDisplayed);
            }}
          >
            <ColorBox {...primaryColors.color2} />
          </Swatch>
          <Swatch
            onClick={() => {
              setCurrentColor("color3");
              setIsColorPickerDisplayed(!isColorPickerDisplayed);
            }}
          >
            <ColorBox {...primaryColors.color3} />
          </Swatch>
        </FlexRow>
      </Box>
      <Box sx={{ m: 3 }}>
        <Button variant="contained" size="small" onClick={onClickReset}>
          Reset
        </Button>
        <Button
          sx={{ ml: 1 }}
          variant="contained"
          size="small"
          onClick={onClickRandom}
        >
          Random
        </Button>
      </Box>
      {isColorPickerDisplayed && (
        <Popover>
          <Cover onClick={() => setIsColorPickerDisplayed(false)} />
          <SketchPicker
            color={primaryColors[currentColor]}
            onChange={(v) =>
              onChangePrimaryColors({
                ...primaryColors,
                [currentColor]: v.rgb,
              })
            }
            disableAlpha
          />
        </Popover>
      )}
    </>
  );
};
