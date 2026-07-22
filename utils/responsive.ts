// utils/responsive.ts
//
// GARRIB Responsive System
// ------------------------------------------------------------
// Goal:
// Make GARRIB feel like the same premium fashion app on every
// device.
//
// Responsive Layout
// -----------------
// ✓ Card widths
// ✓ Product grids
// ✓ Hero banners
// ✓ Image sizes
// ✓ Tablet layouts
//
// Consistent Design
// -----------------
// ✓ Typography changes only slightly
// ✓ Spacing stays consistent
// ✓ Radius stays consistent
// ✓ Icons stay consistent
//
// Layout should respond to screen size.
// Brand identity should not.
//

import { Dimensions, PixelRatio, useWindowDimensions } from "react-native";

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function buildScales(width: number, height: number) {
  const widthScale = width / BASE_WIDTH;
  const heightScale = height / BASE_HEIGHT;

  /**
   * Layout scale.
   *
   * Use for:
   * - Card width
   * - Hero width
   * - Large artwork
   * - Layout calculations
   *
   * Avoid:
   * - Font sizes
   * - Radius
   * - Small spacing
   * - Icons
   */
  const scale = (size: number) =>
    clamp(size * widthScale, size * 0.9, size * 1.15);

  /**
   * Vertical layout scale.
   *
   * Use only for:
   * - Hero heights
   * - Galleries
   * - Large vertical sections
   */
  const verticalScale = (size: number) =>
    clamp(size * heightScale, size * 0.9, size * 1.15);

  /**
   * Moderate scaling.
   */
  const moderateScale = (size: number, factor = 0.5) =>
    size + (scale(size) - size) * factor;

  /**
   * Typography.
   *
   * Fonts should remain visually consistent across phones.
   * Only allow a small adjustment.
   */
  const normalize = (size: number) => {
    const scaled = moderateScale(size, 0.25);
    const bounded = clamp(scaled, size * 0.95, size * 1.05);
    return PixelRatio.roundToNearestPixel(bounded);
  };

  const wp = (percent: number) => width * percent / 100;
  const hp = (percent: number) => height * percent / 100;

  return {
    scale,
    verticalScale,
    moderateScale,
    normalize,
    wp,
    hp,
  };
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const responsive = buildScales(SCREEN_WIDTH, SCREEN_HEIGHT);

export const scale = responsive.scale;
export const verticalScale = responsive.verticalScale;
export const moderateScale = responsive.moderateScale;
export const normalize = responsive.normalize;
export const wp = responsive.wp;
export const hp = responsive.hp;

export const SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};

export const BREAKPOINTS = {
  phoneSmall: 360,
  phone: 390,
  phoneLarge: 430,
  tablet: 600,
};

export const isSmallDevice = SCREEN_WIDTH < BREAKPOINTS.phoneSmall;
export const isLargePhone = SCREEN_WIDTH >= BREAKPOINTS.phoneLarge;
export const isTablet = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) >= BREAKPOINTS.tablet;

/**
 * ------------------------------------------------------------
 * GARRIB Design Tokens
 *
 * These define the visual language of the brand.
 *
 * They should remain consistent across devices.
 *
 * If something feels wrong on a device,
 * fix the layout before changing these values.
 * ------------------------------------------------------------
 */

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

export const typography = {
  xs: normalize(11),
  sm: normalize(12),
  md: normalize(14),
  lg: normalize(16),
  xl: normalize(18),
  xxl: normalize(20),

  h6: normalize(22),
  h5: normalize(24),
  h4: normalize(28),
  h3: normalize(32),
  h2: normalize(36),
  h1: normalize(42),

  display: normalize(52),
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const icon = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 26,
  xl: 30,
};

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  return {
    width,
    height,
    isSmallDevice: width < BREAKPOINTS.phoneSmall,
    isLargePhone: width >= BREAKPOINTS.phoneLarge,
    isTablet: Math.min(width, height) >= BREAKPOINTS.tablet,
    isLandscape: width > height,
    ...buildScales(width, height),
  };
};

export type Responsive = ReturnType<typeof useResponsive>;