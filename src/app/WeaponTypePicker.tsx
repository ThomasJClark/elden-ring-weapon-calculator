import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { memo } from "react";
import { WeaponType } from "../calculator/calculator";
import {
  meleeWeaponTypes,
  rangedWeaponTypes,
  catalystTypes,
  shieldTypes,
  weaponTypeLabels,
  dlcWeaponTypes,
} from "./uiUtils";
import { useAppStateContext } from "./AppStateProvider";

/**
 * Set of checkboxes for selecting weapon types to include in the search results
 */
function WeaponTypePicker() {
  const {
    state: { weaponTypes, regulationVersionName, includeDLC },
    dispatch,
  } = useAppStateContext();
  const includeDLCWeaponTypes = includeDLC || !(regulationVersionName === "latest");
  const renderWeaponCategory = (label: string, weaponTypesInCategory: WeaponType[]) => {
    let checked = false;
    let indeterminate = false;
    if (weaponTypesInCategory.every((weaponType) => weaponTypes.includes(weaponType))) {
      checked = true;
    } else if (weaponTypesInCategory.some((weaponType) => weaponTypes.includes(weaponType))) {
      indeterminate = true;
    }

    return (
      <FormControlLabel
        key={label}
        label={label}
        sx={{ display: "block", mr: 0, my: "-4px" }}
        control={
          <Checkbox
            size="small"
            checked={checked}
            indeterminate={indeterminate}
            name={label}
            onChange={({ currentTarget: { checked } }) => {
              const newWeaponTypes = checked
                ? [...new Set([...weaponTypes, ...weaponTypesInCategory])]
                : weaponTypes.filter((weaponType) => !weaponTypesInCategory.includes(weaponType));
              dispatch({
                type: "setWeaponTypes",
                payload: newWeaponTypes,
              });
            }}
          />
        }
      />
    );
  };

  const renderWeaponType = (weaponType: WeaponType) => {
    if (!includeDLCWeaponTypes && dlcWeaponTypes.includes(weaponType)) {
      return null;
    }

    const label = weaponTypeLabels.get(weaponType)!;
    return (
      <FormControlLabel
        key={weaponType}
        label={label}
        sx={{ display: "block", mr: 0, my: "-4px" }}
        control={
          <Checkbox
            size="small"
            checked={weaponTypes.includes(weaponType)}
            name={label}
            onChange={({ currentTarget: { checked } }) => {
              dispatch({
                type: "setWeaponTypes",
                payload: checked
                  ? [...weaponTypes, weaponType]
                  : weaponTypes.filter((value) => value !== weaponType),
              });
            }}
          />
        }
      />
    );
  };

  return (
    <Box>
      <Typography component="h2" variant="h6" sx={{ mb: 1 }}>
        Weapon Type
      </Typography>

      {renderWeaponCategory("Melee Weapons", meleeWeaponTypes)}
      <Box sx={{ ml: 3 }}>{meleeWeaponTypes.map(renderWeaponType)}</Box>

      {renderWeaponCategory("Ranged Weapons", rangedWeaponTypes)}
      <Box sx={{ ml: 3 }}>{rangedWeaponTypes.map(renderWeaponType)}</Box>

      {renderWeaponCategory("Catalysts", catalystTypes)}
      <Box sx={{ ml: 3 }}>{catalystTypes.map(renderWeaponType)}</Box>

      {renderWeaponCategory("Shields", shieldTypes)}
      <Box sx={{ ml: 3 }}>{shieldTypes.map(renderWeaponType)}</Box>
    </Box>
  );
}

export default memo(WeaponTypePicker);
