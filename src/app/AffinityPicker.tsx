import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { Affinity, allAffinities } from "../calculator/calculator";
import { useAppState } from "./AppState";
import { getAffinityIcon, getAffinityLabel } from "./uiUtils";

/**
 * Set of checkboxes for selecting which weapon affinities to show
 */
const AffinityPicker = () => {
  const { affinities, setAffinities } = useAppState();

  const renderAffinityCheckbox = (affinity: Affinity) => (
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
          <span>{getAffinityLabel(affinity)}</span>
        </Box>
      }
      sx={{ display: "block", mr: 0, my: "-4px" }}
      control={
        <Checkbox
          size="small"
          checked={affinities.includes(affinity)}
          name={affinity}
          onChange={(evt) =>
            setAffinities(
              evt.currentTarget.checked
                ? [...affinities, affinity]
                : affinities.filter((value) => value !== affinity),
            )
          }
        />
      }
    />
  );

  return (
    <Box display="grid" sx={{ gap: 1 }}>
      <Typography component="h2" variant="h6">
        Affinity
      </Typography>

      <Box display="grid" sx={{ gridTemplateColumns: "1fr 1fr" }}>
        <Box>
          {allAffinities.slice(0, Math.floor(allAffinities.length / 2)).map(renderAffinityCheckbox)}
        </Box>
        <Box>
          {allAffinities.slice(Math.floor(allAffinities.length / 2)).map(renderAffinityCheckbox)}
        </Box>
      </Box>
    </Box>
  );
};

export default AffinityPicker;
