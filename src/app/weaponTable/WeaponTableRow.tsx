import { ReactNode } from "react";
import { Box, BoxProps } from "@mui/material";
import { SystemStyleObject, Theme } from "@mui/system";
import { WeaponTableColumnDef } from "./WeaponTable";

interface Props {
  sx?: SystemStyleObject<Theme> | ((theme: Theme) => SystemStyleObject<Theme>);
  columns: readonly WeaponTableColumnDef[];
  columnSx?: SystemStyleObject<Theme> | ((theme: Theme) => SystemStyleObject<Theme>);
  columnProps?(column: WeaponTableColumnDef): Omit<BoxProps, "children">;
  renderColumn(column: WeaponTableColumnDef): ReactNode;
}

const WeaponTableRow = ({ sx, columns, columnSx, columnProps, renderColumn }: Props) => (
  <Box
    display="flex"
    role="row"
    sx={[
      (theme) => ({
        alignItems: "stretch",
        height: "36px",
        padding: "0px 10px",
        borderTop: `solid 1px ${theme.palette.divider}`,
      }),
      sx ?? false,
    ]}
  >
    {columns.map((column) => (
      <Box
        key={column.key}
        display="grid"
        sx={[
          { width: column.width, alignItems: "center", justifyContent: "center" },
          columnSx ?? false,
          column.sx ?? false,
        ]}
        {...columnProps?.(column)}
      >
        {renderColumn(column)}
      </Box>
    ))}
  </Box>
);

export default WeaponTableRow;
