import { useMemo } from "react";
import { Box, Link, Tooltip, Typography } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import { allAttributes, allDamageTypes, allPassiveTypes } from "../../calculator/calculator";
import {
  getAttributeLabel,
  getDamageTypeAttackPower,
  getDamageTypeIcon,
  getDamageTypeLabel,
  getPassiveTypeIcon,
  getScalingLabel,
  getShortAttributeLabel,
  getTotalAttackPower,
} from "../uiUtils";
import { useAppState } from "../AppState";
import { WeaponTableColumnDef } from "./WeaponTable";

const blankIcon = <RemoveIcon color="disabled" fontSize="small" />;

const nameColumn: WeaponTableColumnDef = {
  key: "name",
  header: (
    <Typography component="span" variant="subtitle2">
      Weapon
    </Typography>
  ),
  sx: {
    flex: 1,
    minWidth: 320,
    justifyContent: "start",
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

const damageAttackPowerColumns: WeaponTableColumnDef[] = allDamageTypes.map((damageType) => ({
  key: `${damageType}Attack`,
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

const totalAttackPowerColumn: WeaponTableColumnDef = {
  key: "totalAttack",
  header: (
    <Typography component="span" variant="subtitle2">
      Attack Power
    </Typography>
  ),
  sx: {
    justifyContent: "start",
  },
  width: 128,
  render([, { attackRating }]) {
    return Math.floor(getTotalAttackPower(attackRating));
  },
};

const passiveColumns: WeaponTableColumnDef[] = allPassiveTypes.map((passiveType, i, arr) => ({
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

const scalingColumns: WeaponTableColumnDef[] = allAttributes.map((attribute) => ({
  key: `${attribute}Scaling`,
  width: 40,
  sx: {
    justifyContent: "center",
  },
  header: (
    <Tooltip title={`${getAttributeLabel(attribute)} Scaling`}>
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
    width: 40,
    sx: {
      justifyContent: "center",
    },
    header: (
      <Tooltip title={`${getAttributeLabel(attribute)} Requirement`}>
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

export default function useWeaponTableColumns(): WeaponTableColumnDef[] {
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
