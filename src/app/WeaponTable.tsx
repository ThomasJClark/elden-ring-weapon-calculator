import { Box, Button, Tooltip } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { allAttributes, DamageType, Weapon, WeaponAttackPower } from "../calculator/calculator";
import {
  getAttributeLabel,
  getDamageTypeIcon,
  getDamageTypeLabel,
  getScalingLabel,
} from "./uiUtils";

export type WeaponTableRow = [Weapon, Partial<Record<DamageType, WeaponAttackPower>>];

const getRowId = ([weapon]: WeaponTableRow) => weapon.name;

const columns: GridColDef<WeaponTableRow>[] = [
  {
    headerName: "Weapon",
    field: "name",
    sortingOrder: ["asc", "desc"],
    flex: 1,
    minWidth: 320,
    valueGetter: ({ row: [weapon] }) => weapon.name,
    renderCell: ({ row: [weapon] }) => (
      <Button
        sx={{ width: "100%", justifyContent: "start", userSelect: "all" }}
        variant="text"
        href={`https://eldenring.wiki.fextralife.com/${weapon.metadata.weaponName.replace(
          " ",
          "+",
        )}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {weapon.name}
      </Button>
    ),
  },
  {
    headerName: "Attack Power",
    field: "attackPower",
    width: 256,
    sortingOrder: ["desc", "asc"],
    valueGetter: ({ row: [, attackRating] }) =>
      Object.values(attackRating).reduce(
        (sum, attackPower) => sum + attackPower.baseAttackPower + attackPower.scalingAttackPower,
        0,
      ),
    renderCell: ({ row: [, attackRating] }) => (
      <Box display="grid" width="100%" sx={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        {(Object.entries(attackRating) as [DamageType, WeaponAttackPower][]).map(
          ([damageType, { baseAttackPower, scalingAttackPower }]) => {
            const damageTypeLabel = getDamageTypeLabel(damageType);
            const damageTypeIcon = getDamageTypeIcon(damageType);
            const displayedAttackPower = Math.floor(baseAttackPower + scalingAttackPower);
            return (
              <Tooltip
                sx={{
                  display: "grid",
                  gridAutoFlow: "column",
                  alignItems: "center",
                  justifyContent: "start",
                  gap: 1,
                }}
                title={`${displayedAttackPower} ${damageTypeLabel} Attack`}
                key={damageType}
              >
                <Box>
                  <img src={damageTypeIcon} alt="" width={24} height={24} />
                  {displayedAttackPower}
                </Box>
              </Tooltip>
            );
          },
        )}
      </Box>
    ),
  },
  ...allAttributes.map(
    (attribute): GridColDef<WeaponTableRow> => ({
      headerName: attribute,
      field: `${attribute}Scaling`,
      sortingOrder: ["desc", "asc"],
      hideSortIcons: true,
      headerAlign: "center",
      align: "center",
      width: 48,
      valueGetter: ({ row: [weapon] }) => weapon.attributeScaling[attribute] ?? 0,
      renderHeader: () => (
        <Tooltip title={`${getAttributeLabel(attribute)} Scaling`}>
          <span>{attribute}</span>
        </Tooltip>
      ),
      renderCell: ({ value }) =>
        value === 0 ? <RemoveIcon color="disabled" fontSize="small" /> : getScalingLabel(value),
    }),
  ),
  ...allAttributes.map(
    (attribute): GridColDef<WeaponTableRow> => ({
      headerName: attribute,
      field: `${attribute}Requirement`,
      sortingOrder: ["desc", "asc"],
      hideSortIcons: true,
      headerAlign: "center",
      align: "center",
      width: 48,
      valueGetter: ({ row: [weapon] }) => weapon.requirements[attribute] ?? 0,
      renderHeader: () => (
        <Tooltip title={`${getAttributeLabel(attribute)} Requirement`}>
          <span>{attribute}</span>
        </Tooltip>
      ),
      renderCell: ({ value }) =>
        value === 0 ? <RemoveIcon color="disabled" fontSize="small" /> : value,
    }),
  ),
];

interface Props {
  rows: WeaponTableRow[];
}

const WeaponTable = ({ rows }: Props) => (
  <DataGrid
    rows={rows}
    columns={columns}
    getRowId={getRowId}
    density="compact"
    disableSelectionOnClick
    disableColumnFilter
    disableColumnMenu
    disableColumnSelector
    disableDensitySelector
    autoHeight
    pageSize={25}
  />
);

export default WeaponTable;
