import { ReactNode } from "react";
import { Box, BoxProps } from "@mui/material";
import { SystemStyleObject, Theme } from "@mui/system";
import { WeaponTableColumnDef, WeaponTableColumnGroupDef } from "./WeaponTable";

interface Props {
  sx?: SystemStyleObject<Theme> | ((theme: Theme) => SystemStyleObject<Theme>);
  columnGroupSx?: SystemStyleObject<Theme> | ((theme: Theme) => SystemStyleObject<Theme>);
  columnGroups: readonly WeaponTableColumnGroupDef[];
  columnProps?(column: WeaponTableColumnDef): Omit<BoxProps, "children">;
  renderColumnGroup(column: WeaponTableColumnGroupDef): ReactNode;
}

const WeaponTableRow = ({ sx, columnGroupSx, columnGroups, renderColumnGroup }: Props) => (
  <Box
    display="flex"
    role="row"
    sx={[
      (theme) => ({
        alignItems: "stretch",
        minHeight: "36px",
        ":not(:first-of-type)": {
          borderTop: `solid 1px ${theme.palette.divider}`,
        },
      }),
      sx ?? false,
    ]}
  >
    {columnGroups.map((columnGroup) => (
      <Box
        key={columnGroup.key}
        display="flex"
        sx={[
          (theme) => ({
            padding: "0px 10px",
            alignItems: "stretch",
            ":not(:first-of-type)": {
              borderLeft: `solid 1px ${theme.palette.divider}`,
            },
          }),
          columnGroupSx ?? {},
          columnGroup.sx ?? {},
        ]}
      >
        {renderColumnGroup(columnGroup)}
      </Box>
    ))}
  </Box>
);

export default WeaponTableRow;
