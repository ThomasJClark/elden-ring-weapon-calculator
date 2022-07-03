import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { allAffinities, allWeaponTypes } from "../calculator/calculator";
import { useAppState } from "./AppState";
import { getAffinityIcon } from "./uiUtils";

/**
 * Left rail containing options to filter the weapon list by weapon type and/or affinity
 */
const WeaponListFilters = () => {
  const { weaponTypes, affinities, onWeaponTypesChanged, onAffinitiesChanged } = useAppState();

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Affinity
      </Typography>

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
            sx={{ display: "block", mr: 0 }}
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

      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        Weapon Type
      </Typography>

      {allWeaponTypes.map((weaponType) => (
        <FormControlLabel
          key={weaponType}
          label={weaponType}
          sx={{ display: "block", mr: 0 }}
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
    </Box>
  );
};

export default WeaponListFilters;
