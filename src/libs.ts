import { det, inv, matrix, multiply } from "mathjs";
import type { PrimaryColors } from "./types";
import type { RGBColor } from "react-color";

/**
 * 3つのRGBColorが線形独立かどうか判定する
 */
export function areColorsLinearlyIndependent(colors: PrimaryColors): boolean {
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

/**
 * primaryColorsを指定したratios (0~255)の割合で合成した色を計算
 */
export function mixColors(
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
export async function estimateCoverageGridAsync(
  primaryColors: PrimaryColors,
  step = 16
): Promise<[number, RGBColor[]]> {
  if (!areColorsLinearlyIndependent(primaryColors)) {
    return [0, []];
  }

  let colors: RGBColor[] = [];
  let insideCount = 0;
  let totalCount = 0;

  let start = step / 2;
  let end = 255 + step / 2;
  for (let r = start; r <= end; r += step) {
    for (let g = start; g <= end; g += step) {
      for (let b = start; b <= end; b += step) {
        totalCount++;
        const target: RGBColor = { r, g, b };
        const { x, y, z } = getMixingRatios(primaryColors, target);
        if (x >= 0 && y >= 0 && z >= 0) {
          insideCount++;
          colors.push({ r, g, b });
        }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return [(insideCount / totalCount) * 100, colors];
}

/**
 * [0, max)の範囲の整数の乱数を返します
 */
export function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}
