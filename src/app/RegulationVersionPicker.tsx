import { memo, useId } from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import regulationVersions, {
  canSeeAprilFools,
  type RegulationVersionName,
} from "./regulationVersions";

interface Props {
  aprilFools: boolean;
  regulationVersionName: RegulationVersionName;
  onRegulationVersionNameChanged(regulationVersionName: RegulationVersionName): void;
}

/**
 * Dropdown used to select the version of the game (e.g. a specific patch or mod)
 */
function RegulationVersionPicker({
  aprilFools,
  regulationVersionName,
  onRegulationVersionNameChanged,
}: Props) {
  const id = useId();
  return (
    <FormControl fullWidth>
      <InputLabel id={id}>Game Version / Mod</InputLabel>
      <Select
        labelId={id}
        label="Game Version / Mod"
        size="small"
        value={regulationVersionName}
        onChange={(evt) => {
          onRegulationVersionNameChanged(evt.target.value as RegulationVersionName);
        }}
      >
        {Object.entries(regulationVersions)
          .filter(([key]) => canSeeAprilFools || key !== "sekiro")
          .map(([key, { name }], index) => (
            <MenuItem key={key} value={key}>
              {aprilFools
                ? [
                    "Sekiro: Shadows Die Twice",
                    "ELDEN RING",
                    "Sekiro Reforged (mod)",
                    "Sekiro Convergence (mod)",
                  ][index]
                : name}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
}

export default memo(RegulationVersionPicker);
