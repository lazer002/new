import { Dimensions, PixelRatio } from "react-native";

const { width, height } = Dimensions.get("window");

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

export const scale = (size: number) =>
  PixelRatio.roundToNearestPixel(size * (width / BASE_WIDTH));

export const verticalScale = (size: number) =>
  PixelRatio.roundToNearestPixel(size * (height / BASE_HEIGHT));

export const moderateScale = (
  size: number,
  factor: number = 0.45
) =>
  PixelRatio.roundToNearestPixel(
    size + (scale(size) - size) * factor
  );

export const clamp = (
  value: number,
  min: number,
  max: number
) => Math.min(max, Math.max(min, value));

export const fontScale = (size: number) =>
  clamp(moderateScale(size), size - 2, size + 4);