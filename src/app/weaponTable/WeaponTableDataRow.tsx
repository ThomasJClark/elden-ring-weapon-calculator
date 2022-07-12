import { memo } from "react";
import { WeaponTableColumnDef, WeaponTableRowData } from "./WeaponTable";
import WeaponTableRow from "./WeaponTableRow";

interface Props {
  columns: readonly WeaponTableColumnDef[];
  row: WeaponTableRowData;
}

/**
 * A row in the weapon table containing a single weapon
 */
const WeaponTableDataRow = memo(({ columns, row }: Props) => (
  <WeaponTableRow
    columns={columns}
    sx={{
      ":hover": { backgroundColor: "rgba(255, 255, 255, 0.08)" },
    }}
    renderColumn={(column) => column.render(row)}
  />
));

export default WeaponTableDataRow;
