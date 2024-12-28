import { memo, useId } from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import regulationVersions, { type RegulationVersionName } from "./regulationVersions";
import { useAppStateContext } from "./AppStateProvider";

/**
 * Dropdown used to select the version of the game (e.g. a specific patch or mod)
 */
function RegulationVersionPicker() {
  const {
    state: { regulationVersionName },
    dispatch,
  } = useAppStateContext();
  const id = useId();
  return (
    <FormControl fullWidth>
      <InputLabel id={id}>Game Version / Mod</InputLabel>
      <Select
        labelId={id}
        label="Game Version / Mod"
        size="small"
        value={regulationVersionName}
        onChange={({ target: { value } }) => {
          dispatch({ type: "setRegulationVersionName", payload: value as RegulationVersionName });
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
