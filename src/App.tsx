import styled from "@emotion/styled";
import { useState } from "react";
import { type RGBColor } from "react-color";
import { ColorMixer } from "./components/ColorMixer";
import { ColorCoverage } from "./components/ColorCoverage";
import { MixingRatio } from "./components/MixingRatio";
import { PrimaryColorPicker } from "./components/PrimaryColorPicker";
import { getRandomInt } from "./libs";
import { BLUE, GREEN, RED, type PrimaryColors } from "./types";

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
  width: 40%;
  height: 100%;
`;

const getRandomColor = (): RGBColor => {
  return {
    r: getRandomInt(256),
    g: getRandomInt(256),
    b: getRandomInt(256),
  };
};

function App() {
  const [primaryColors, setPrimaryColors] = useState<PrimaryColors>({
    color1: RED,
    color2: GREEN,
    color3: BLUE,
  });

  return (
    <>
      <Container>
        <Left>
          <h2>Primary Colors</h2>
          Pick the primary colors you believe in.
          <PrimaryColorPicker
            primaryColors={primaryColors}
            onChangePrimaryColors={(v) => setPrimaryColors(v)}
            onClickReset={() =>
              setPrimaryColors({ color1: RED, color2: GREEN, color3: BLUE })
            }
            onClickRandom={() =>
              setPrimaryColors({
                color1: getRandomColor(),
                color2: getRandomColor(),
                color3: getRandomColor(),
              })
            }
          />
        </Left>
        <Right>
          <h2>Mixing Ratio</h2>
          Mixing ratios with your primaries.
          <MixingRatio primaryColors={primaryColors} />
          <hr />
          <h2>Color Mixer</h2>
          Mix your primaries.
          <ColorMixer primaryColors={primaryColors} />
          <hr />
          <h2>Color coverage</h2>
          Calculate color coverage with your primaries.
          <ColorCoverage primaryColors={primaryColors} />
        </Right>
      </Container>
    </>
  );
}

export default App;
