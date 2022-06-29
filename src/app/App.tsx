import { useState } from "react";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { Affinity, WeaponType } from "../calculator/calculator";
import SearchScreen from "./SearchScreen";
import theme from "./theme";
import useWeapons from "./useWeapons";
import backgroundXs from "./backgroundXs.webp";
import backgroundSm from "./backgroundSm.webp";
import backgroundMd from "./backgroundMd.webp";
import backgroundLg from "./backgroundLg.webp";
import backgroundXl from "./backgroundXl.webp";

const App = () => {
  const weapons = useWeapons();
  const [attributes, setAttributes] = useState({ str: 30, dex: 30, int: 30, fai: 30, arc: 30 });
  const [twoHanding, setTwoHanding] = useState(false);
  const [upgradeLevel, setUpgradeLevel] = useState(25);
  const [weaponTypes, setWeaponTypes] = useState<readonly WeaponType[]>(["Halberd"]);
  const [affinities, setAffinities] = useState<readonly Affinity[]>(["None", "Heavy"]);
  const [maxWeight, setMaxWeight] = useState(8);
  const [effectiveWithCurrentAttributes, setEffectiveWithCurrentAttributes] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: (theme) => theme.palette.background.paper,
          backgroundImage: {
            xs: `url(${backgroundXs})`,
            sm: `url(${backgroundSm})`,
            md: `url(${backgroundMd})`,
            lg: `url(${backgroundLg})`,
            xl: `url(${backgroundXl})`,
          },
          backgroundPosition: "center top",
          backgroundSize: "100% auto",
          backgroundRepeat: `no-repeat`,
        }}
      >
        <SearchScreen
          weapons={weapons}
          attributes={attributes}
          twoHanding={twoHanding}
          upgradeLevel={upgradeLevel}
          weaponTypes={weaponTypes}
          affinities={affinities}
          maxWeight={maxWeight}
          effectiveWithCurrentAttributes={effectiveWithCurrentAttributes}
          onAttributesChanged={setAttributes}
          onTwoHandingChanged={setTwoHanding}
          onUpgradeLevelChanged={setUpgradeLevel}
          onWeaponTypesChanged={setWeaponTypes}
          onAffinitiesChanged={setAffinities}
          onMaxWeightChanged={setMaxWeight}
          onEffectiveWithCurrentAttributesChanged={setEffectiveWithCurrentAttributes}
        />
      </Box>
    </ThemeProvider>
  );
};

export default App;
