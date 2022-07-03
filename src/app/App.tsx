import { ReactNode } from "react";
import {
  Box,
  Container,
  CssBaseline,
  LinearProgress,
  ThemeProvider,
  Typography,
} from "@mui/material";
import WeaponListSettings from "./WeaponListSettings";
import SearchResults from "./SearchResults";
import { darkTheme, lightTheme } from "./theme";
import useWeapons from "./useWeapons";
import { AppStateProvider, useAppState } from "./AppState";
import WeaponListFilters from "./WeaponListFilters";

const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const { darkMode } = useAppState();
  return <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>{children}</ThemeProvider>;
};

const App = () => {
  const { weapons, loading, error } = useWeapons();
  return (
    <AppStateProvider>
      <AppThemeProvider>
        <CssBaseline />

        <Container
          maxWidth="xl"
          sx={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            alignContent: "start",
            alignItems: "start",
            gap: 2,
            py: 2,
            px: { xs: 0, lg: 3 },
          }}
        >
          <Box>
            <Typography variant="h5">
              Elden Ring Weapon
              <br />
              Attack Calculator
            </Typography>
          </Box>

          <WeaponListSettings />

          <WeaponListFilters />

          {loading ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              Loading weapon data...
              <LinearProgress sx={{ mt: 3 }} />
            </Box>
          ) : (
            !error && <SearchResults weapons={weapons} />
          )}
        </Container>
      </AppThemeProvider>
    </AppStateProvider>
  );
};

export default App;
