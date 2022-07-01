import { createTheme } from "@mui/material/styles";
import { alpha } from "@mui/system";
import backgroundDark600 from "./img/backgroundDark600.webp";
import backgroundDark900 from "./img/backgroundDark900.webp";
import backgroundDark1200 from "./img/backgroundDark1200.webp";
import backgroundDark1536 from "./img/backgroundDark1536.webp";
import backgroundDark1920 from "./img/backgroundDark1920.webp";
import backgroundLight600 from "./img/backgroundLight600.webp";
import backgroundLight900 from "./img/backgroundLight900.webp";
import backgroundLight1200 from "./img/backgroundLight1200.webp";
import backgroundLight1536 from "./img/backgroundLight1536.webp";
import backgroundLight1920 from "./img/backgroundLight1920.webp";

declare module "@mui/material/styles/components" {
  export interface Components {
    MuiDataGrid?: Components["MuiTable"];
  }
}

const primaryMainDark = "#f5bd63";
const secondaryMainDark = "#cf8563";
const backgroundPaperDark = alpha("#121617", 0.9);
const backgroundDefaultDark = "#0e120e";

const primaryMainLight = "#895602";
const secondaryMainLight = "#cf8563";
const backgroundPaperLight = alpha("#ffffff", 0.75);
const backgroundDefaultLight = "#edf0f2";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: primaryMainDark,
    },
    secondary: {
      main: secondaryMainDark,
    },
    background: {
      paper: backgroundPaperDark,
      default: backgroundDefaultDark,
    },
  },
  typography: {
    fontFamily: "Prompt, sans-serif",
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: alpha(backgroundPaperDark, 1),
          backgroundPosition: "center top",
          backgroundSize: "auto",
          backgroundRepeat: `no-repeat`,
          backgroundImage: `url(${backgroundDark600})`,
          "@media(min-width: 601px)": {
            backgroundImage: `url(${backgroundDark900})`,
          },
          "@media(min-width: 901px)": {
            backgroundImage: `url(${backgroundDark1200})`,
          },
          "@media(min-width: 1201px)": {
            backgroundImage: `url(${backgroundDark1536})`,
          },
          "@media(min-width: 1537px)": {
            backgroundImage: `url(${backgroundDark1920})`,
          },
          "@media(min-width: 1920px)": {
            backgroundSize: "100% auto",
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          backgroundColor: backgroundPaperDark,
        },
      },
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: primaryMainLight,
    },
    secondary: {
      main: secondaryMainLight,
    },
    background: {
      paper: backgroundPaperLight,
      default: backgroundDefaultLight,
    },
  },
  typography: {
    fontFamily: "Prompt, sans-serif",
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: alpha(backgroundPaperLight, 1),
          backgroundPosition: "center top",
          backgroundSize: "auto",
          backgroundRepeat: `no-repeat`,
          backgroundImage: `url(${backgroundLight600})`,
          "@media(min-width: 601px)": {
            backgroundImage: `url(${backgroundLight900})`,
          },
          "@media(min-width: 901px)": {
            backgroundImage: `url(${backgroundLight1200})`,
          },
          "@media(min-width: 1201px)": {
            backgroundImage: `url(${backgroundLight1536})`,
          },
          "@media(min-width: 1537px)": {
            backgroundImage: `url(${backgroundLight1920})`,
          },
          "@media(min-width: 1920px)": {
            backgroundSize: "100% auto",
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          backgroundColor: backgroundPaperLight,
        },
      },
    },
  },
});
