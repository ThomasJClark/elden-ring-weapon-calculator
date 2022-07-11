import { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { SystemStyleObject, Theme } from "@mui/system";
import { Weapon, WeaponAttackResult } from "../calculator/calculator";
import useWeaponTableColumns from "./useWeaponTableColumns";

export type WeaponTableRow = [Weapon, WeaponAttackResult];

export interface WeaponTableColumn {
  key: string;
  header: ReactNode;
  render(row: WeaponTableRow): ReactNode;
  width?: number;
  sx?: SystemStyleObject<Theme> | ((theme: Theme) => SystemStyleObject<Theme>);
}

interface Props {
  rows: readonly WeaponTableRow[];
}

const WeaponTable = ({ rows }: Props) => {
  const columns = useWeaponTableColumns();
  return (
    <Box
      display="grid"
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

          if (column.key === "physicalAttackPower") {
            return (
              <Typography
                key={column.key}
                variant="subtitle2"
                sx={[{ width: 5 * column.width! }, column.sx ?? false]}
              >
                Attack Power
              </Typography>
            );
          } else if (column.key.endsWith("AttackPower")) {
            return null;
          }

          return (
            <Box key={column.key} sx={[{ width: column.width }, column.sx ?? false]}>
              {null}
            </Box>
          );
        })}
      </Box>

      {/* Column headers */}
      <Box
        display="flex"
        sx={{
          alignItems: "center",
          height: "36px",
          padding: "0px 10px",
        }}
      >
        {columns.map((column) => (
          <Typography
            key={column.key}
            variant="subtitle2"
            sx={[{ display: "grid", width: column.width }, column.sx ?? false]}
          >
            {column.header}
          </Typography>
        ))}
      </Box>

      {/* Rows */}
      {rows.slice(0, 100).map((row) => (
        <Box
          key={row[0].name}
          display="flex"
          sx={(theme) => ({
            alignItems: "center",
            height: "36px",
            padding: "0px 10px",
            borderTop: `solid 1px ${theme.palette.divider}`,
            ":hover": {
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            },
          })}
        >
          {columns.map((column) => (
            <Box key={column.key} display="grid" sx={[{ width: column.width }, column.sx ?? false]}>
              {column.render(row)}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default WeaponTable;
