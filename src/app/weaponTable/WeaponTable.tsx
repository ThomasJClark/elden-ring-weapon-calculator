import { memo, ReactNode } from "react";
import { Box } from "@mui/material";
import { SystemStyleObject, Theme } from "@mui/system";
import { Weapon, WeaponAttackResult } from "../../calculator/calculator";
import { SortBy } from "../../search/sortWeapons";
import { useAppState } from "../AppState";
import useWeaponTableColumns from "./useWeaponTableColumns";
import WeaponTableRow from "./WeaponTableRow";

export type WeaponTableRowData = [Weapon, WeaponAttackResult];

export interface WeaponTableColumnDef {
  key: SortBy;
  header: ReactNode;
  render(row: WeaponTableRowData): ReactNode;
  sx?: SystemStyleObject<Theme> | ((theme: Theme) => SystemStyleObject<Theme>);
}

export interface WeaponTableColumnGroupDef {
  key: string;
  header?: ReactNode;
  columns: readonly WeaponTableColumnDef[];
  sx?: SystemStyleObject<Theme> | ((theme: Theme) => SystemStyleObject<Theme>);
}

interface Props {
  rows: readonly WeaponTableRowData[];
}

/**
 * The first row in the weapon table containing headers for each column group
 */
const ColumnGroupHeaderGroup = memo(
  ({ columnGroups }: { columnGroups: readonly WeaponTableColumnGroupDef[] }) => (
    <WeaponTableRow
      columnGroupSx={{ alignItems: "center", justifyContent: "center" }}
      columnGroups={columnGroups}
      renderColumnGroup={({ header }) => header}
    />
  ),
);

/**
 * The row in the weapon table containing headers for each column
 */
const ColumnHeaderRow = memo(
  ({ columnGroups }: { columnGroups: readonly WeaponTableColumnGroupDef[] }) => {
    const { sortBy, reverse, setSortBy, setReverse } = useAppState();

    const onColumnClicked = (column: WeaponTableColumnDef) => {
      if (column.key === sortBy) {
        setReverse(!reverse);
      } else {
        setSortBy(column.key);
        setReverse(false);
      }
    };

    return (
      <WeaponTableRow
        columnGroups={columnGroups}
        renderColumnGroup={({ columns }) =>
          columns.map((column) => (
            <Box
              key={column.key}
              display="grid"
              sx={[
                {
                  flex: "1 1 0",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "9999px",
                  cursor: "pointer",
                  userSelect: "none",
                  ":hover": { backgroundColor: "rgba(245, 189, 99, 0.08)" },
                },
                column.sx ?? {},
              ]}
              role="columnheader"
              tabIndex={0}
              aria-sort={column.key === sortBy ? (reverse ? "ascending" : "descending") : undefined}
              onClick={() => onColumnClicked(column)}
              onKeyDown={(evt) => {
                if (evt.key === " " || evt.key === "Enter") {
                  onColumnClicked(column);
                  evt.preventDefault();
                }
              }}
            >
              {column.header}
            </Box>
          ))
        }
      />
    );
  },
);

/**
 * A row in the weapon table containing a single weapon
 */
const DataRow = memo(
  ({
    columnGroups,
    row,
  }: {
    columnGroups: readonly WeaponTableColumnGroupDef[];
    row: WeaponTableRowData;
  }) => (
    <WeaponTableRow
      columnGroups={columnGroups}
      sx={{
        ":nth-of-type(2n+1)": { backgroundColor: "rgba(255, 255, 255, 0.02)" },
        ":hover": { backgroundColor: "rgba(255, 255, 255, 0.08)" },
      }}
      renderColumnGroup={({ columns }) =>
        columns.map((column) => (
          <Box
            key={column.key}
            display="grid"
            sx={[
              {
                flex: "1 1 0",
                alignItems: "center",
                justifyContent: "center",
              },
              column.sx ?? {},
            ]}
          >
            {column.render(row)}
          </Box>
        ))
      }
    />
  ),
);

const WeaponTable = ({ rows }: Props) => {
  const columnGroups = useWeaponTableColumns();

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
      <ColumnGroupHeaderGroup columnGroups={columnGroups} />
      <ColumnHeaderRow columnGroups={columnGroups} />
      {rows.map((row) => (
        <DataRow key={row[0].name} columnGroups={columnGroups} row={row} />
      ))}
    </Box>
  );
};

export default WeaponTable;
