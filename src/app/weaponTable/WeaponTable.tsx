import { memo, type ReactNode, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { type SystemStyleObject, type Theme } from "@mui/system";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { AttackPowerType, type Weapon, type WeaponAttackResult } from "../../calculator/calculator";
import type { SortBy } from "../../search/sortWeapons";
import getWeaponTableColumns from "./getWeaponTableColumns";
import {
  WeaponTableBody,
  WeaponTableColumn,
  WeaponTableColumnGroup,
  WeaponTableColumnGroupHeaderRow,
  WeaponTableColumnHeaderRow,
  WeaponTableDataRow,
  WeaponTableGroup,
  WeaponTableGroupHeaderRow,
} from "./tableStyledComponents";

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
   * Attack power types that must be included as columns in the table
   */
  attackPowerTypes: ReadonlySet<AttackPowerType>;

  onSortByChanged(sortBy: SortBy): void;
  onReverseChanged(reverse: boolean): void;
}

/**
 * The row in the weapon table containing headers for each column
 */
const ColumnHeaderRow = memo(function ColumnHeaderRow({
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
}) {
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
    <WeaponTableColumnHeaderRow role="row">
      {columnGroups.map(({ key, sx, columns }) => (
        <WeaponTableColumnGroup key={key} sx={sx}>
          {columns.map((column) => (
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
          ))}
        </WeaponTableColumnGroup>
      ))}
    </WeaponTableColumnHeaderRow>
  );
});

/**
 * A row in the weapon table containing a single weapon
 */
const DataRow = memo(function DataRow({
  columnGroups,
  row,
}: {
  columnGroups: readonly WeaponTableColumnGroupDef[];
  row: WeaponTableRowData;
}) {
  return (
    <WeaponTableDataRow role="row">
      {columnGroups.map(({ key, sx, columns }) => (
        <WeaponTableColumnGroup key={key} sx={sx}>
          {columns.map((column) => (
            <WeaponTableColumn key={column.key} role="cell" sx={column.sx}>
              {column.render(row)}
            </WeaponTableColumn>
          ))}
        </WeaponTableColumnGroup>
      ))}
    </WeaponTableDataRow>
  );
});

function WeaponTable({
  rowGroups,
  placeholder,
  footer,
  sortBy,
  reverse,
  splitDamage,
  attackPowerTypes,
  onSortByChanged,
  onReverseChanged,
}: Props) {
  const columnGroups = useMemo(
    () => getWeaponTableColumns({ splitDamage, attackPowerTypes }),
    [splitDamage, attackPowerTypes],
  );

  return (
    <WeaponTableBody role="table">
      <WeaponTableColumnGroupHeaderRow role="row">
        {columnGroups.map(({ key, sx, header }) => (
          <WeaponTableColumnGroup
            key={key}
            sx={[sx ?? {}, { alignItems: "center", justifyContent: "center" }]}
          >
            {header && (
              <Typography component="span" variant="subtitle2" role="columnheader">
                {header}
              </Typography>
            )}
          </WeaponTableColumnGroup>
        ))}
      </WeaponTableColumnGroupHeaderRow>

      <ColumnHeaderRow
        columnGroups={columnGroups}
        sortBy={sortBy}
        reverse={reverse}
        onSortByChanged={onSortByChanged}
        onReverseChanged={onReverseChanged}
      />
      {rowGroups.length > 0 ? (
        rowGroups.map(({ key, name, rows }) => (
          <WeaponTableGroup key={key} role="rowgroup">
            {name != null && (
              <WeaponTableGroupHeaderRow role="row">
                <Typography component="span" variant="subtitle2" role="columnheader">
                  {name}
                </Typography>
              </WeaponTableGroupHeaderRow>
            )}

            {rows.map((row) => (
              <DataRow
                key={`${row[0].weaponName},${row[0].affinityId}`}
                columnGroups={columnGroups}
                row={row}
              />
            ))}
          </WeaponTableGroup>
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
    </WeaponTableBody>
  );
}

export default memo(WeaponTable);
