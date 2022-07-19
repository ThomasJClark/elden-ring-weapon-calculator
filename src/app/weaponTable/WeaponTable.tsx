import { memo, ReactNode } from "react";
import { Box } from "@mui/material";
import { SystemStyleObject, Theme } from "@mui/system";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
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
  placeholder?: ReactNode;
  footer?: ReactNode;
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
                  cursor: "pointer",
                  userSelect: "none",
                  position: "relative",
                  pt: 1,
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
              {column.key === sortBy &&
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
          >
            {column.render(row)}
          </Box>
        ))
      }
    />
  ),
);

const WeaponTable = ({ rows, placeholder, footer }: Props) => {
  const columnGroups = useWeaponTableColumns();

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
      <ColumnHeaderRow columnGroups={columnGroups} />
      {rows.length > 0 ? (
        rows.map((row) => <DataRow key={row[0].name} columnGroups={columnGroups} row={row} />)
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
};

export default WeaponTable;
