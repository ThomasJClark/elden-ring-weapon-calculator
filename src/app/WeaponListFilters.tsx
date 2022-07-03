import { Box, Button, Checkbox, FormControlLabel, Switch, Typography } from "@mui/material";
import { useState } from "react";
import { allAffinities, allWeaponTypes, WeaponType } from "../calculator/calculator";
import { useAppState } from "./AppState";
import { getAffinityIcon } from "./uiUtils";

/**
 * Might as well hide these by default. If you really need to know which small shield has the
 * highest AR... good luck.
 */
const miscWeaponTypes: WeaponType[] = [
  "Glintstone Staff",
  "Greatshield",
  "Medium Shield",
  "Sacred Seal",
  "Small Shield",
  "Torch",
];

/**
 * Left rail containing options to filter the weapon list by weapon type and/or affinity
 */
const WeaponListFilters = () => {
  const { weaponTypes, affinities, onWeaponTypesChanged, onAffinitiesChanged } = useAppState();

  const [showMiscWeaponTypesChecked, setShowMiscWeaponTypesChecked] = useState(false);

  const miscWeaponTypeSelected = miscWeaponTypes.some((weaponType) =>
    weaponTypes.includes(weaponType),
  );
  const showMiscWeaponTypes = showMiscWeaponTypesChecked || miscWeaponTypeSelected;

  return (
    <Box>
      <Box
        display="grid"
        sx={{ gridTemplateColumns: "auto 1fr auto auto", gap: 1, alignItems: "center" }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Affinity
        </Typography>

        <Box />

        <Button
          variant="text"
          size="small"
          disabled={affinities.length === allAffinities.length}
          onClick={() => onAffinitiesChanged(allAffinities)}
        >
          Select all
        </Button>
        <Button
          variant="text"
          size="small"
          disabled={affinities.length === 0}
          onClick={() => onAffinitiesChanged([])}
        >
          Clear
        </Button>
      </Box>

      <Box display="grid" sx={{ gridTemplateColumns: "1fr 1fr" }}>
        {allAffinities.map((affinity) => (
          <FormControlLabel
            key={affinity}
            label={
              <Box
                display="inline-grid"
                sx={{
                  verticalAlign: "middle",
                  gap: 1,
                  gridAutoFlow: "column",
                  alignItems: "center",
                }}
              >
                <img src={getAffinityIcon(affinity)} width={24} height={24} alt="" />
                <span>{affinity}</span>
              </Box>
            }
            sx={{ display: "block", mr: 0, my: "-4px" }}
            control={
              <Checkbox
                size="small"
                checked={affinities.includes(affinity)}
                name={affinity}
                onChange={(evt) =>
                  onAffinitiesChanged(
                    evt.currentTarget.checked
                      ? [...affinities, affinity]
                      : affinities.filter((value) => value !== affinity),
                  )
                }
              />
            }
          />
        ))}
      </Box>

      <Box
        display="grid"
        sx={{ mt: 2, gridTemplateColumns: "auto 1fr auto auto", gap: 1, alignItems: "center" }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Weapon Type
        </Typography>

        <Box />

        <Button
          variant="text"
          size="small"
          disabled={weaponTypes.length === allWeaponTypes.length}
          onClick={() => onWeaponTypesChanged(allWeaponTypes)}
        >
          Select all
        </Button>
        <Button
          variant="text"
          size="small"
          disabled={weaponTypes.length === 0}
          onClick={() => onWeaponTypesChanged([])}
        >
          Clear
        </Button>
      </Box>

      {allWeaponTypes
        .filter((weaponType) => showMiscWeaponTypes || !miscWeaponTypes.includes(weaponType))
        .map((weaponType) => (
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
                  onWeaponTypesChanged(
                    evt.currentTarget.checked
                      ? [...weaponTypes, weaponType]
                      : weaponTypes.filter((value) => value !== weaponType),
                  )
                }
              />
            }
          />
        ))}

      <FormControlLabel
        label="Show shields, staves, etc."
        sx={{ justifySelf: "end" }}
        control={
          <Switch
            checked={showMiscWeaponTypes}
            disabled={miscWeaponTypeSelected}
            onChange={(evt) => setShowMiscWeaponTypesChecked(evt.currentTarget.checked)}
          />
        }
      />
    </Box>
  );
};

export default WeaponListFilters;
