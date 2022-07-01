import { useState } from "react";
import { CssBaseline, FormControlLabel, Switch, ThemeProvider } from "@mui/material";
import { Affinity, WeaponType } from "../calculator/calculator";
import SearchScreen from "./SearchScreen";
import { darkTheme, lightTheme } from "./theme";
import useWeapons from "./useWeapons";

const App = () => {
  const weapons = useWeapons();
  const [darkMode, setDarkMode] = useState(true);
  const [attributes, setAttributes] = useState({ str: 30, dex: 30, int: 30, fai: 30, arc: 30 });
  const [twoHanding, setTwoHanding] = useState(false);
  const [upgradeLevel, setUpgradeLevel] = useState(25);
  const [weaponTypes, setWeaponTypes] = useState<readonly WeaponType[]>(["Halberd"]);
  const [affinities, setAffinities] = useState<readonly Affinity[]>(["None", "Heavy"]);
  const [maxWeight, setMaxWeight] = useState(8);
  const [effectiveWithCurrentAttributes, setEffectiveWithCurrentAttributes] = useState(false);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <SearchScreen
        darkMode={darkMode}
        weapons={weapons}
        attributes={attributes}
        twoHanding={twoHanding}
        upgradeLevel={upgradeLevel}
        weaponTypes={weaponTypes}
        affinities={affinities}
        maxWeight={maxWeight}
        effectiveWithCurrentAttributes={effectiveWithCurrentAttributes}
        onDarkModeChanged={setDarkMode}
        onAttributesChanged={setAttributes}
        onTwoHandingChanged={setTwoHanding}
        onUpgradeLevelChanged={setUpgradeLevel}
        onWeaponTypesChanged={setWeaponTypes}
        onAffinitiesChanged={setAffinities}
        onMaxWeightChanged={setMaxWeight}
        onEffectiveWithCurrentAttributesChanged={setEffectiveWithCurrentAttributes}
      />
    </ThemeProvider>
  );
};

export default App;
