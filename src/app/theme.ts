import { createTheme, alpha } from "@mui/material/styles";
import type { TypographyOptions } from "@mui/material/styles/createTypography";
import background from "./img/bfbb.webp";

const fontFamily = "Slackey";

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
  allVariants: {
    textShadow: "0 8px 16px #cbd1b7, 0 -8px 16px #cbd1b7",
  },
};

export default createTheme({
  palette: {
    mode: "light",
    divider: "#ffffff3b",
    text: {
      primary: "#000",
    },
    primary: {
      main: "#362c57",
    },
    secondary: {
      main: "#9d92c3",
    },
    background: {
      paper: "#2eb5c0",
      default: "#51b3ba",
    },
  },
  typography,
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: `linear-gradient(to bottom, #2eb5c0 0%, #51b3ba 100%)`,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        // "@font-face": fontDefinition,
        body: {
          minHeight: "100vh",
          backgroundImage: `
            radial-gradient(#31bec600, #31bec655),
            linear-gradient(#4c88bd55, #d0c29355),
            url(${background})
          `,
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          backgroundPosition: "top center",
        },
        "::selection": {
          backgroundColor: "#f2d72b",
          color: "#3c3122",
        },
        label: {
          overflow: "visible !important",
        },
      },
    },
  },
});
