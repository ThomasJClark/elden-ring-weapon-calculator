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

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    divider: "#5c5c50",
    text: {
      primary: "#f2f2f2",
    },
    primary: {
      main: "#f5bd63",
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
          backgroundImage: `
            linear-gradient(
              to bottom,
              #59584a 0%,
              #4d4d3d 100%
            )`,
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
              ${alpha("#1f1d17", 0)} 0%,
              ${alpha("#1f1d17", 0)} 60%,
              ${alpha("#1f1d17", 0.2)} 80%,
              ${alpha("#1f1d17", 0.6)} 100%
            ),
            linear-gradient(
              to right,
              ${alpha("#3a3a30", 0.3)} 0%,
              ${alpha("#3a3a30", 0)} 20%,
              ${alpha("#3a3a30", 0)} 80%,
              ${alpha("#3a3a30", 0.3)} 100%
              ),
            url(${backgroundStars}),
            linear-gradient(
              to top,
              #0c0c09 0%,
              #1f1d17 40%,
              #353328 80%,
              #454536 100%
            )`,
          backgroundAttachment: "fixed",
        },
        "::selection": {
          backgroundColor: "#f5bd63",
          color: "#454536",
        },
      },
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    text: {
      primary: "#111",
    },
    primary: {
      main: "#895602",
    },
    secondary: {
      main: "#cf8563",
    },
    background: {
      default: "#edf0f2",
    },
  },
  typography,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "@font-face": fontDefinition,
        body: {
          minHeight: "100vh",
          background: "#fff",
        },
      },
    },
  },
});
