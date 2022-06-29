import createTheme from "@mui/material/styles/createTheme";
import { alpha } from "@mui/system";

declare module "@mui/material/styles/components" {
  export interface Components {
    MuiDataGrid?: Components["MuiTable"];
  }
}

const primaryMain = "#f5bd63";
const secondaryMain = "#cf8563";
const backgroundPaper = alpha("#121617", 0.9);
const backgroundDefault = "#0e120e";

export default createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: primaryMain,
    },
    secondary: {
      main: secondaryMain,
    },
    background: {
      paper: backgroundPaper,
      default: backgroundDefault,
    },
  },
  typography: {
    fontFamily: "Prompt, sans-serif",
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          backgroundColor: backgroundPaper,
        },
      },
    },
  },
});
