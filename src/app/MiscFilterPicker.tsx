import { memo } from "react";
import { Checkbox, FormControlLabel } from "@mui/material";

interface Props {
  effectiveOnly: boolean;
  onEffectiveOnlyChanged(effectiveOnly: boolean): void;
}

/**
 * Other filters in the left shelf. Ccurrently just "Effective only", which determines if we hide
 * weapons that can't be wielded with the current stats
 */
function MiscFilterPicker({ effectiveOnly, onEffectiveOnlyChanged }: Props) {
  return (
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
  );
}

export default memo(MiscFilterPicker);
