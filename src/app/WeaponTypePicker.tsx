import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { allWeaponTypes, WeaponType } from "../calculator/calculator";
import { useAppState } from "./AppState";

/**
 * Might as well hide these by default. If you really need to know which small shield has the
 * highest AR... good luck.
 */
const rangedWeaponTypes: WeaponType[] = ["Light Bow", "Bow", "Greatbow", "Crossbow", "Ballista"];

const miscWeaponTypes: WeaponType[] = [
  "Torch",
  "Small Shield",
  "Medium Shield",
  "Greatshield",
  "Glintstone Staff",
  "Sacred Seal",
];

const meleeWeaponTypes: WeaponType[] = allWeaponTypes.filter(
  (weaponType) => !rangedWeaponTypes.includes(weaponType) && !miscWeaponTypes.includes(weaponType),
);

/**
 * Set of checkboxes for selecting weapon types to include in the search results
 */
const WeaponListFilters = () => {
  const { weaponTypes, setWeaponTypes } = useAppState();

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
            onChange={(evt) => {
              if (evt.currentTarget.checked) {
                setWeaponTypes([...new Set([...weaponTypes, ...weaponTypesInCategory])]);
              } else {
                setWeaponTypes(
                  weaponTypes.filter((weaponType) => !weaponTypesInCategory.includes(weaponType)),
                );
              }
            }}
          />
        }
      />
    );
  };

  const renderWeaponType = (weaponType: WeaponType) => (
    <FormControlLabel
      key={weaponType}
      label={weaponType}
      sx={{ display: "block", mr: 0, my: "-4px" }}
      control={
        <Checkbox
          size="small"
          checked={weaponTypes.includes(weaponType)}
          name={weaponType}
          onChange={(evt) =>
            setWeaponTypes(
              evt.currentTarget.checked
                ? [...weaponTypes, weaponType]
                : weaponTypes.filter((value) => value !== weaponType),
            )
          }
        />
      }
    />
  );

  return (
    <Box>
      <Typography component="h2" variant="h6" sx={{ mb: 1 }}>
        Weapon Type
      </Typography>

      {renderWeaponCategory("Melee Weapons", meleeWeaponTypes)}
      <Box sx={{ ml: 3 }}>{meleeWeaponTypes.map(renderWeaponType)}</Box>

      {renderWeaponCategory("Ranged Weapons", rangedWeaponTypes)}
      <Box sx={{ ml: 3 }}>{rangedWeaponTypes.map(renderWeaponType)}</Box>

      {renderWeaponCategory("Other Armaments", miscWeaponTypes)}
      <Box sx={{ ml: 3 }}>{miscWeaponTypes.map(renderWeaponType)}</Box>
    </Box>
  );
};

export default WeaponListFilters;
