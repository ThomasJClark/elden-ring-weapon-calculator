import { Autocomplete, Box, TextField } from "@mui/material";
import { memo, useCallback } from "react";
import type { Weapon } from "../calculator/weapon";
import { weaponTypeLabels } from "./uiUtils";
import { useAppStateContext } from "./AppStateProvider";

export type WeaponOption = {
  label: string; // weaponName
  value: string; // weaponName
  type: string; // weaponType
};

interface Props {
  weaponOptions: WeaponOption[];
}

const sortByTypeThenName = (a: Weapon, b: Weapon): number => {
  if (a.weaponType < b.weaponType) return -1;
  if (a.weaponType > b.weaponType) return 1;
  // weapon types are the same, so compare the name
  if (a.weaponName < b.weaponName) return -1;
  if (a.weaponName > b.weaponName) return 1;
  // both primary and secondary values are equal
  return 0;
};
const makeOption = (weapon: Weapon): WeaponOption => ({
  label: weapon.weaponName,
  value: weapon.weaponName,
  type: weaponTypeLabels.get(weapon.weaponType) || "",
});

export const makeWeaponOptionsFromWeapon = (weapons: Weapon[]): WeaponOption[] => {
  return [
    ...weapons
      .reduce((acc, weapon) => acc.set(weapon.weaponName, weapon), new Map<string, Weapon>())
      .values(),
  ]
    .sort(sortByTypeThenName)
    .map(makeOption);
};

/**
 * An Autocomplete to allow for manually specifying weapons
 */
function WeaponPicker({ weaponOptions }: Props) {
  const {
    state: { selectedWeapons },
    dispatch,
  } = useAppStateContext();
  const handleOnChange = useCallback(
    (event: React.SyntheticEvent<Element, Event>, newSelection: WeaponOption[]) => {
      dispatch({
        type: "setSelectedWeapons",
        payload: newSelection,
      });
    },
    [dispatch],
  );

  return (
    <Box>
      <Autocomplete
        multiple
        options={weaponOptions}
        value={selectedWeapons}
        onChange={handleOnChange}
        renderInput={(params) => <TextField {...params} label="Weapons" />}
        groupBy={(weapon) => weapon.type}
        size="small"
      />
    </Box>
  );
}

export default memo(WeaponPicker);
