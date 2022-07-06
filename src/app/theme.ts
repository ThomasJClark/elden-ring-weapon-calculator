import { createTheme, alpha } from "@mui/material/styles";
import { OverridesStyleRules } from "@mui/material/styles/overrides";
import { GridClasses, DataGridProps } from "@mui/x-data-grid";

declare module "@mui/material/styles/components" {
  export interface Components {
    MuiDataGrid?: {
      defaultProps?: Partial<DataGridProps>;
      styleOverrides?: Partial<OverridesStyleRules<keyof GridClasses>>;
    };
  }
}

const backgroundPaperDark = "#121617";

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
      paper: backgroundPaperDark,
      default: "#0e120e",
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
          minHeight: "100vh",
          background: `
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
              linear-gradient(
                to bottom,
                #0c0c09 0%,
                #1f1d17 40%,
                #353328 60%,
                #454536 75%,
                #4d4d3d 80%,
                #59584a 85%,
                #4d4d3d 90%,
                #3a3a30 95%,
                #2f2f28 100%
                )
                `,
          backgroundAttachment: "fixed",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "9999px",
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(backgroundPaperDark, 0),
          borderColor: "#655e46",
        },
        cell: {
          borderColor: "#655e46",
        },
        footerContainer: {
          borderColor: "#655e46",
        },
        columnHeaders: {
          borderColor: "#655e46",
          userSelect: "none",
        },
        columnSeparator: {
          display: "none",
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
          minHeight: "100vh",
          background: `
            radial-gradient(
              circle at 50% 50%,
              ${alpha("#59584a", 0)} 0%,
              ${alpha("#59584a", 0)} 60%,
              ${alpha("#59584a", 0.05)} 80%,
              ${alpha("#59584a", 0.1)} 100%
            ),
            linear-gradient(
              to right,
              ${alpha("#3a3a30", 0.05)} 0%,
              ${alpha("#3a3a30", 0)} 10%,
              ${alpha("#3a3a30", 0)} 90%,
              ${alpha("#3a3a30", 0.05)} 100%
            ),
            linear-gradient(
              to bottom,
              #f7f7f5 0%,
              #f7f7f5 60%,
              #f3f3df 80%,
              #fdfadf 85%,
              #f3f3df 90%,
              #edece0 95%,
              #e8e8df 100%
            )
          `,
          backgroundAttachment: "fixed",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "9999px",
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          backgroundColor: alpha("#fff", 0.25),
          borderColor: "#aaa89b",
        },
        cell: {
          borderColor: "#aaa89b",
        },
        footerContainer: {
          borderColor: "#aaa89b",
        },
        columnHeaders: {
          borderColor: "#aaa89b",
          userSelect: "none",
        },
        columnSeparator: {
          display: "none",
        },
      },
    },
  },
});
