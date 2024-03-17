import { memo } from "react";
import { Checkbox, FormControlLabel } from "@mui/material";

interface Props {
  effectiveOnly: boolean;
  includeDLC: boolean;
  onEffectiveOnlyChanged(effectiveOnly: boolean): void;
  onIncludeDLCChanged(includeDLC: boolean): void;
}

/**
 * Other filters in the left shelf
 */
function MiscFilterPicker({
  effectiveOnly,
  includeDLC,
  onEffectiveOnlyChanged,
  onIncludeDLCChanged,
}: Props) {
  return (
    <div>
      {!!import.meta.env.VITE_IS_DLC_RELEASED && (
        <FormControlLabel
          label="Include DLC weapons"
          sx={{ display: "block", mr: 0, my: "-4px" }}
          control={
            <Checkbox
              size="small"
              checked={includeDLC}
              name="Include DLC weapons"
              onChange={(evt) => onIncludeDLCChanged(evt.currentTarget.checked)}
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
            onChange={(evt) => onEffectiveOnlyChanged(evt.currentTarget.checked)}
          />
        }
      />
    </div>
  );
}

export default memo(MiscFilterPicker);
