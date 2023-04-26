import { memo, ReactNode, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { SystemStyleObject, Theme } from "@mui/system";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { DamageType, Weapon, WeaponAttackResult } from "../../calculator/calculator";
import { SortBy } from "../../search/sortWeapons";
import getWeaponTableColumns from "./getWeaponTableColumns";
import WeaponTableRow, { WeaponTableBaseRow } from "./WeaponTableRow";

export type WeaponTableRowData = [Weapon, WeaponAttackResult];

export interface WeaponTableRowGroup {
  key: string;
  name?: string;
  rows: readonly WeaponTableRowData[];
}

export interface WeaponTableColumnDef {
  key: string;
  sortBy?: SortBy;
  header: ReactNode;
  render(row: WeaponTableRowData): ReactNode;
  sx?: SystemStyleObject<Theme> | ((theme: Theme) => SystemStyleObject<Theme>);
}

export interface WeaponTableColumnGroupDef {
  key: string;
  header?: string;
  columns: readonly WeaponTableColumnDef[];
  sx?: SystemStyleObject<Theme> | ((theme: Theme) => SystemStyleObject<Theme>);
}

interface Props {
  rowGroups: readonly WeaponTableRowGroup[];
  placeholder?: ReactNode;
  footer?: ReactNode;
  sortBy: SortBy;
  reverse: boolean;

  /**
   * If true, include columns for each individual damage type as well as total attack power
   */
  splitDamage: boolean;

  /**
   * Status types to include columns for in the table
   */
  statusTypes: readonly DamageType[];

  onSortByChanged(sortBy: SortBy): void;
  onReverseChanged(reverse: boolean): void;
}

/**
 * The first row in the weapon table containing headers for each column group
 */
const ColumnGroupHeaderGroup = memo(
  ({ columnGroups }: { columnGroups: readonly WeaponTableColumnGroupDef[] }) => (
    <WeaponTableRow
      columnGroupSx={{ alignItems: "center", justifyContent: "center" }}
      columnGroups={columnGroups}
      renderColumnGroup={({ header }) => (
        <Typography component="span" variant="subtitle2" role="columnheader">
          {header}
        </Typography>
      )}
    />
  ),
);

/**
 * The row in the weapon table containing headers for each column
 */
const ColumnHeaderRow = memo(
  ({
    columnGroups,
    sortBy,
    reverse,
    onSortByChanged,
    onReverseChanged,
  }: {
    columnGroups: readonly WeaponTableColumnGroupDef[];
    sortBy: SortBy;
    reverse: boolean;
    onSortByChanged(sortBy: SortBy): void;
    onReverseChanged(reverse: boolean): void;
  }) => {
    const onColumnClicked = (column: WeaponTableColumnDef) => {
      if (column.sortBy) {
        if (column.sortBy === sortBy) {
          onReverseChanged(!reverse);
        } else {
          onSortByChanged(column.sortBy);
          onReverseChanged(false);
        }
      }
    };

    return (
      <WeaponTableRow
        sx={{ minHeight: 41 }}
        columnGroups={columnGroups}
        renderColumnGroup={({ columns }) =>
          columns.map((column) => (
            <Box
              key={column.key}
              display="grid"
              sx={[
                {
                  flex: "1 1 0",
                  gridTemplateRows: "24px 1fr",
                  alignItems: "start",
                  justifyContent: "center",
                  borderRadius: "9999px",
                  position: "relative",
                  pt: 1,
                },
                column.sortBy
                  ? {
                      cursor: "pointer",
                      userSelect: "none",
                      ":hover": { backgroundColor: "rgba(245, 189, 99, 0.08)" },
                    }
                  : {},
                column.sx ?? {},
              ]}
              tabIndex={0}
              role="columnheader"
              aria-sort={
                column.sortBy === sortBy ? (reverse ? "ascending" : "descending") : undefined
              }
              onClick={column.sortBy ? () => onColumnClicked(column) : undefined}
              onKeyDown={
                column.sortBy
                  ? (evt) => {
                      if (evt.key === " " || evt.key === "Enter") {
                        onColumnClicked(column);
                        evt.preventDefault();
                      }
                    }
                  : undefined
              }
            >
              {column.header}
              {column.sortBy === sortBy &&
                (reverse ? (
                  <ArrowDropUpIcon sx={{ justifySelf: "center" }} fontSize="small" />
                ) : (
                  <ArrowDropDownIcon sx={{ justifySelf: "center" }} fontSize="small" />
                ))}
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
            role="cell"
          >
            {column.render(row)}
          </Box>
        ))
      }
    />
  ),
);

function RowGroup({
  columnGroups,
  name,
  rows,
}: {
  columnGroups: readonly WeaponTableColumnGroupDef[];
  name?: string;
  rows: readonly WeaponTableRowData[];
}) {
  return (
    <Box
      sx={(theme) => ({
        ":not(:last-of-type)": {
          minHeight: "37px",
          borderBottom: `solid 1px ${theme.palette.divider}`,
        },
      })}
      role="rowgroup"
    >
      {name != null && (
        <WeaponTableBaseRow
          sx={{
            padding: "0px 10px",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          }}
        >
          <Typography component="span" variant="subtitle2" role="columnheader">
            {name}
          </Typography>
        </WeaponTableBaseRow>
      )}

      {rows.map((row) => (
        <DataRow key={row[0].name} columnGroups={columnGroups} row={row} />
      ))}
    </Box>
  );
}

function WeaponTable({
  rowGroups,
  placeholder,
  footer,
  sortBy,
  reverse,
  splitDamage,
  statusTypes,
  onSortByChanged,
  onReverseChanged,
}: Props) {
  const columnGroups = useMemo(
    () => getWeaponTableColumns({ splitDamage, statusTypes }),
    [splitDamage, statusTypes],
  );

  return (
    <Box
      display="grid"
      role="table"
      sx={(theme) => ({
        overflowX: "auto",
        [theme.breakpoints.down("md")]: {
          borderTop: `solid 1px ${theme.palette.divider}`,
          borderBottom: `solid 1px ${theme.palette.divider}`,
          marginX: -3,
        },
        [theme.breakpoints.up("md")]: {
          border: `solid 1px ${theme.palette.divider}`,
          borderRadius: `${theme.shape.borderRadius}px`,
        },
      })}
    >
      <ColumnGroupHeaderGroup columnGroups={columnGroups} />
      <ColumnHeaderRow
        columnGroups={columnGroups}
        sortBy={sortBy}
        reverse={reverse}
        onSortByChanged={onSortByChanged}
        onReverseChanged={onReverseChanged}
      />
      {rowGroups.length > 0 ? (
        rowGroups.map(({ key, name, rows }) => (
          <RowGroup key={key} columnGroups={columnGroups} name={name} rows={rows} />
        ))
      ) : (
        <Box display="grid" sx={{ minHeight: "480px", px: "10px", gap: 3 }}>
          {placeholder}
        </Box>
      )}
      {footer != null && (
        <Box display="grid" sx={{ minHeight: "36px", px: "10px" }}>
          {footer}
        </Box>
      )}
    </Box>
  );
}

export default memo(WeaponTable);
