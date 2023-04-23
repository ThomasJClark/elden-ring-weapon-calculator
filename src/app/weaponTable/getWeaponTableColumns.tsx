import { Box, Link, Tooltip, Typography } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  DamageType,
  allAttributes,
  allDamageTypes,
  allStatusTypes,
} from "../../calculator/calculator";
import {
  damageTypeIcons,
  damageTypeLabels,
  getAttributeLabel,
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
  sortBy: "name",
  header: (
    <Typography component="span" variant="subtitle2">
      Weapon
    </Typography>
  ),
  sx: {
    justifyContent: "start",
  },
  render([weapon, { upgradeLevel }]) {
    const text = `${weapon.name}${upgradeLevel > 0 ? ` +${upgradeLevel}` : ""}`;
    return (
      <Box>
        {weapon.url ? (
          <Link
            variant="button"
            underline="hover"
            href={weapon.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {text}
          </Link>
        ) : (
          <Typography variant="button">{text}</Typography>
        )}
      </Box>
    );
  },
};

const attackColumns = Object.fromEntries(
  [...allDamageTypes, ...allStatusTypes].map((damageType): [DamageType, WeaponTableColumnDef] => [
    damageType,
    {
      key: `${damageType}Attack`,
      sortBy: `${damageType}Attack`,
      header: (
        <Tooltip title={damageTypeLabels.get(damageType)!} placement="top">
          <img src={damageTypeIcons.get(damageType)!} alt="" width={24} height={24} />
        </Tooltip>
      ),
      render([, { attackPower }]) {
        const damageTypeAttack = attackPower[damageType];
        return damageTypeAttack == null ? blankIcon : round(damageTypeAttack);
      },
    },
  ]),
) as Record<DamageType, WeaponTableColumnDef>;

const totalSplitAttackPowerColumn: WeaponTableColumnDef = {
  key: "totalAttack",
  sortBy: "totalAttack",
  header: (
    <Typography component="span" variant="subtitle2">
      Total
    </Typography>
  ),
  render([, { attackPower }]) {
    return round(getTotalAttackPower(attackPower));
  },
};

const totalAttackPowerColumn: WeaponTableColumnDef = {
  key: "totalAttack",
  sortBy: "totalAttack",
  header: (
    <Typography component="span" variant="subtitle2">
      Attack Power
    </Typography>
  ),
  render([, { attackPower }]) {
    return round(getTotalAttackPower(attackPower));
  },
};

const noStatusEffectsColumn: WeaponTableColumnDef = {
  key: "noStatusEffects",
  header: null,
  render() {
    return blankIcon;
  },
};

const scalingColumns: WeaponTableColumnDef[] = allAttributes.map((attribute) => ({
  key: `${attribute}Scaling`,
  sortBy: `${attribute}Scaling`,
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
    sortBy: `${attribute}Requirement`,
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
  statusTypes: readonly DamageType[];
}

export default function getWeaponTableColumns({
  splitDamage,
  statusTypes,
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
            width: 40 * (allDamageTypes.length + 1) + 21,
          },
          header: (
            <Typography component="span" variant="subtitle2">
              Attack Power
            </Typography>
          ),
          columns: [
            ...allDamageTypes.map((damageType) => attackColumns[damageType]),
            totalSplitAttackPowerColumn,
          ],
        }
      : {
          key: "attack",
          sx: {
            width: 128,
          },
          columns: [totalAttackPowerColumn],
        },
    {
      key: "statusEffects",
      sx: {
        width: Math.max(40 * statusTypes.length + 21, 141),
      },
      header: (
        <Typography component="span" variant="subtitle2">
          Status Effects
        </Typography>
      ),
      columns:
        statusTypes.length > 0
          ? statusTypes.map((statusType) => attackColumns[statusType])
          : [noStatusEffectsColumn],
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
