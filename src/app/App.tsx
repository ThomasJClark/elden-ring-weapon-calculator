import { ReactNode, useState } from "react";
import {
  Alert,
  Box,
  CssBaseline,
  Divider,
  LinearProgress,
  ThemeProvider,
  Typography,
} from "@mui/material";
import WeaponListSettings from "./WeaponListSettings";
import WeaponTable from "./weaponTable/WeaponTable";
import useWeaponTableRows from "./weaponTable/useWeaponTableRows";
import { darkTheme, lightTheme } from "./theme";
import useWeapons from "./useWeapons";
import { useAppState } from "./AppState";
import AppBar from "./AppBar";
import WeaponTypePicker from "./WeaponTypePicker";
import AffinityPicker from "./AffinityPicker";
import Footer from "./Footer";

const App = () => {
  const { darkMode } = useAppState();
  const { weapons, loading, error } = useWeapons();
  const weaponTableRows = useWeaponTableRows(weapons);
  const [menuOpen, setMenuOpen] = useState(true);

  let mainContent: ReactNode;
  if (loading) {
    mainContent = (
      <Box sx={{ py: 6 }}>
        <Typography variant="body1" align="center">
          Loading weapon data...
        </Typography>
        <LinearProgress sx={{ mt: 3 }} />
      </Box>
    );
  } else if (error) {
    mainContent = (
      <Alert severity="error" sx={{ my: 3 }}>
        Oops, something went wrong loading weapons ({error.message})
      </Alert>
    );
  } else if (weaponTableRows.length === 0) {
    mainContent = (
      <Alert severity="info" sx={{ my: 3 }}>
        No weapons match your filters.
      </Alert>
    );
  } else {
    mainContent = <WeaponTable rows={weaponTableRows} />;
  }

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
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
          p: 3,
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

          {mainContent}

          <Footer />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
