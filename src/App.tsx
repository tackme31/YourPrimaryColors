import { useState, useCallback } from "react";
import { type ColorResult, type RGBColor, SketchPicker } from "react-color";
import styled from "@emotion/styled";
import "./App.css";

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

function App() {
  const [isColorPickerDisplayed, setIsColorPickerDisplayed] =
    useState<Boolean>(false);
  const [color1, setColor1] = useState<RGBColor>({ r: 255, g: 0, b: 0 });
  const [color2, setColor2] = useState<RGBColor>({ r: 0, g: 255, b: 0 });
  const [color3, setColor3] = useState<RGBColor>({ r: 0, g: 0, b: 255 });

  const handleOnChange = useCallback((value: ColorResult) => {
    setColor1(value.rgb);
  }, []);

  return (
    <>
      <div>
        <Swatch
          onClick={() => setIsColorPickerDisplayed(!isColorPickerDisplayed)}
        >
          <Color r={color1.r} g={color1.g} b={color1.b} />
        </Swatch>
        {isColorPickerDisplayed && (
          <Popover>
            <Cover onClick={() => setIsColorPickerDisplayed(false)} />
            <SketchPicker color={color1} onChange={handleOnChange} />
          </Popover>
        )}
      </div>
      <FlexRow>
        <Color r={color1.r} g={color1.g} b={color1.b} />
        <Color r={color2.r} g={color2.g} b={color2.b} />
        <Color r={color3.r} g={color3.g} b={color3.b} />
      </FlexRow>
    </>
  );
}

export default App;
