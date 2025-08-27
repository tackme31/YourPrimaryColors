import { type RGBColor } from "react-color";

export type PrimaryColors = {
  color1: RGBColor;
  color2: RGBColor;
  color3: RGBColor;
};

export const BLACK: RGBColor = { r: 0, g: 0, b: 0 } as const;
export const RED: RGBColor = { r: 255, g: 0, b: 0 } as const;
export const GREEN: RGBColor = { r: 0, g: 255, b: 0 } as const;
export const BLUE: RGBColor = { r: 0, g: 0, b: 255 } as const;

export type Vec3 = { x: number; y: number; z: number };