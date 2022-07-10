import { ReactNode, useMemo } from "react";
import { Box, Link, Tooltip, Typography } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  allAttributes,
  DamageType,
  PassiveType,
  Weapon,
  WeaponAttackResult,
} from "../calculator/calculator";
import {
  getAttributeLabel,
  getDamageTypeIcon,
  getDamageTypeLabel,
  getPassiveTypeIcon,
  getScalingLabel,
} from "./uiUtils";
import { useAppState } from "./AppState";

export type WeaponTableRow = [Weapon, WeaponAttackResult];

const getRowId = ([weapon]: WeaponTableRow) => weapon.name;

const blankIcon = <RemoveIcon color="disabled" fontSize="small" />;

const TextAndIcon = ({
  text,
  iconPath,
  tooltip,
}: {
  text: ReactNode;
  iconPath: string | string[];
  tooltip: string;
}) => (
  <Tooltip
    sx={{
      display: "grid",
      gridAutoFlow: "column",
      alignItems: "center",
      justifyContent: "start",
      gap: 1,
    }}
    title={tooltip}
  >
    <Box>
      {(Array.isArray(iconPath) ? iconPath : [iconPath]).map((iconPath) => (
        <img key={iconPath} src={iconPath} alt="" width={24} height={24} />
      ))}
      {text}
    </Box>
  </Tooltip>
);

interface GridColDef<Value = any> {
  key: string;
  header: ReactNode;
  getValue(options: { row: WeaponTableRow }): Value;
  render(options: { row: WeaponTableRow; value: Value }): ReactNode;
  flex?: string | number;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
}

const passiveBuildupColumn: GridColDef<[PassiveType, number][]> = {
  header: "Passive Effects",
  key: "passiveBuildup",
  width: 150,
  // sortingOrder: ["desc", "asc"],
  getValue: ({ row: [, { passiveBuildup }] }) => {
    const buildups = Object.entries(passiveBuildup) as [PassiveType, number][];
    return buildups.sort(([, buildup1], [, buildup2]) => buildup2 - buildup1);
  },
  // For sorting purposes, just use the highest status buildup I guess. Ideally we would
  // support sorting by a single status.
  // sortComparator: (buildups1, buildups2) => {
  //   const n = Math.max(buildups1.length, buildups2.length);
  //   for (let i = 0; i < n; i++) {
  //     if (buildups1[i]?.[1] !== buildups2[i]?.[1]) {
  //       return (buildups1[i]?.[1] ?? 0) - (buildups2[i]?.[1] ?? 0);
  //     }
  //   }

  //   return 0;
  // },
  render: ({ value: buildups }) => {
    if (buildups == null || buildups.length === 0) {
      return blankIcon;
    }

    return (
      <Box display="grid" width="100%" sx={{ gridTemplateColumns: "1fr 1fr" }}>
        {buildups.map(([passiveType, buildup]) => (
          <TextAndIcon
            key={passiveType}
            text={Math.floor(buildup)}
            iconPath={getPassiveTypeIcon(passiveType)}
            tooltip={`${Math.floor(buildup)} ${passiveType} Buildup`}
          />
        ))}
      </Box>
    );
  },
};

function useColumns(): GridColDef[] {
  const { splitDamage } = useAppState();
  return useMemo(
    () => [
      {
        header: "Weapon",
        key: "name",
        // sortingOrder: ["asc", "desc"],
        flex: 1,
        minWidth: 320,
        getValue: ({ row: [weapon] }) => weapon.name,
        render: ({ row: [weapon] }) => (
          <Box>
            <Link
              variant="button"
              underline="hover"
              href={`https://eldenring.wiki.fextralife.com/${weapon.metadata.weaponName.replace(
                " ",
                "+",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {weapon.name.replace("Epee", "Épée")}
            </Link>
          </Box>
        ),
      },
      {
        header: "Attack Power",
        key: "attackPower",
        width: splitDamage ? 256 : 128,
        // sortingOrder: ["desc", "asc"],
        // For sorting purposes, just use the total attack power I guess. Ideally we would
        // support sorting by a single damage type.
        getValue: ({ row: [, { attackRating }] }) =>
          Object.values(attackRating).reduce(
            (sum, attackPower) =>
              sum + attackPower.baseAttackPower + attackPower.scalingAttackPower,
            0,
          ),
        render: ({ value, row: [, { attackRating }] }) => {
          const damageTypes = Object.keys(attackRating) as DamageType[];

          if (splitDamage) {
            return (
              <Box display="grid" width="100%" sx={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                {damageTypes.map((damageType) => {
                  const { baseAttackPower, scalingAttackPower } = attackRating[damageType]!;
                  const displayedAttackPower = Math.floor(baseAttackPower + scalingAttackPower);
                  return (
                    <TextAndIcon
                      key={damageType}
                      iconPath={getDamageTypeIcon(damageType)}
                      text={displayedAttackPower}
                      tooltip={`${displayedAttackPower} ${getDamageTypeLabel(damageType)} Attack`}
                    />
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
            <TextAndIcon
              iconPath={displayedDamageTypes.map(getDamageTypeIcon)}
              text={displayedAttackPower}
              tooltip={`${displayedAttackPower} ${damageTypes
                .map(getDamageTypeLabel)
                .join("/")} Attack`}
            />
          );
        },
      },
      passiveBuildupColumn,
      ...allAttributes.map(
        (attribute): GridColDef => ({
          key: `${attribute}Scaling`,
          // sortingOrder: ["desc", "asc"],
          // hideSortIcons: true,
          // headerAlign: "center",
          // align: "center",
          minWidth: 0,
          width: 40,
          getValue: ({ row: [weapon] }) => weapon.attributeScaling[attribute] ?? 0,
          header: (
            <Tooltip title={`${getAttributeLabel(attribute)} Scaling`}>
              <span>{attribute}</span>
            </Tooltip>
          ),
          render: ({ value }) => (value === 0 ? blankIcon : getScalingLabel(value)),
        }),
      ),
      ...allAttributes.map(
        (attribute): GridColDef => ({
          key: `${attribute}Requirement`,
          // sortingOrder: ["desc", "asc"],
          // hideSortIcons: true,
          // headerAlign: "center",
          // align: "center",
          minWidth: 0,
          width: 40,
          getValue: ({ row: [weapon] }) => weapon.requirements[attribute] ?? 0,
          header: (
            <Tooltip title={`${getAttributeLabel(attribute)} Requirement`}>
              <span>{attribute}</span>
            </Tooltip>
          ),
          render: ({ value, row: [, { ineffectiveAttributes }] }) => {
            if (value === 0) {
              return blankIcon;
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
      <Box
        display="flex"
        sx={{
          alignItems: "center",
          height: "36px",
        }}
      >
        {columns.map((column) => {
          if (column.key === "strScaling") {
            return (
              <Typography
                key={column.key}
                variant="subtitle2"
                sx={{
                  padding: "0px 10px",
                  flex: column.flex,
                  width: 5 * column.width!,
                  minWidth: column.minWidth,
                  maxWidth: column.maxWidth,
                }}
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
                sx={{
                  padding: "0px 10px",
                  flex: column.flex,
                  width: 5 * column.width!,
                  minWidth: column.minWidth,
                  maxWidth: column.maxWidth,
                }}
              >
                Attributes Required
              </Typography>
            );
          } else if (column.key.endsWith("Requirement")) {
            return null;
          }

          return (
            <Box
              key={column.key}
              sx={{
                padding: "0px 10px",
                flex: column.flex,
                width: column.width,
                minWidth: column.minWidth,
                maxWidth: column.maxWidth,
              }}
            >
              {null}
            </Box>
          );
        })}
      </Box>
      <Box
        display="flex"
        sx={{
          alignItems: "center",
          height: "36px",
        }}
      >
        {columns.map((column) => (
          <Typography
            key={column.key}
            variant="subtitle2"
            sx={{
              padding: "0px 10px",
              flex: column.flex,
              width: column.width,
              minWidth: column.minWidth,
              maxWidth: column.maxWidth,
            }}
          >
            {column.header}
          </Typography>
        ))}
      </Box>
      {rows.slice(0, 100).map((row, index) => (
        <Box
          key={getRowId(row)}
          display="flex"
          sx={(theme) => ({
            alignItems: "center",
            height: "36px",
            borderTop: `solid 1px ${theme.palette.divider}`,
            ":hover": {
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            },
          })}
        >
          {columns.map((column) => {
            const value = column.getValue({ row });
            return (
              <Box
                key={column.key}
                display="grid"
                sx={{
                  padding: "0px 10px",
                  flex: column.flex,
                  width: column.width,
                  minWidth: column.minWidth,
                  maxWidth: column.maxWidth,
                }}
              >
                {column.render({ row, value })}
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};

export default WeaponTable;
