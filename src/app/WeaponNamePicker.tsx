import { Autocomplete, Box, FormControlLabel, TextField, Typography } from "@mui/material";
import { memo } from "react";
import useWeapons from "./useWeapons";
import type { RegulationVersionName } from "./regulationVersions";

interface Props {
  regulationVersionName: RegulationVersionName;
  includeDLC?: boolean;
  weaponNames: readonly string[];
  onWeaponNamesChanged(weaponNames: string[]): void;
}

/**
 * Set of checkboxes for selecting weapon types to include in the search results
 */
function WeaponNamePicker({ includeDLC, weaponNames, onWeaponNamesChanged, regulationVersionName }: Props) {
  const { weapons, loading } = useWeapons(regulationVersionName);

  const renderWeaponName = (label: string, weaponList: string[]) => {

    return (
      <FormControlLabel
        key={label}
        sx={{ display: "block", mr: 0, my: "-4px" }}
        control={
          <Autocomplete
            multiple
            id="tags-outlined"
            options={weaponList}
            defaultValue={[]}
            onChange={(event, newValue) => {
              onWeaponNamesChanged(newValue);
            }}
            value={Array.from(weaponNames)}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                {...params}
                disabled={loading}
                placeholder={loading ? "Loading..." : "Weapons"}
              />
            )}
          />
        }
      />
    );
  };

  return (
    <Box>
      <Typography component="h2" variant="h6" sx={{ mb: 1 }}>
        Weapons
      </Typography>

      {renderWeaponName(
        "Weapons",
        Array.from(new Set(weapons.filter(weapon => includeDLC || !weapon.dlc).map(weapon => weapon.weaponName)))
      )}
    </Box>
  );
}

export default memo(WeaponNamePicker);
