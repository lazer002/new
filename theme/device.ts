import { Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

export const Device = {

  width,

  height,

  isSmallPhone: width < 360,

  isPhone: width >= 360 && width < 600,

  isTablet: width >= 600,

  isLargeTablet: width >= 900,

  isLandscape: width > height,

  isIOS: Platform.OS === "ios",

  isAndroid: Platform.OS === "android",

};