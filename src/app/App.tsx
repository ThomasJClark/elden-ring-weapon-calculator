import { ReactNode, useState } from "react";
import {
  Box,
  Button,
  CssBaseline,
  Divider,
  LinearProgress,
  Link,
  ThemeProvider,
  Typography,
} from "@mui/material";
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
            py: 3,
            px: { xs: 0, lg: 3 },
          }}
        >
          {menuOpen && (
            <Box display="grid" sx={{ gap: 2 }}>
              <AffinityPicker />

              <WeaponTypePicker />
            </Box>
          )}

          <Box display="grid" sx={{ gap: 2 }}>
            <WeaponListSettings />

            {loading && (
              <Box sx={{ py: 6, textAlign: "center" }}>
                Loading weapon data...
                <LinearProgress sx={{ mt: 3 }} />
              </Box>
            )}

            {!loading && !error && <SearchResults weapons={weapons} />}

            <Typography variant="body1" align="center">
              Made by Tom Clark (
              <Link
                href="https://twitter.com/thechewanater"
                target="_blank"
                rel="noopener noreferer"
              >
                @thechewanater
              </Link>
              ). DM me with bug reports or suggestions.
              <br />
              Weapon data gathered by{" "}
              <Link
                href="https://www.reddit.com/user/TarnishedSpreadsheet/"
                target="_blank"
                rel="noopener noreferer"
              >
                /u/TarnishedSpreadsheet
              </Link>{" "}
              on Reddit.
              <br />
              Inspired by{" "}
              <Link
                href="https://soulsplanner.com/darksouls/weaponatk"
                target="_blank"
                rel="noopener noreferer"
              >
                Dark Souls Weapons Attack Calculator
              </Link>
              .
              <br />
              Elden Ring is a trademark of FromSoftware and Bandai Namco Entertainment.
            </Typography>
          </Box>
        </Box>
      </AppThemeProvider>
    </AppStateProvider>
  );
};

export default App;
