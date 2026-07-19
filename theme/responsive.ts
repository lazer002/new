import { Dimensions, PixelRatio } from "react-native";

/* ===========================================================
   SCREEN
=========================================================== */

const { width, height } = Dimensions.get("window");
console.log(Dimensions.get("window"));
/* ===========================================================
   BASE DESIGN (FIGMA)
=========================================================== */

const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

/* ===========================================================
   DEVICE
=========================================================== */

const shortSide = Math.min(width, height);
const longSide = Math.max(width, height);

export const DEVICE = {
  width,
  height,

  shortSide,
  longSide,

  isLandscape: width > height,

  isTablet: shortSide >= 600,

  bucket:
    shortSide < 330 ? 320 :
    shortSide < 348 ? 340 :
    shortSide < 356 ? 350 :
    shortSide < 366 ? 360 :
    shortSide < 384 ? 375 :
    shortSide < 398 ? 390 :
    shortSide < 408 ? 400 :
    shortSide < 420 ? 412 :
    shortSide < 432 ? 430 :
    shortSide < 480 ? 450 :
    shortSide < 600 ? 500 :
    shortSide < 720 ? 600 :
    shortSide < 840 ? 720 :
    shortSide < 960 ? 840 :
    960,
};

/* ===========================================================
   SCREEN INFO
=========================================================== */
export const isSmallDevice =
  DEVICE.shortSide < 360;

export const isLargePhone =
  DEVICE.shortSide >= 430;


export const SCREEN = {
  width,
  height,

  shortSide,
  longSide,

  isLandscape: DEVICE.isLandscape,
  isTablet: DEVICE.isTablet,

  aspectRatio: height / width,

  pixelRatio: PixelRatio.get(),

  fontScale: PixelRatio.getFontScale(),
};;

/* ===========================================================
   SCALE VALUES
=========================================================== */

const widthRatio = width / BASE_WIDTH;

const heightRatio = height / BASE_HEIGHT;

/**
 * Uses the smaller ratio to avoid oversized UI
 * on tall phones.
 */
const responsiveRatio = Math.min(
  widthRatio,
  heightRatio
);

/* ===========================================================
   HELPERS
=========================================================== */

const round = (value: number) =>
  PixelRatio.roundToNearestPixel(value);

const clamp = (
  value: number,
  min: number,
  max: number
) => Math.min(max, Math.max(min, value));

/* ===========================================================
   WIDTH
=========================================================== */

export const scaleWidth = (
  size: number
) => round(size * widthRatio);

/* ===========================================================
   HEIGHT
=========================================================== */

export const scaleHeight = (
  size: number
) => round(size * heightRatio);

/* ===========================================================
   UNIVERSAL SCALE
=========================================================== */

/**
 * General responsive scaling.
 *
 * factor
 * 0   = no scaling
 * 0.5 = moderate scaling
 * 1   = full scaling
 */

export const scale = (
  size: number,
  factor = 0.5
) => {

  const scaled =
    size * responsiveRatio;

  return round(
    size +
      (scaled - size) *
        factor
  );
};

/* ===========================================================
   FONT
=========================================================== */

/**
 * Responsive font.
 *
 * factor
 * 0.35 = recommended
 */

export const scaleFont = (
  size: number,
  factor = 0.35
) => {

  const scaled = scale(size, factor);

  return round(
  clamp(
    scaled,
    size * 0.88,
    size * 1.20
  )
)
};

/* ===========================================================
   SPACING
=========================================================== */

export const scaleSpacing = (
  size: number
) => scale(size, 0.55);


export const SPACING = Object.freeze({
  xs: scaleSpacing(4),
  sm: scaleSpacing(8),
  md: scaleSpacing(12),
  lg: scaleSpacing(16),
  xl: scaleSpacing(20),
  xxl: scaleSpacing(24),
  xxxl: scaleSpacing(32),
});
/* ===========================================================
   BORDER RADIUS
=========================================================== */

export const scaleRadius = (
  size: number
) =>   round(scale(size, 0.30))

export const RADIUS = Object.freeze({
  sm: scaleRadius(8),
  md: scaleRadius(12),
  lg: scaleRadius(16),
  xl: scaleRadius(20),
  pill: scaleRadius(999),
});

/* ===========================================================
   BUTTON
=========================================================== */

/**
 * Never smaller than 44dp
 */

export const scaleButton = (
  size: number
) =>
  round(
    clamp(
      scale(size, 0.45),
      44,
      size + 8
    )
  );

/* ===========================================================
   ICON
=========================================================== */

export const scaleIcon = (
  size: number
) =>
      round(
  clamp(
    scale(size, 0.40),
    size - 2,
    size + 4
  )
  )

/* ===========================================================
   AVATAR
=========================================================== */

export const scaleAvatar = (
  size: number
) =>
  round(
  clamp(
    scale(size, 0.55),
    size - 4,
    size + 12
  )
  )

/* ===========================================================
   LINE HEIGHT
=========================================================== */

export const lineHeight = (
  fontSize: number,
  multiplier = 1.35
) =>
  round(
    scaleFont(fontSize) *
      multiplier
  );

/* ===========================================================
   WIDTH %
=========================================================== */

export const widthPercent = (
  percent: number
) =>
  round(
    (width * percent) / 100
  );

/* ===========================================================
   HEIGHT %
=========================================================== */

export const heightPercent = (
  percent: number
) =>
  round(
    (height * percent) / 100
  );

/* ===========================================================
   SAFE AREA HELPERS
=========================================================== */

export const SAFE = Object.freeze({
  horizontal: scaleSpacing(20),
  vertical: scaleSpacing(24),
});
/* ===========================================================
   GRID HELPERS
=========================================================== */

export const CONTENT_WIDTH =
  SCREEN.width - SAFE.horizontal * 2;


export const SCREEN_CENTER = Object.freeze({
  x: SCREEN.width / 2,
  y: SCREEN.height / 2,
});

export const FULL = Object.freeze({
  width: widthPercent(100),
  height: heightPercent(100),
});
/**
 * Product Grid
 */

export const PRODUCT_COLUMNS =
  SCREEN.isTablet
    ? 3
    : 2;

/**
 * Default card spacing
 */

export const GRID_GAP =
  scaleSpacing(16);

/**
 * Card width
 */

export const productCardWidth = round(
(
    SCREEN.width -
    SAFE.horizontal * 2 -
    GRID_GAP * (PRODUCT_COLUMNS - 1)
) / PRODUCT_COLUMNS
);

/* ===========================================================
   HAIRLINE
=========================================================== */

export const hairline =
  1 / PixelRatio.get();