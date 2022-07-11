import { useMemo } from "react";
import { Box, Link, Tooltip, Typography } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import { allAttributes, allDamageTypes, allPassiveTypes } from "../calculator/calculator";
import {
  getAttributeLabel,
  getDamageTypeAttackPower,
  getDamageTypeIcon,
  getDamageTypeLabel,
  getPassiveTypeIcon,
  getScalingLabel,
  getShortAttributeLabel,
  getTotalAttackPower,
} from "./uiUtils";
import { useAppState } from "./AppState";
import { WeaponTableColumn } from "./WeaponTable";

const blankIcon = <RemoveIcon color="disabled" fontSize="small" />;

const nameColumn: WeaponTableColumn = {
  key: "name",
  header: "Weapon",
  sx: {
    flex: 1,
    minWidth: 320,
  },
  render([weapon]) {
    return (
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
    );
  },
};

const damageAttackPowerColumns: WeaponTableColumn[] = allDamageTypes.map((damageType) => ({
  key: `${damageType}AttackPower`,
  header: (
    <Tooltip title={`${getDamageTypeLabel(damageType)} Attack`}>
      <img src={getDamageTypeIcon(damageType)} alt="" width={24} height={24} />
    </Tooltip>
  ),
  width: 40,
  render([, { attackRating }]) {
    const attackPower = getDamageTypeAttackPower(attackRating, damageType);
    return attackPower === 0 ? blankIcon : Math.floor(attackPower);
  },
}));

const totalAttackPowerColumn: WeaponTableColumn = {
  key: "totalAttackPower",
  header: "Attack Power",
  width: 128,
  render([, { attackRating }]) {
    return Math.floor(getTotalAttackPower(attackRating));
  },
};

const passiveColumns: WeaponTableColumn[] = allPassiveTypes.map((passiveType, i, arr) => ({
  key: `${passiveType}Buildup`,
  header: (
    <Tooltip title={`${passiveType} Buildup`}>
      <img src={getPassiveTypeIcon(passiveType)} alt="" width={24} height={24} />
    </Tooltip>
  ),
  width: 40,
  render([, { passiveBuildup }]) {
    const buildup = passiveBuildup[passiveType] ?? 0;
    return buildup === 0 ? blankIcon : Math.floor(buildup);
  },
}));

const scalingColumns: WeaponTableColumn[] = allAttributes.map((attribute) => ({
  key: `${attribute}Scaling`,
  width: 40,
  sx: {
    justifyContent: "center",
  },
  header: (
    <Tooltip title={`${getAttributeLabel(attribute)} Scaling`}>
      <span>{getShortAttributeLabel(attribute)}</span>
    </Tooltip>
  ),
  render([weapon]) {
    const scaling = weapon.attributeScaling[attribute] ?? 0;
    return scaling === 0 ? blankIcon : getScalingLabel(scaling);
  },
}));

const requirementColumns = allAttributes.map(
  (attribute): WeaponTableColumn => ({
    key: `${attribute}Requirement`,
    width: 40,
    sx: {
      justifyContent: "center",
    },
    header: (
      <Tooltip title={`${getAttributeLabel(attribute)} Requirement`}>
        <span>{getShortAttributeLabel(attribute)}</span>
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

export default function useWeaponTableColumns(): WeaponTableColumn[] {
  const { splitDamage } = useAppState();
  return useMemo(
    () => [
      nameColumn,
      ...(splitDamage ? damageAttackPowerColumns : [totalAttackPowerColumn]),
      ...passiveColumns,
      ...scalingColumns,
      ...requirementColumns,
    ],
    [splitDamage],
  );
}
