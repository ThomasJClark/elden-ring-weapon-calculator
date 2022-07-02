import { createContext, useState } from "react";
import { Box, Container, CssBaseline, LinearProgress, ThemeProvider } from "@mui/material";
import { Affinity, Attributes, WeaponType } from "../calculator/calculator";
import WeaponListSettings from "./WeaponListSettings";
import SearchResults from "./SearchResults";
import { darkTheme, lightTheme } from "./theme";
import useWeapons from "./useWeapons";

interface AppState {
  readonly darkMode: boolean;
  readonly attributes: Attributes;
  readonly twoHanding: boolean;
  readonly upgradeLevel: number;
  readonly weaponTypes: readonly WeaponType[];
  readonly affinities: readonly Affinity[];
  readonly maxWeight: number;
  readonly effectiveWithCurrentAttributes: boolean;
}

const defaultAppState: AppState = {
  darkMode: true,
  attributes: {
    str: 30,
    dex: 30,
    int: 30,
    fai: 30,
    arc: 30,
  },
  twoHanding: false,
  upgradeLevel: 25,
  weaponTypes: [],
  affinities: [],
  maxWeight: 30,
  effectiveWithCurrentAttributes: false,
};

const AppContext = createContext<[AppState, (appState: Partial<AppState>) => void]>([
  defaultAppState,
  () => {},
]);

const App = () => {
  const { weapons, loading, error } = useWeapons();
  const [darkMode, setDarkMode] = useState(true);
  const [attributes, setAttributes] = useState({ str: 30, dex: 30, int: 30, fai: 30, arc: 30 });
  const [twoHanding, setTwoHanding] = useState(false);
  const [upgradeLevel, setUpgradeLevel] = useState(25);
  const [weaponTypes] = useState<readonly WeaponType[]>(["Halberd"]);
  const [affinities] = useState<readonly Affinity[]>(["None", "Heavy"]);
  const [maxWeight, setMaxWeight] = useState(8);
  const [effectiveWithCurrentAttributes, setEffectiveWithCurrentAttributes] = useState(false);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />

      <Box
        sx={{
          backgroundColor: (theme) => theme.palette.background.paper,
          borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
        }}
      >
        <WeaponListSettings
          darkMode={darkMode}
          attributes={attributes}
          twoHanding={twoHanding}
          upgradeLevel={upgradeLevel}
          maxWeight={maxWeight}
          effectiveWithCurrentAttributes={effectiveWithCurrentAttributes}
          onDarkModeChanged={setDarkMode}
          onAttributesChanged={setAttributes}
          onTwoHandingChanged={setTwoHanding}
          onUpgradeLevelChanged={setUpgradeLevel}
          onMaxWeightChanged={setMaxWeight}
          onEffectiveWithCurrentAttributesChanged={setEffectiveWithCurrentAttributes}
        />
      </Box>

      {loading && (
        <Container
          sx={{
            py: 6,
            textAlign: "center",
          }}
        >
          Loading weapon data...
          <LinearProgress sx={{ mt: 3 }} />
        </Container>
      )}

      {!loading && !error && (
        <SearchResults
          weapons={weapons}
          attributes={attributes}
          twoHanding={twoHanding}
          upgradeLevel={upgradeLevel}
          weaponTypes={weaponTypes}
          affinities={affinities}
          maxWeight={maxWeight}
          effectiveWithCurrentAttributes={effectiveWithCurrentAttributes}
        />
      )}
    </ThemeProvider>
  );
};

export default App;
