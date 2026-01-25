export const theme = {
  colors: {
    bg: "#fff7fb",
    surface: "rgba(255, 255, 255, 0.86)",
    text: "#0f172a",
    mutedText: "#475569",
    border: "#eadfe7",
    primary: "#9d174d",
    primaryHover: "#831843",
    danger: "#b91c1c",
    pinkSurface: "#fff0f7",
    greenSurface: "#ecfdf5",
    pinkBorder: "#f8b4d9",
    greenBorder: "#86efac",
  },
  radius: {
    sm: "10px",
    md: "14px",
    lg: "18px",
  },
  shadow: {
    sm: "0 1px 2px rgba(15, 23, 42, 0.06)",
    md: "0 10px 22px rgba(15, 23, 42, 0.10)",
  },
  layout: {
    maxWidth: "1120px",
  },
} as const;

export type AppTheme = typeof theme;
