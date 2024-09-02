import { Autocomplete, Box, TextField } from "@mui/material";
import { memo, useCallback } from "react";
import type { Weapon } from "../calculator/weapon";
import { weaponTypeLabels } from "./uiUtils";

export type WeaponOption = {
  label: string; // weaponName
  value: string; // weaponName
  type: string; // weaponType
};

interface Props {
  selectedWeapons: WeaponOption[];
  onSelectedWeaponsChanged(weapons: WeaponOption[]): void;
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

export const makeWeaponOptionsFromWeapon = (weapons: Weapon[]): WeaponOption[] =>
  weapons.sort(sortByTypeThenName).map(makeOption);

/**
 * An Autocomplete to allow for manually specifying weapons
 */
function WeaponPicker({ onSelectedWeaponsChanged, weaponOptions, selectedWeapons }: Props) {
  const handleOnChange = useCallback(
    (event: React.SyntheticEvent<Element, Event>, newSelection: WeaponOption[]) => {
      onSelectedWeaponsChanged(newSelection);
    },
    [onSelectedWeaponsChanged],
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
