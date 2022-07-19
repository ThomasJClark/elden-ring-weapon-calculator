import { useMemo } from "react";
import { Box, Link, Tooltip, Typography } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import { allAttributes, allDamageTypes, allStatusTypes } from "../../calculator/calculator";
import {
  getAttributeLabel,
  getDamageTypeAttackPower,
  getDamageTypeIcon,
  getDamageTypeLabel,
  getStatusTypeIcon,
  getScalingLabel,
  getShortAttributeLabel,
  getTotalAttackPower,
} from "../uiUtils";
import { useAppState } from "../AppState";
import { WeaponTableColumnDef, WeaponTableColumnGroupDef } from "./WeaponTable";

const blankIcon = <RemoveIcon color="disabled" fontSize="small" />;

const nameColumn: WeaponTableColumnDef = {
  key: "name",
  header: (
    <Typography component="span" variant="subtitle2">
      Weapon
    </Typography>
  ),
  sx: {
    justifyContent: "start",
  },
  render([weapon]) {
    return (
      <Box>
        <Link
          variant="button"
          underline="hover"
          href={`https://eldenring.wiki.fextralife.com/${weapon.metadata.weaponName.replaceAll(
            " ",
            "+",
          )}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {weapon.name}
        </Link>
      </Box>
    );
  },
};

const damageAttackPowerColumns: WeaponTableColumnDef[] = [
  ...allDamageTypes.map(
    (damageType): WeaponTableColumnDef => ({
      key: `${damageType}Attack`,
      header: (
        <Tooltip title={`${getDamageTypeLabel(damageType)} Attack`} placement="top">
          <img src={getDamageTypeIcon(damageType)} alt="" width={24} height={24} />
        </Tooltip>
      ),
      render([, { attackRating }]) {
        const attackPower = getDamageTypeAttackPower(attackRating, damageType);
        return attackPower === 0 ? blankIcon : Math.floor(attackPower);
      },
    }),
  ),
  {
    key: "totalAttack",
    header: (
      <Typography component="span" variant="subtitle2">
        Total
      </Typography>
    ),
    render([, { attackRating }]) {
      return Math.floor(getTotalAttackPower(attackRating));
    },
  },
];

const totalAttackPowerColumn: WeaponTableColumnDef = {
  key: "totalAttack",
  header: (
    <Typography component="span" variant="subtitle2">
      Attack Power
    </Typography>
  ),
  render([, { attackRating }]) {
    return Math.floor(getTotalAttackPower(attackRating));
  },
};

const passiveEffectsColumns: WeaponTableColumnDef[] = allStatusTypes.map((statusType) => ({
  key: `${statusType}Buildup`,
  header: (
    <Tooltip title={`${statusType} Buildup`} placement="top">
      <img src={getStatusTypeIcon(statusType)} alt="" width={24} height={24} />
    </Tooltip>
  ),
  render([, { statusBuildup }]) {
    const buildup = statusBuildup[statusType] ?? 0;
    return buildup === 0 ? blankIcon : Math.floor(buildup);
  },
}));

const scalingColumns: WeaponTableColumnDef[] = allAttributes.map((attribute) => ({
  key: `${attribute}Scaling`,
  header: (
    <Tooltip title={`${getAttributeLabel(attribute)} Scaling`} placement="top">
      <Typography component="span" variant="subtitle2">
        {getShortAttributeLabel(attribute)}
      </Typography>
    </Tooltip>
  ),
  render([weapon]) {
    const scaling = weapon.attributeScaling[attribute] ?? 0;
    return scaling === 0 ? blankIcon : getScalingLabel(scaling);
  },
}));

const requirementColumns = allAttributes.map(
  (attribute): WeaponTableColumnDef => ({
    key: `${attribute}Requirement`,
    header: (
      <Tooltip title={`${getAttributeLabel(attribute)} Requirement`} placement="top">
        <Typography component="span" variant="subtitle2">
          {getShortAttributeLabel(attribute)}
        </Typography>
      </Tooltip>
    ),
    render([weapon, { ineffectiveAttributes }]) {
      const requirement = weapon.requirements[attribute] ?? 0;

      if (requirement === 0) {
        return blankIcon;
      }

      if (ineffectiveAttributes.includes(attribute)) {
        return (
          <Tooltip
            title={`Unable to wield this weapon effectively with present ${getAttributeLabel(
              attribute,
            )} stat`}
            placement="top"
          >
            <Typography sx={{ color: (theme) => theme.palette.error.main }}>
              {requirement}
            </Typography>
          </Tooltip>
        );
      }

      return requirement;
    },
  }),
);

export default function useWeaponTableColumns(): WeaponTableColumnGroupDef[] {
  const { splitDamage } = useAppState();
  return useMemo(
    () => [
      {
        key: "name",
        sx: { flex: 1, minWidth: 320 },
        columns: [nameColumn],
      },
      splitDamage
        ? {
            key: "attack",
            sx: {
              width: 40 * damageAttackPowerColumns.length + 21,
            },
            header: (
              <Typography component="span" variant="subtitle2">
                Attack Power
              </Typography>
            ),
            columns: damageAttackPowerColumns,
          }
        : {
            key: "attack",
            sx: {
              width: 128,
            },
            columns: [totalAttackPowerColumn],
          },
      {
        key: "passives",
        sx: {
          width: 40 * passiveEffectsColumns.length + 21,
        },
        header: (
          <Typography component="span" variant="subtitle2">
            Passive Effects
          </Typography>
        ),
        columns: passiveEffectsColumns,
      },
      {
        key: "scaling",
        sx: {
          width: 36 * scalingColumns.length + 21,
        },
        header: (
          <Typography component="span" variant="subtitle2">
            Attribute Scaling
          </Typography>
        ),
        columns: scalingColumns,
      },
      {
        key: "requirements",
        sx: {
          width: 36 * requirementColumns.length + 21,
        },
        header: (
          <Typography component="span" variant="subtitle2">
            Attribute Requirements
          </Typography>
        ),
        columns: requirementColumns,
      },
    ],
    [splitDamage],
  );
}
