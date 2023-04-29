import type { AriaRole, ReactNode } from "react";
import { Box, type BoxProps } from "@mui/material";
import type { SystemStyleObject, Theme } from "@mui/system";
import type { WeaponTableColumnDef, WeaponTableColumnGroupDef } from "./WeaponTable";

interface BaseProps {
  sx?: SystemStyleObject<Theme> | ((theme: Theme) => SystemStyleObject<Theme>);
  children: ReactNode;
}

interface Props extends Omit<BaseProps, "children"> {
  columnGroupSx?: SystemStyleObject<Theme> | ((theme: Theme) => SystemStyleObject<Theme>);
  columnGroups: readonly WeaponTableColumnGroupDef[];
  columnProps?(column: WeaponTableColumnDef): Omit<BoxProps, "children">;
  renderColumnGroup(column: WeaponTableColumnGroupDef): ReactNode;
  columnRole?: AriaRole;
}

export function WeaponTableBaseRow({ sx, children }: BaseProps) {
  return (
    <Box
      display="flex"
      role="row"
      sx={[
        (theme) => ({
          alignItems: "stretch",
          minHeight: "36px",
          ":not(:last-of-type)": {
            minHeight: "37px",
            borderBottom: `solid 1px ${theme.palette.divider}`,
          },
        }),
        sx ?? false,
      ]}
    >
      {children}
    </Box>
  );
}

export default function WeaponTableRow({
  sx,
  columnGroupSx,
  columnGroups,
  renderColumnGroup,
}: Props) {
  return (
    <WeaponTableBaseRow sx={sx}>
      {columnGroups.map((columnGroup) => (
        <Box
          key={columnGroup.key}
          display="flex"
          sx={[
            (theme) => ({
              px: "13px",
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
    </WeaponTableBaseRow>
  );
}
