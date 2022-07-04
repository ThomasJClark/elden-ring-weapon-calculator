import { useMemo } from "react";
import { Box, Button, Tooltip, Typography } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { allAttributes, DamageType, Weapon, WeaponAttackResult } from "../calculator/calculator";
import {
  getAttributeLabel,
  getDamageTypeIcon,
  getDamageTypeLabel,
  getScalingLabel,
} from "./uiUtils";
import { useAppState } from "./AppState";

export type WeaponTableRow = [Weapon, WeaponAttackResult];

const getRowId = ([weapon]: WeaponTableRow) => weapon.name;

function useColumns(): GridColDef<WeaponTableRow>[] {
  const { splitDamage } = useAppState();
  return useMemo(
    () => [
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
            {weapon.name.replace("Epee", "Épée")}
          </Button>
        ),
      },
      {
        headerName: "Attack Power",
        field: "attackPower",
        width: 256,
        sortingOrder: ["desc", "asc"],
        valueGetter: ({ row: [, { attackRating }] }) =>
          Object.values(attackRating).reduce(
            (sum, attackPower) =>
              sum + attackPower.baseAttackPower + attackPower.scalingAttackPower,
            0,
          ),
        renderCell({ value, row: [, { attackRating }] }) {
          const damageTypes = Object.keys(attackRating) as DamageType[];

          if (splitDamage) {
            return (
              <Box display="grid" width="100%" sx={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                {damageTypes.map((damageType) => {
                  const { baseAttackPower, scalingAttackPower } = attackRating[damageType]!;
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
                })}
              </Box>
            );
          }

          const displayedAttackPower = Math.floor(value);
          const displayedDamageTypes =
            damageTypes.length === 1
              ? damageTypes
              : damageTypes.filter((damageType) => damageType !== "physical");

          return (
            <Tooltip
              sx={{
                display: "grid",
                gridAutoFlow: "column",
                alignItems: "center",
                justifyContent: "start",
                gap: 1,
              }}
              title={`${displayedAttackPower} ${damageTypes
                .map(getDamageTypeLabel)
                .join("/")} Attack`}
            >
              <Box>
                {displayedDamageTypes.map((damageType) => (
                  <img
                    key={damageType}
                    src={getDamageTypeIcon(damageType)}
                    alt=""
                    width={24}
                    height={24}
                  />
                ))}
                {displayedAttackPower}
              </Box>
            </Tooltip>
          );
        },
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
          renderCell: ({ value, row: [, { ineffectiveAttributes }] }) => {
            if (value === 0) {
              return <RemoveIcon color="disabled" fontSize="small" />;
            }

            if (ineffectiveAttributes.includes(attribute)) {
              return (
                <Tooltip
                  title={`Unable to wield this weapon effectively with present ${getAttributeLabel(
                    attribute,
                  )} stat`}
                >
                  <Typography sx={{ color: (theme) => theme.palette.error.main }}>
                    {value}
                  </Typography>
                </Tooltip>
              );
            }

            return value;
          },
        }),
      ),
    ],
    [splitDamage],
  );
}

interface Props {
  rows: WeaponTableRow[];
}

const WeaponTable = ({ rows }: Props) => {
  const columns = useColumns();
  return (
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
      pageSize={50}
    />
  );
};

export default WeaponTable;
