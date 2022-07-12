import { memo } from "react";
import { useAppState } from "../AppState";
import { WeaponTableColumnDef } from "./WeaponTable";
import WeaponTableRow from "./WeaponTableRow";

interface Props {
  columns: readonly WeaponTableColumnDef[];
}

/**
 * The first row in the weapon table containing headers for each column
 */
const WeaponTableHeaderRow = memo(({ columns }: Props) => {
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
      columns={columns}
      columnSx={{
        borderRadius: "9999px",
        cursor: "pointer",
        userSelect: "none",
        ":hover": { backgroundColor: "rgba(245, 189, 99, 0.08)" },
      }}
      columnProps={(column) => ({
        role: "columnheader",
        tabIndex: 0,
        "aria-sort": column.key === sortBy ? (reverse ? "ascending" : "descending") : undefined,
        onClick: () => onColumnClicked(column),
        onKeyDown: (evt) => {
          if (evt.key === " " || evt.key === "Enter") {
            onColumnClicked(column);
            evt.preventDefault();
          }
        },
      })}
      renderColumn={(column) => column.header}
    />
  );
});

export default WeaponTableHeaderRow;
