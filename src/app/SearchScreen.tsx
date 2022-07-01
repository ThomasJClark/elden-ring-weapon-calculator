import { useRef, useState } from "react";
import {
  Box,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from "@mui/material";
import getWeaponAttack, {
  adjustAttributesForTwoHanding,
  Affinity,
  allAttributes,
  Attributes,
  maxRegularUpgradeLevel,
  Weapon,
  WeaponType,
} from "../calculator/calculator";
import filterWeapons, { toSpecialUpgradeLevel } from "../search/filterWeapons";
import WeaponTable, { WeaponTableRow } from "./WeaponTable";
import { getAttributeLabel } from "./uiUtils";

/* eslint-disable react-hooks/exhaustive-deps */
function useMemoThrottled<T>(factory: () => T, timeoutMs: number, dependencies: unknown[]): T {
  const [, update] = useState(0);
  const value = useRef<T>();
  const lastEvaluateTimeMs = useRef(0);
  const timeoutHandle = useRef<NodeJS.Timeout>();
  const lastDependencies = useRef<unknown[]>();

  if (
    lastDependencies.current === undefined ||
    lastDependencies.current.length !== dependencies.length ||
    lastDependencies.current.some((value, index) => value !== dependencies[index])
  ) {
    lastDependencies.current = dependencies;

    const currentTimeMs = Date.now();
    const nextEvaluateTimeMs = lastEvaluateTimeMs.current + timeoutMs;

    if (currentTimeMs > nextEvaluateTimeMs) {
      lastEvaluateTimeMs.current = currentTimeMs;
      value.current = factory();
    } else {
      clearTimeout(timeoutHandle.current);
      timeoutHandle.current = setTimeout(() => {
        lastEvaluateTimeMs.current = nextEvaluateTimeMs;
        value.current = factory();
        update((prev) => prev + 1);
      }, nextEvaluateTimeMs - currentTimeMs);
    }
  }

  if (value.current === undefined) {
    value.current = factory();
  }

  return value.current!;
}
/* eslint-enable react-hooks/exhaustive-deps */

interface Props {
  darkMode: boolean;
  weapons: Map<string, Weapon>;
  attributes: Attributes;
  twoHanding: boolean;
  upgradeLevel: number;
  weaponTypes: readonly WeaponType[];
  affinities: readonly Affinity[];
  maxWeight: number;
  effectiveWithCurrentAttributes: boolean;
  onDarkModeChanged(darkMode: boolean): void;
  onAttributesChanged(attributes: Attributes): void;
  onTwoHandingChanged(twoHanding: boolean): void;
  onUpgradeLevelChanged(upgradeLevel: number): void;
  onWeaponTypesChanged(weaponTypes: readonly WeaponType[]): void;
  onAffinitiesChanged(affinities: readonly Affinity[]): void;
  onMaxWeightChanged(maxWeight: number): void;
  onEffectiveWithCurrentAttributesChanged(effectiveWithCurrentAttributes: boolean): void;
}

/**
 * The main screen of the app. Filters and sorts the weapon list and displays attack rating,
 * requirements, etc. in a table.
 */
const SearchScreen = ({
  darkMode,
  weapons,
  attributes,
  twoHanding,
  upgradeLevel,
  weaponTypes,
  affinities,
  maxWeight,
  effectiveWithCurrentAttributes,
  onDarkModeChanged,
  onAttributesChanged,
  onTwoHandingChanged,
  onUpgradeLevelChanged,
  // onWeaponTypesChanged,
  // onAffinitiesChanged,
  onMaxWeightChanged,
  onEffectiveWithCurrentAttributesChanged,
}: Props) => {
  const weaponTableRows = useMemoThrottled<WeaponTableRow[]>(
    () => {
      // Apply the two handing bonus if selected
      const adjustedAttributes = twoHanding
        ? adjustAttributesForTwoHanding(attributes)
        : attributes;

      const filteredWeapons = filterWeapons(weapons.values(), {
        upgradeLevel,
        weaponTypes,
        affinities,
        maxWeight,
        effectiveWithAttributes: effectiveWithCurrentAttributes ? adjustedAttributes : undefined,
      });

      return filteredWeapons.map((weapon) => [
        weapon,
        getWeaponAttack({ weapon, attributes: adjustedAttributes }),
      ]);
    },
    100,
    [
      attributes,
      twoHanding,
      weapons,
      upgradeLevel,
      weaponTypes,
      affinities,
      maxWeight,
      effectiveWithCurrentAttributes,
    ],
  );

  return (
    <>
      <Box
        sx={{
          backgroundColor: (theme) => theme.palette.background.paper,
          borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "384px 128px auto auto 1fr" },
            alignItems: "start",
            py: 2,
          }}
        >
          <Box display="grid" sx={{ gap: 2, gridTemplateColumns: "1fr 1fr 1fr" }}>
            {allAttributes.map((attribute) => (
              <TextField
                key={attribute}
                label={getAttributeLabel(attribute)}
                size="small"
                variant="outlined"
                inputProps={{
                  type: "number",
                  min: 1,
                  max: 99,
                  step: 1,
                }}
                value={attributes[attribute]}
                onChange={(evt) => {
                  onAttributesChanged({ ...attributes, [attribute]: +evt.currentTarget.value });
                }}
              />
            ))}
          </Box>

          <Box display="grid" sx={{ gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="upgradeLevelLabel">Weapon Level</InputLabel>
              <Select
                labelId="upgradeLevelLabel"
                label="Weapon Level"
                size="small"
                value={upgradeLevel}
                onChange={(evt) => onUpgradeLevelChanged(+evt.target.value)}
              >
                {Array.from({ length: maxRegularUpgradeLevel + 1 }, (_, upgradeLevelOption) => (
                  <MenuItem key={upgradeLevelOption} value={upgradeLevelOption}>
                    +{upgradeLevelOption} / +{toSpecialUpgradeLevel(upgradeLevelOption)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Weight Limit"
              size="small"
              variant="outlined"
              inputProps={{
                type: "number",
                min: 0,
                max: 30,
                step: 0.5,
              }}
              value={maxWeight}
              onChange={(evt) => {
                onMaxWeightChanged(+evt.currentTarget.value);
              }}
            />
          </Box>

          <FormControlLabel
            label="Two Handing"
            sx={{ mr: 0 }}
            control={
              <Checkbox
                size="small"
                checked={twoHanding}
                name="Two Handing"
                onChange={(evt) => onTwoHandingChanged(evt.currentTarget.checked)}
              />
            }
          />

          <FormControlLabel
            label="Effective only"
            sx={{ mr: 0 }}
            control={
              <Checkbox
                size="small"
                checked={effectiveWithCurrentAttributes}
                name="Effective only"
                onChange={(evt) =>
                  onEffectiveWithCurrentAttributesChanged(evt.currentTarget.checked)
                }
              />
            }
          />

          <FormControlLabel
            label="Dark Mode"
            sx={{ justifySelf: "end" }}
            control={
              <Switch
                checked={darkMode}
                onChange={(evt) => onDarkModeChanged(evt.currentTarget.checked)}
              />
            }
          />
        </Container>
      </Box>

      <Container
        maxWidth="xl"
        sx={{
          display: "grid",
          alignContent: "start",
          gap: 2,
          py: 2,
          px: {
            xs: 0,
            lg: 3,
          },
        }}
      >
        <WeaponTable rows={weaponTableRows} />
      </Container>
    </>
  );
};

//   <Drawer
//   sx={{
//     width: navigationDrawerWidth,
//     flexShrink: 0,
//     "& .MuiDrawer-paper": {
//       width: navigationDrawerWidth,
//     },
//   }}
//   anchor="left"
//   anchor="left"
//   variant="permanent"
// >
//   <Box sx={{ overflow: "auto" }}>
//     <Toolbar />
//   anchor="left"
//   variant="permanent"
// {/* <Drawer
//   sx={{
//     width: filterSideSheetWidth,
//     flexShrink: 0,
//     "& .MuiDrawer-paper": {
//       width: filterSideSheetWidth,
//     },
//   }}
//   anchor="right"
//   variant="permanent"
// >
//   <Box sx={{ overflow: "auto" }}>
//     <Toolbar />
//     <FilterSettings
//       weaponTypes={weaponTypes}
//       affinities={affinities}
//       maxWeight={maxWeight}
//       effectiveWithCurrentAttributes={effectiveWithCurrentAttributes}
//       onWeaponTypesChanged={onWeaponTypesChanged}
//       onAffinitiesChanged={onAffinitiesChanged}
//       onMaxWeightChanged={onMaxWeightChanged}
//       onEffectiveWithCurrentAttributesChanged={onEffectiveWithCurrentAttributesChanged}
//     />
//   </Box>
// </Drawer>

export default SearchScreen;
