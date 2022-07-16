import { ReactNode, useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  CssBaseline,
  Divider,
  Drawer,
  Theme,
  ThemeProvider,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
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

  const theme = useTheme();
  const isMobile = useMediaQuery<Theme>(theme.breakpoints.down("md"));

  // TODO pagination if there are >200 results
  const offset = 0;
  const limit = 200;
  const { weapons, loading, error } = useWeapons();
  const { rows, total } = useWeaponTableRows({ weapons, offset, limit });

  console.log({ total });

  // Open the menu by default on large viewports. On mobile-sized viewports, the menu is an overlay
  // that partially covers the rest of the screen.
  const [menuOpenMobile, setMenuOpenMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true);
  const onMenuOpenChanged = useCallback(
    (open: boolean) => {
      if (isMobile) {
        setMenuOpenMobile(open);
      } else {
        setMenuOpen(open);
      }
    },
    [isMobile],
  );
  useEffect(() => {
    if (!isMobile) {
      setMenuOpenMobile(false);
    }
  }, [isMobile]);

  let mainContent: ReactNode;
  if (error) {
    mainContent = (
      <Alert severity="error" sx={{ my: 3 }}>
        Oops, something went wrong loading weapons ({error.message})
      </Alert>
    );
  } else {
    mainContent = (
      <WeaponTable
        rows={rows}
        placeholder={
          loading ? (
            <>
              <Typography variant="body1" align="center" sx={{ alignSelf: "end" }}>
                Loading weapon data
              </Typography>
              <Box display="grid" sx={{ alignSelf: "start", justifyContent: "center" }}>
                <CircularProgress />
              </Box>
            </>
          ) : (
            <Typography variant="body1" align="center" sx={{ alignSelf: "center" }}>
              No weapons match your selections
            </Typography>
          )
        }
        footer={
          total > limit ? (
            <Typography variant="body1" align="center" sx={{ alignSelf: "center" }}>
              {total} weapons match your selections - showing the first {limit}
            </Typography>
          ) : undefined
        }
      />
    );
  }

  const drawerContent = (
    <>
      <AffinityPicker />
      <WeaponTypePicker />
    </>
  );

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />

      <AppBar
        menuOpen={isMobile ? menuOpenMobile : menuOpen}
        onMenuOpenChanged={onMenuOpenChanged}
      />

      <Divider />

      <Box
        display="grid"
        sx={(theme) => ({
          p: 3,
          [theme.breakpoints.up("md")]: {
            gridTemplateColumns: menuOpen ? `300px 1fr` : "1fr",
            alignContent: "start",
            alignItems: "start",
            gap: 2,
          },
        })}
      >
        {menuOpen && (
          <Box
            display="grid"
            sx={(theme) => ({
              [theme.breakpoints.down("md")]: {
                display: "none",
              },
              gap: 2,
            })}
          >
            {drawerContent}
          </Box>
        )}

        <Drawer
          variant="temporary"
          open={menuOpenMobile}
          onClose={() => onMenuOpenChanged(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: "348px" },
          }}
        >
          <Toolbar />

          <Divider />

          <Box display="grid" sx={{ gap: 2, p: 3 }}>
            {drawerContent}
          </Box>
        </Drawer>

        <Box display="grid" sx={{ gap: 2 }}>
          <WeaponListSettings breakpoint={menuOpen ? "lg" : "md"} />

          {mainContent}

          <Footer />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
