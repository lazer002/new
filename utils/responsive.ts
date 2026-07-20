// utils/responsive.ts
//
// Single source of truth for responsive sizing across the app.
//
// Two ways to consume it:
//   1. Static helpers (scale, verticalScale, moderateScale, normalize, wp, hp, ...)
//      — read the screen size ONCE at module load via Dimensions.get('window').
//      Safe to call at module scope, e.g. inside StyleSheet.create().
//      Use these for 95% of styling.
//   2. useResponsive() hook — subscribes to live width/height via useWindowDimensions.
//      Only use this inside a component body when a value must update live
//      (e.g. orientation change, foldables, split-screen/tablet multitasking).
//
// Both share the exact same math (buildScales), so a value computed with
// normalize(16) at module scope and font(16) from the hook always agree.

import { Dimensions, PixelRatio, useWindowDimensions } from "react-native";

// ---------------------------------------------------------------------------
// BASE DESIGN FRAME
// Design mockups should be built at this size (iPhone 13/14 class device).
// Every scale factor below is relative to this frame.
// ---------------------------------------------------------------------------
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// ---------------------------------------------------------------------------
// CORE MATH — shared by the static helpers and the hook.
// ---------------------------------------------------------------------------
function buildScales(width: number, height: number) {
  const widthScale = width / BASE_WIDTH;
  const heightScale = height / BASE_HEIGHT;

  // Horizontal-based scale: for widths, paddings, radii, icons — anything
  // that should visually track how wide the device is. Bounded so a small
  // phone doesn't shrink UI to nothing and a tablet doesn't blow it up.
  const scale = (size: number) =>
    clamp(size * widthScale, size * 0.85, size * 1.25);

  // Vertical-based scale: for heights that should track device height
  // (hero banners, gallery heights, etc).
  const verticalScale = (size: number) =>
    clamp(size * heightScale, size * 0.85, size * 1.25);

  // Moderate scale: blends `size` and `scale(size)` by `factor`.
  // factor 1 == full width-based scaling, factor 0 == no scaling at all.
  // This is the standard react-native-size-matters formula.
  const moderateScale = (size: number, factor = 0.5) =>
    size + (scale(size) - size) * factor;

  // normalize(): the function to use for FONT SIZES specifically.
  // Deliberately uses a LOW factor (0.25) and a TIGHT clamp (±10%).
  //
  // Why fonts get a small factor while spacing/images get a bigger one:
  // big commerce apps (Amazon, Myntra, Flipkart) keep type size nearly
  // constant across phones and instead flex the LAYOUT (columns, card
  // width, image height, gutters) around it. If font size scales the same
  // amount as layout, a 320px phone and a 428px phone end up with visibly
  // different-looking type even though neither looks "wrong" in isolation —
  // that mismatch is what reads as "font looks bigger on small phones".
  const normalize = (size: number) => {
    const scaled = moderateScale(size, 0.25);
    const bounded = clamp(scaled, size * 0.9, size * 1.1);
    return PixelRatio.roundToNearestPixel(bounded);
  };

  const wp = (percent: number) => (width * percent) / 100;
  const hp = (percent: number) => (height * percent) / 100;

  return { scale, verticalScale, moderateScale, normalize, wp, hp };
}

// ---------------------------------------------------------------------------
// STATIC API — computed once at import time from Dimensions.get('window').
// Use this inside StyleSheet.create() and any module-scope constants.
// Not reactive to rotation, but neither is 95% of a phone commerce app —
// if a screen genuinely needs to react to rotation/fold, use the hook below
// for that screen instead.
// ---------------------------------------------------------------------------
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const staticScales = buildScales(SCREEN_WIDTH, SCREEN_HEIGHT);

export const scale = staticScales.scale;
export const verticalScale = staticScales.verticalScale;
export const moderateScale = staticScales.moderateScale;
export const normalize = staticScales.normalize;
export const wp = staticScales.wp;
export const hp = staticScales.hp;

export const SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};

export const BREAKPOINTS = {
  small: 360, // e.g. 320, 340, 345, 358
  medium: 390, // e.g. 375, 380, 390
  large: 430, // e.g. 414, 420, 428
  tablet: 600,
};

export const isSmallDevice = SCREEN_WIDTH < BREAKPOINTS.small;
export const isMediumDevice =
  SCREEN_WIDTH >= BREAKPOINTS.small && SCREEN_WIDTH < BREAKPOINTS.medium;
export const isLargeDevice =
  SCREEN_WIDTH >= BREAKPOINTS.medium && SCREEN_WIDTH < BREAKPOINTS.large;
export const isTablet = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) >= BREAKPOINTS.tablet;

// ---------------------------------------------------------------------------
// SHARED DESIGN TOKENS (static — import these instead of hardcoding numbers)
// ---------------------------------------------------------------------------
export const spacing = {
  xxs: scale(2),
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(24),
  xxxl: scale(32),
  huge: scale(40),
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
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(24),
  full: 999,
};

export const icon = {
  xs: scale(14),
  sm: scale(18),
  md: scale(22),
  lg: scale(26),
  xl: scale(30),
};

// ---------------------------------------------------------------------------
// REACTIVE HOOK — use inside a component body only when you need live
// updates (rotation, foldables, tablet split view). Everything else should
// use the static exports above.
// ---------------------------------------------------------------------------
export const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  const helpers = buildScales(width, height);

  return {
    width,
    height,
    isSmallDevice: width < BREAKPOINTS.small,
    isMediumDevice: width >= BREAKPOINTS.small && width < BREAKPOINTS.medium,
    isLargeDevice: width >= BREAKPOINTS.medium && width < BREAKPOINTS.large,
    isTablet: Math.min(width, height) >= BREAKPOINTS.tablet,
    isLandscape: width > height,
    ...helpers,
  };
};

export type Responsive = ReturnType<typeof useResponsive>;
