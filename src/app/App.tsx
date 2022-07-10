import { ReactNode, useState } from "react";
import { Box, CssBaseline, Divider, LinearProgress, ThemeProvider } from "@mui/material";
import WeaponListSettings from "./WeaponListSettings";
import SearchResults from "./SearchResults";
import { darkTheme, lightTheme } from "./theme";
import useWeapons from "./useWeapons";
import { AppStateProvider, useAppState } from "./AppState";
import AppBar from "./AppBar";
import WeaponTypePicker from "./WeaponTypePicker";
import AffinityPicker from "./AffinityPicker";

const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const { darkMode } = useAppState();
  return <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>{children}</ThemeProvider>;
};

const App = () => {
  const { weapons, loading, error } = useWeapons();

  const [menuOpen, setMenuOpen] = useState(true);

  return (
    <AppStateProvider>
      <AppThemeProvider>
        <CssBaseline />

        <AppBar menuOpen={menuOpen} onMenuOpenChanged={setMenuOpen} />

        <Divider />

        <Box
          display="grid"
          sx={{
            gridTemplateColumns: menuOpen ? "300px 1fr" : "1fr",
            alignContent: "start",
            alignItems: "start",
            gap: 2,
            py: 2,
            px: { xs: 0, lg: 3 },
          }}
        >
          <Box display={menuOpen ? "grid" : "none"} sx={{ gap: 2 }}>
            <AffinityPicker />

            <WeaponTypePicker />
          </Box>
          <Box>
            <WeaponListSettings />

            {loading ? (
              <Box sx={{ py: 6, textAlign: "center" }}>
                Loading weapon data...
                <LinearProgress sx={{ mt: 3 }} />
              </Box>
            ) : (
              !error && <SearchResults weapons={weapons} />
            )}
          </Box>
        </Box>
      </AppThemeProvider>
    </AppStateProvider>
  );
};

export default App;
