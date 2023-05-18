import { memo, useId } from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import regulationVersions, { type RegulationVersionName } from "./regulationVersions";

interface Props {
  regulationVersionName: RegulationVersionName;
  onRegulationVersionNameChanged(regulationVersionName: RegulationVersionName): void;
}

/**
 * Dropdown used to select the version of the game (e.g. a specific patch or mod)
 */
function RegulationVersionPicker({ regulationVersionName, onRegulationVersionNameChanged }: Props) {
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
        {Object.entries(regulationVersions).map(([key, { name }]) => (
          <MenuItem key={key} value={key}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default memo(RegulationVersionPicker);
