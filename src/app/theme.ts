import { createTheme, alpha } from "@mui/material/styles";
import type { TypographyOptions } from "@mui/material/styles/createTypography";
import backgroundStars from "./img/backgroundStars.webp";

const fontFamily = "Prompt";

const fontDefinition = [
  {
    fontFamily,
    fontStyle: "normal",
    fontWeight: 500,
    fontDisplay: "swap",
    src: `url(/prompt-v10-latin-medium.woff2) format("woff2")`,
  },
];

const typography: TypographyOptions = {
  fontFamily: `${fontFamily}, sans-serif`,
  h1: {
    fontSize: "1.0625rem",
    "@media (min-width: 600px)": {
      fontSize: "1.25rem",
    },
  },
  button: {
    textTransform: "none",
  },
  overline: {
    textTransform: "none",
  },
  fontWeightLight: 500,
  fontWeightRegular: 500,
  fontWeightMedium: 500,
  fontWeightBold: 500,
};

export default createTheme({
  palette: {
    mode: "dark",
    divider: "#ffffff3b",
    text: {
      primary: "#fff",
    },
    primary: {
      main: "#ffb452",
    },
    secondary: {
      main: "#cf8563",
    },
    background: {
      paper: "#353328",
      default: "#0e120e",
    },
  },
  typography,
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: `linear-gradient(to bottom, #624c2c 0%, #624c2c 100%)`,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        "@font-face": fontDefinition,
        body: {
          minHeight: "100vh",
          backgroundImage: `
            radial-gradient(
              circle at 50% 50%,
              ${alpha("#251b11", 0)} 0%,
              ${alpha("#251b11", 0)} 60%,
              ${alpha("#251b11", 0.2)} 80%,
              ${alpha("#251b11", 0.6)} 100%
            ),
            linear-gradient(
              to right,
              ${alpha("#402f25", 0.3)} 0%,
              ${alpha("#402f25", 0)} 20%,
              ${alpha("#402f25", 0)} 80%,
              ${alpha("#402f25", 0.3)} 100%
              ),
            url(${backgroundStars}),
            linear-gradient(
              to top,
              #120a04 0%,
              #2e1f15 40%,
              #43342a 80%,
              #4c432f 100%
            )`,
          backgroundAttachment: "fixed",
        },
        "::selection": {
          backgroundColor: "#ffb452",
          color: "#3c3122",
        },
      },
    },
  },
});
