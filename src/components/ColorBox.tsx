import styled from "@emotion/styled";
import type { RGBColor } from "react-color";

export const ColorBox = styled.div<RGBColor>`
  width: 36px;
  height: 14px;
  border-radius: 2px;
  background: ${(props) => `rgb(${props.r}, ${props.g}, ${props.b})`};
`;