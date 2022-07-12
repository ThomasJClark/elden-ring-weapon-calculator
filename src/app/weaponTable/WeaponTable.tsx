import { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { SystemStyleObject, Theme } from "@mui/system";
import { Weapon, WeaponAttackResult } from "../../calculator/calculator";
import { SortBy } from "../../search/sortWeapons";
import useWeaponTableColumns from "./useWeaponTableColumns";
import WeaponTableHeaderRow from "./WeaponTableHeaderRow";
import WeaponTableDataRow from "./WeaponTableDataRow";

export type WeaponTableRowData = [Weapon, WeaponAttackResult];

export interface WeaponTableColumnDef {
  key: SortBy;
  header: ReactNode;
  render(row: WeaponTableRowData): ReactNode;
  width?: number;
  sx?: SystemStyleObject<Theme> | ((theme: Theme) => SystemStyleObject<Theme>);
}

interface Props {
  rows: readonly WeaponTableRowData[];
}

const WeaponTable = ({ rows }: Props) => {
  const columns = useWeaponTableColumns();
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
          alignItems: "center",
          height: "36px",
          padding: "0px 10px",
        }}
      >
        {/* TODO actually implement column groups. Should be able to add both a border & a column group header */}
        {columns.map((column) => {
          if (column.key === "strScaling") {
            return (
              <Typography
                key={column.key}
                variant="subtitle2"
                sx={[{ width: 5 * column.width! }, column.sx ?? false]}
              >
                Attribute Scaling
              </Typography>
            );
          } else if (column.key.endsWith("Scaling")) {
            return null;
          }

          if (column.key === "strRequirement") {
            return (
              <Typography
                key={column.key}
                variant="subtitle2"
                sx={[{ width: 5 * column.width! }, column.sx ?? false]}
              >
                Attributes Required
              </Typography>
            );
          } else if (column.key.endsWith("Requirement")) {
            return null;
          }

          if (column.key === "Scarlet RotBuildup") {
            return (
              <Typography
                key={column.key}
                variant="subtitle2"
                sx={[{ width: 6 * column.width! }, column.sx ?? false]}
              >
                Passive Effects
              </Typography>
            );
          } else if (column.key.endsWith("Buildup")) {
            return null;
          }

          if (column.key === "physicalAttack") {
            return (
              <Typography
                key={column.key}
                variant="subtitle2"
                sx={[{ width: 5 * column.width! }, column.sx ?? false]}
              >
                Attack Power
              </Typography>
            );
          } else if (column.key.endsWith("Attack")) {
            return null;
          }

          return (
            <Box key={column.key} sx={[{ width: column.width }, column.sx ?? false]}>
              {null}
            </Box>
          );
        })}
      </Box>

      <WeaponTableHeaderRow columns={columns} />

      {rows.map((row) => (
        <WeaponTableDataRow key={row[0].name} columns={columns} row={row} />
      ))}
    </Box>
  );
};

export default WeaponTable;
