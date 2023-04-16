import { Box, Link, Tooltip, Typography } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import { allAttributes, allDamageTypes, allStatusTypes } from "../../calculator/calculator";
import {
  getAttributeLabel,
  getDamageTypeIcon,
  getDamageTypeLabel,
  getStatusTypeIcon,
  getScalingLabel,
  getShortAttributeLabel,
  getTotalAttackPower,
} from "../uiUtils";
import { WeaponTableColumnDef, WeaponTableColumnGroupDef } from "./WeaponTable";

/**
 * @returns the given value truncated to an integer
 */
function round(value: number) {
  // Add a small offset to prevent off-by-ones due to floating point error
  return Math.floor(value + 0.000000001);
}

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
  render([weapon, { upgradeLevel }]) {
    return (
      <Box>
        <Link
          variant="button"
          underline="hover"
          href={`https://eldenring.wiki.fextralife.com/${weapon.weaponName.replaceAll(" ", "+")}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {weapon.name}
          {upgradeLevel > 0 && ` +${upgradeLevel}`}
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
      render([, { attackPower }]) {
        const damageTypeAttackPower = attackPower[damageType];
        return damageTypeAttackPower == null ? blankIcon : round(damageTypeAttackPower);
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
    render([, { attackPower }]) {
      return round(getTotalAttackPower(attackPower));
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
  render([, { attackPower }]) {
    return round(getTotalAttackPower(attackPower));
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
    return buildup === 0 ? blankIcon : round(buildup);
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
  render([weapon, { upgradeLevel }]) {
    const scaling = weapon.attributeScaling[upgradeLevel][attribute] ?? 0;
    return scaling === 0 ? (
      blankIcon
    ) : (
      <Tooltip title={`${Math.round(scaling * 1000) / 10}%`} placement="top">
        <span>{getScalingLabel(scaling)}</span>
      </Tooltip>
    );
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

interface WeaponTableColumnsOptions {
  splitDamage: boolean;
}

export default function getWeaponTableColumns({
  splitDamage,
}: WeaponTableColumnsOptions): WeaponTableColumnGroupDef[] {
  return [
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
  ];
}
