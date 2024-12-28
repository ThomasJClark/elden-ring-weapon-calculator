import { memo } from "react";
import { Checkbox, FormControlLabel } from "@mui/material";
import { useAppStateContext } from "./AppStateProvider";

/**
 * Other filters in the left shelf
 */
function MiscFilterPicker() {
  const {
    state: { effectiveOnly, regulationVersionName, includeDLC },
    dispatch,
  } = useAppStateContext();
  const showIncludeDLC = regulationVersionName === "latest";
  return (
    <div>
      {showIncludeDLC && (
        <FormControlLabel
          label="Include DLC weapons"
          sx={{ display: "block", mr: 0, my: "-4px" }}
          control={
            <Checkbox
              size="small"
              checked={includeDLC}
              name="Include DLC weapons"
              onChange={({ currentTarget: { checked } }) => {
                dispatch({ type: "setIncludeDLC", payload: checked });
              }}
            />
          }
        />
      )}
      <FormControlLabel
        label="Effective only"
        sx={{ display: "block", mr: 0, my: "-4px" }}
        control={
          <Checkbox
            size="small"
            checked={effectiveOnly}
            name="Effective only"
            onChange={({ currentTarget: { checked } }) => {
              dispatch({ type: "setEffectiveOnly", payload: checked });
            }}
          />
        }
      />
    </div>
  );
}

export default memo(MiscFilterPicker);
