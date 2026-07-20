import { Dimensions, PixelRatio } from "react-native";

/* ===========================================================
   SCREEN
=========================================================== */

const { width, height } = Dimensions.get("window");

const shortSide = Math.min(width, height);
const longSide = Math.max(width, height);

/* ===========================================================
   DEVICE
=========================================================== */

export const DEVICE = {
  width,
  height,

  shortSide,
  longSide,

  isLandscape: width > height,

  isTablet: shortSide >= 600,

  isSmallPhone: shortSide < 360,

  isLargePhone: shortSide >= 430,
};

/* ===========================================================
   SCREEN
=========================================================== */

export const SCREEN = {
  width,
  height,

  shortSide,
  longSide,

  aspectRatio: height / width,

  pixelRatio: PixelRatio.get(),

  fontScale: PixelRatio.getFontScale(),

  isTablet: DEVICE.isTablet,

  isLandscape: DEVICE.isLandscape,
};

/* ===========================================================
   HELPERS
=========================================================== */

const round = (value: number) =>
  PixelRatio.roundToNearestPixel(value);

/* ===========================================================
   DESIGN TOKENS
=========================================================== */

export const FONT = Object.freeze({
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,

  h3: 28,
  h2: 32,
  h1: 40,

  hero: 48,
});

export const ICON = Object.freeze({
  xs: 16,
  sm: 18,
  md: 22,
  lg: 24,
  xl: 28,
  xxl: 32,
});

export const BUTTON = Object.freeze({
  xs: 40,
  sm: 44,
  md: 48,
  lg: 56,
  xl: 64,
});

export const SPACING = Object.freeze({
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
});

export const RADIUS = Object.freeze({
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
});




/* ===========================================================
   SAFE AREA
=========================================================== */

export const SAFE = Object.freeze({
  horizontal: SPACING.lg,
  vertical: SPACING.xl,
});

/* ===========================================================
   WIDTH / HEIGHT HELPERS
=========================================================== */

export const widthPercent = (percent: number) =>
  round((SCREEN.width * percent) / 100);

export const heightPercent = (percent: number) =>
  round((SCREEN.height * percent) / 100);

/* ===========================================================
   FULL SCREEN
=========================================================== */

export const FULL = Object.freeze({
  width: SCREEN.width,
  height: SCREEN.height,
});

/* ===========================================================
   SCREEN CENTER
=========================================================== */

export const SCREEN_CENTER = Object.freeze({
  x: SCREEN.width / 2,
  y: SCREEN.height / 2,
});

/* ===========================================================
   CONTENT
=========================================================== */

export const CONTENT_WIDTH =
  SCREEN.width - SAFE.horizontal * 2;

/* ===========================================================
   GRID
=========================================================== */

export const PRODUCT_COLUMNS =
  DEVICE.isTablet ? 3 : 2;

export const GRID_GAP = SPACING.lg;

export const productCardWidth =
  (
    CONTENT_WIDTH -
    GRID_GAP * (PRODUCT_COLUMNS - 1)
  ) / PRODUCT_COLUMNS;

/* ===========================================================
   COMMON SIZES
=========================================================== */

export const IMAGE = Object.freeze({
  avatarSm: 32,
  avatarMd: 40,
  avatarLg: 56,
  avatarXl: 72,

  thumbnail: 72,

  product: productCardWidth,

  hero: widthPercent(100),
});

/* ===========================================================
   HEADER
=========================================================== */

export const HEADER = Object.freeze({
  height: 56,

  largeHeight: 72,

  searchHeight: 48,
});

/* ===========================================================
   TAB BAR
=========================================================== */

export const TABBAR = Object.freeze({
  height: 72,

  icon: ICON.lg,

  label: FONT.xs,
});

/* ===========================================================
   HAIRLINE
=========================================================== */

export const hairline =
  1 / PixelRatio.get();

/* ===========================================================
   TYPOGRAPHY
=========================================================== */

export const lineHeight = (
  fontSize: number,
  multiplier = 1.35
) =>
  round(fontSize * multiplier);


  /* ===========================================================
   BREAKPOINTS
=========================================================== */

export const BREAKPOINTS = Object.freeze({
  phone: 0,
  largePhone: 430,
  tablet: 600,
  largeTablet: 840,
});

/* ===========================================================
   LAYOUT
=========================================================== */

export const LAYOUT = Object.freeze({
  compact: SCREEN.width < BREAKPOINTS.largePhone,

  regular:
    SCREEN.width >= BREAKPOINTS.largePhone &&
    SCREEN.width < BREAKPOINTS.tablet,

  tablet:
    SCREEN.width >= BREAKPOINTS.tablet,

  largeTablet:
    SCREEN.width >= BREAKPOINTS.largeTablet,
});

/* ===========================================================
   MAX WIDTHS
=========================================================== */

export const MAX_WIDTH = Object.freeze({
  content: 1200,

  modal: DEVICE.isTablet ? 560 : CONTENT_WIDTH,

  sheet: DEVICE.isTablet ? 600 : CONTENT_WIDTH,

  drawer: DEVICE.isTablet ? 420 : SCREEN.width * 0.85,
});

/* ===========================================================
   PRODUCT GRID
=========================================================== */

export const PRODUCT = Object.freeze({
  columns:
    DEVICE.isTablet
      ? 3
      : 2,

  gap: GRID_GAP,

  cardWidth: productCardWidth,

  imageRatio: 1.35,
});

/* ===========================================================
   ANIMATION
=========================================================== */

export const ANIMATION = Object.freeze({
  fast: 150,

  normal: 250,

  slow: 350,

  extraSlow: 500,
});

/* ===========================================================
   ELEVATION
=========================================================== */

export const SHADOW = Object.freeze({
  xs: {
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    elevation: 1,
  },

  sm: {
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  md: {
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },

  lg: {
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 8,
  },
});

/* ===========================================================
   EXPORT
=========================================================== */

export default {
  DEVICE,
  SCREEN,

  FONT,
  ICON,
  BUTTON,
  SPACING,
  RADIUS,

  SAFE,
  FULL,

  HEADER,
  TABBAR,

  IMAGE,

  PRODUCT,

  CONTENT_WIDTH,
  productCardWidth,

  widthPercent,
  heightPercent,

  SCREEN_CENTER,

  BREAKPOINTS,
  LAYOUT,

  MAX_WIDTH,

  ANIMATION,

  SHADOW,

  hairline,

  lineHeight,
};