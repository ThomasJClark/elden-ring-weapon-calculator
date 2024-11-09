import { memo } from "react";
import { Checkbox, FormControlLabel } from "@mui/material";

interface Props {
  showIncludeDLC: boolean;
  effectiveOnly: boolean;
  favoritesOnly: boolean;
  includeDLC: boolean;
  onEffectiveOnlyChanged(effectiveOnly: boolean): void;
  onFavoritesOnlyChanged(favoritesOnly: boolean): void;
  onIncludeDLCChanged(includeDLC: boolean): void;
}

/**
 * Other filters in the left shelf
 */
function MiscFilterPicker({
  showIncludeDLC,
  effectiveOnly,
  favoritesOnly,
  includeDLC,
  onEffectiveOnlyChanged,
  onFavoritesOnlyChanged,
  onIncludeDLCChanged,
}: Props) {
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
      <FormControlLabel
        label="Favorites only"
        sx={{ display: "block", mr: 0, my: "-4px" }}
        control={
          <Checkbox
            size="small"
            checked={favoritesOnly}
            name="Favorites only"
            onChange={(evt) => onFavoritesOnlyChanged(evt.currentTarget.checked)}
          />
        }
      />
    </div>
  );
}

export default memo(MiscFilterPicker);
