export const theme = {
colors: {
  primary: "#B6FF2E",
  black: "#111111",
  white: "#FFFFFF",

  background: "#FAFAFA",
  surface: "#e6e6e66b",

  text: "#111111",
  textSecondary: "#777777",
  textMuted: "#9A9A9A",

  success: "#2E7D32",
  danger: "#E53935",

  overlay: "rgba(0,0,0,.55)",
  glass: "rgba(255,255,255,.15)",
},
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 40,
  },

  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 999,
  },

  typography: {
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,

    h6: 22,
    h5: 24,
    h4: 28,
    h3: 32,
    h2: 36,
    h1: 42,

    display: 52,
  },

  icon: {
    xs: 14,
    sm: 18,
    md: 22,
    lg: 26,
    xl: 30,
  },

  shadow: {
    sm: {
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },

    md: {
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },

    lg: {
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
  },

layout: {
  headerButton: 52,
  iconButton: 46,
  iconButtonLg: 50,
  filterButton: 46,
  pillHeight: 38,
  searchHeight: 63,
  onlineDot: 10,
},
fontWeight: {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
  black: "900" as const,
},
  
};