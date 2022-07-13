import { ReactNode, useMemo } from "react";
import { Box } from "@mui/material";
import { SystemStyleObject, Theme } from "@mui/system";
import { Weapon, WeaponAttackResult } from "../../calculator/calculator";
import { SortBy } from "../../search/sortWeapons";
import useWeaponTableColumns from "./useWeaponTableColumns";
import WeaponTableHeaderRow from "./WeaponTableHeaderRow";
import WeaponTableDataRow from "./WeaponTableDataRow";

export type WeaponTableRowData = [Weapon, WeaponAttackResult];

export interface WeaponTableColumnDef {
  key: SortBy;
  columnGroup?: string;
  header: ReactNode;
  render(row: WeaponTableRowData): ReactNode;
  width?: number;
  sx?: SystemStyleObject<Theme> | ((theme: Theme) => SystemStyleObject<Theme>);
}

export interface WeaponTableColumnGroupDef {
  key: string;
  header?: ReactNode;
  columns: readonly WeaponTableColumnDef[];
}

interface Props {
  rows: readonly WeaponTableRowData[];
}

const WeaponTable = ({ rows }: Props) => {
  const columnGroups = useWeaponTableColumns();
  const columns = useMemo(
    () => columnGroups.flatMap((columnGroup) => columnGroup.columns),
    [columnGroups],
  );

  return (
    <Box
      display="grid"
      role="table"
      sx={(theme) => ({
        overflowX: "auto",
        [theme.breakpoints.down("lg")]: {
          borderTop: `solid 1px ${theme.palette.divider}`,
          borderBottom: `solid 1px ${theme.palette.divider}`,
          marginX: -3,
        },
        [theme.breakpoints.up("lg")]: {
          border: `solid 1px ${theme.palette.divider}`,
          borderRadius: `${theme.shape.borderRadius}px`,
        },
      })}
    >
      {/* Column group headers */}
      <Box
        display="flex"
        role="row"
        sx={{
          alignItems: "stretch",
          minHeight: "36px",
          padding: "0px 10px",
        }}
      >
        {columnGroups.map((columnGroup) => (
          <Box
            key={columnGroup.key}
            display="grid"
            sx={[
              // Columns in group require exact widths, which is fine for now. The weapon name
              // column is the only one that flexes.
              columnGroup.columns.every((column) => column.width != null)
                ? { width: columnGroup.columns.reduce((width, column) => width + column.width!, 0) }
                : { flex: 1 },
              {
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
          >
            {columnGroup.header}
          </Box>
        ))}
      </Box>

      <WeaponTableHeaderRow columns={columns} />

      {rows.map((row) => (
        <WeaponTableDataRow key={row[0].name} columns={columns} row={row} />
      ))}
    </Box>
  );
};

export default WeaponTable;
