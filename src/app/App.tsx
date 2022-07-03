import { ReactNode } from "react";
import { Container, CssBaseline, LinearProgress, ThemeProvider } from "@mui/material";
import WeaponListSettings from "./WeaponListSettings";
import SearchResults from "./SearchResults";
import { darkTheme, lightTheme } from "./theme";
import useWeapons from "./useWeapons";
import { AppStateProvider, useAppState } from "./AppState";

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

        <WeaponListSettings />

        {loading && (
          <Container sx={{ py: 6, textAlign: "center" }}>
            Loading weapon data...
            <LinearProgress sx={{ mt: 3 }} />
          </Container>
        )}

        {!loading && !error && <SearchResults weapons={weapons} />}
      </AppThemeProvider>
    </AppStateProvider>
  );
};

export default App;
