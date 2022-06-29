import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  TextField,
  Typography,
} from "@mui/material";
import { allWeaponTypes, allAffinities, WeaponType, Affinity } from "../calculator/calculator";

interface Props {
  weaponTypes: readonly WeaponType[];
  affinities: readonly Affinity[];
  maxWeight: number;
  effectiveWithCurrentAttributes: boolean;
  onWeaponTypesChanged(weaponTypes: readonly WeaponType[]): void;
  onAffinitiesChanged(affinities: readonly Affinity[]): void;
  onMaxWeightChanged(maxWeight: number): void;
  onEffectiveWithCurrentAttributesChanged(effectiveWithCurrentAttributes: boolean): void;
}

const formControlLabelStyle = { marginTop: -4, marginBottom: -4 };

const FilterSettings = ({
  weaponTypes,
  affinities,
  maxWeight,
  effectiveWithCurrentAttributes,
  onWeaponTypesChanged,
  onAffinitiesChanged,
  onMaxWeightChanged,
  onEffectiveWithCurrentAttributesChanged,
}: Props) => (
  <>
    <Typography sx={{ mt: 2, mx: 3 }} variant="h6" noWrap component="div">
      Filters
    </Typography>

    <FormControl
      sx={{ display: "flex", w: "100%", mx: 3, my: 2 }}
      component="fieldset"
      variant="standard"
    >
      <FormLabel component="legend">Weapon Type</FormLabel>
      <FormGroup>
        {allWeaponTypes.map((weaponType) => (
          <FormControlLabel
            key={weaponType}
            label={weaponType}
            style={formControlLabelStyle}
            control={
              <Checkbox
                size="small"
                checked={weaponTypes.includes(weaponType)}
                name={weaponType}
                onChange={(e) => {
                  if (e.currentTarget.checked) {
                    onWeaponTypesChanged([...weaponTypes, weaponType]);
                  } else {
                    onWeaponTypesChanged(weaponTypes.filter((value) => value !== weaponType));
                  }
                }}
              />
            }
          />
        ))}
      </FormGroup>
    </FormControl>

    <ButtonGroup sx={{ display: "block", mx: 3, my: 2 }} variant="outlined" size="small">
      <Button
        disabled={weaponTypes.length === allWeaponTypes.length}
        onClick={() => onWeaponTypesChanged(allWeaponTypes)}
      >
        Select All
      </Button>
      <Button disabled={weaponTypes.length === 0} onClick={() => onWeaponTypesChanged([])}>
        Clear
      </Button>
    </ButtonGroup>

    <Divider />

    <FormControl
      sx={{ display: "flex", w: "100%", mx: 3, my: 2 }}
      component="fieldset"
      variant="standard"
    >
      <FormLabel component="legend">Affinity</FormLabel>
      <FormGroup>
        {allAffinities.map((affinity) => (
          <FormControlLabel
            key={affinity}
            label={affinity}
            style={formControlLabelStyle}
            control={
              <Checkbox
                size="small"
                checked={affinities.includes(affinity)}
                name={affinity}
                onChange={(e) => {
                  if (e.currentTarget.checked) {
                    onAffinitiesChanged([...affinities, affinity]);
                  } else {
                    onAffinitiesChanged(affinities.filter((value) => value !== affinity));
                  }
                }}
              />
            }
          />
        ))}
      </FormGroup>
    </FormControl>

    <ButtonGroup sx={{ display: "block", mx: 3, my: 2 }} variant="outlined" size="small">
      <Button
        disabled={affinities.length === allAffinities.length}
        onClick={() => onAffinitiesChanged(allAffinities)}
      >
        Select All
      </Button>
      <Button disabled={affinities.length === 0} onClick={() => onAffinitiesChanged([])}>
        Clear
      </Button>
    </ButtonGroup>

    <Divider />

    <Box sx={{ mx: 3, mt: 3, mb: 2 }}>
      <TextField
        label="Maximum Weight"
        variant="outlined"
        inputProps={{
          type: "number",
          min: 0,
          max: 30,
          step: 0.1,
        }}
        value={maxWeight}
        onChange={(evt) => onMaxWeightChanged(+evt.currentTarget.value)}
      />
    </Box>

    <Box sx={{ mx: 3, mt: 2, mb: 3 }}>
      <FormControlLabel
        label="Effective only"
        style={formControlLabelStyle}
        control={
          <Checkbox
            size="small"
            checked={effectiveWithCurrentAttributes}
            name="effective"
            onChange={(e) => onEffectiveWithCurrentAttributesChanged(e.currentTarget.checked)}
          />
        }
      />
    </Box>
  </>
);

export default FilterSettings;
