import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { memo } from "react";
import type { AffinityOption } from "./uiUtils.ts";

interface Props {
  affinityOptions: ReadonlyMap<number, AffinityOption>;
  selectedAffinityIds: readonly number[];
  onAffinityIdsChanged(affinityIds: readonly number[]): void;
}

/**
 * Set of checkboxes for selecting which weapon affinities to show
 */
function AffinityPicker({ affinityOptions, selectedAffinityIds, onAffinityIdsChanged }: Props) {
  function renderAffinityCheckbox([affinityId, { text, icon }]: [number, AffinityOption]) {
    return (
      <FormControlLabel
        key={affinityId}
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
            {icon && <img src={icon} width={24} height={24} alt="" />}
            <span>{text}</span>
          </Box>
        }
        sx={{ display: "block", mr: 0, my: "-4px" }}
        control={
          <Checkbox
            size="small"
            checked={selectedAffinityIds.includes(+affinityId)}
            name={text}
            onChange={(evt) =>
              onAffinityIdsChanged(
                evt.currentTarget.checked
                  ? [...selectedAffinityIds, affinityId]
                  : selectedAffinityIds.filter((value) => value !== affinityId),
              )
            }
          />
        }
      />
    );
  }

  const affinityList = [...affinityOptions];

  return (
    <Box display="grid" sx={{ gap: 1 }}>
      <Typography component="h2" variant="h6">
        Affinity
      </Typography>

      <Box display="grid" sx={{ gridTemplateColumns: "1fr 1fr" }}>
        <Box>
          {affinityList.slice(0, Math.floor(affinityList.length / 2)).map(renderAffinityCheckbox)}
        </Box>
        <Box>
          {affinityList.slice(Math.floor(affinityList.length / 2)).map(renderAffinityCheckbox)}
        </Box>
      </Box>
    </Box>
  );
}

export default memo(AffinityPicker);
