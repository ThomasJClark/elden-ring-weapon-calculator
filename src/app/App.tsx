import { ReactNode } from "react";
import {
  Box,
  Container,
  CssBaseline,
  FormControlLabel,
  LinearProgress,
  Switch,
  ThemeProvider,
  Typography,
} from "@mui/material";
import WeaponListSettings from "./WeaponListSettings";
import SearchResults from "./SearchResults";
import { darkTheme, lightTheme } from "./theme";
import useWeapons from "./useWeapons";
import { AppStateProvider, useAppState } from "./AppState";
import WeaponTypePicker from "./WeaponTypePicker";
import AffinityPicker from "./AffinityPicker";

const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const { darkMode } = useAppState();
  return <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>{children}</ThemeProvider>;
};

const DarkModeToggle = () => {
  const { darkMode, setDarkMode } = useAppState();
  return (
    <Box>
      <Typography component="h2" variant="h6" sx={{ mb: 1 }}>
        Appearance
      </Typography>
      <FormControlLabel
        label="Dark Mode"
        control={
          <Switch checked={darkMode} onChange={(evt) => setDarkMode(evt.currentTarget.checked)} />
        }
      />
    </Box>
  );
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
          <Box display="grid" sx={{ gap: 2 }}>
            <Typography component="h1" variant="h5">
              Elden Ring Weapon
              <br />
              Attack Calculator
            </Typography>

            <AffinityPicker />

            <WeaponTypePicker />

            <DarkModeToggle />
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
        </Container>
      </AppThemeProvider>
    </AppStateProvider>
  );
};

export default App;
