import { Typography } from "@mui/material";
import {
  AttackPowerType,
  allAttackPowerTypes,
  allAttributes,
  allDamageTypes,
  allStatusTypes,
} from "../../calculator/calculator";
import {
  damageTypeIcons,
  damageTypeLabels,
  getAttributeLabel,
  getShortAttributeLabel,
  getTotalDamageAttackPower,
} from "../uiUtils";
import type { WeaponTableColumnDef, WeaponTableColumnGroupDef } from "./WeaponTable";
import {
  blankIcon,
  WeaponNameRenderer,
  ScalingTierRenderer,
  AttributeRequirementRenderer,
} from "./tableRenderers";

/**
 * @returns the given value truncated to an integer
 */
function round(value: number) {
  // Add a small offset to prevent off-by-ones due to floating point error
  return Math.floor(value + 0.000000001);
}

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
    return <WeaponNameRenderer weapon={weapon} upgradeLevel={upgradeLevel} />;
  },
};

const attackColumns = Object.fromEntries(
  allAttackPowerTypes.map((attackPowerType): [AttackPowerType, WeaponTableColumnDef] => [
    attackPowerType,
    {
      key: `${attackPowerType}Attack`,
      sortBy: `${attackPowerType}Attack`,
      header: damageTypeIcons.has(attackPowerType) ? (
        <img
          src={damageTypeIcons.get(attackPowerType)!}
          alt={damageTypeLabels.get(attackPowerType)!}
          title={damageTypeLabels.get(attackPowerType)!}
          width={24}
          height={24}
        />
      ) : (
        <Typography component="span" variant="subtitle2">
          {damageTypeLabels.get(attackPowerType)}
        </Typography>
      ),
      render([, { attackPower }]) {
        const damageTypeAttack = attackPower[attackPowerType];
        return damageTypeAttack == null ? blankIcon : round(damageTypeAttack);
      },
    },
  ]),
) as Record<AttackPowerType, WeaponTableColumnDef>;

const totalSplitAttackPowerColumn: WeaponTableColumnDef = {
  key: "totalAttack",
  sortBy: "totalAttack",
  header: (
    <Typography component="span" variant="subtitle2">
      Total
    </Typography>
  ),
  render([, { attackPower }]) {
    return round(getTotalDamageAttackPower(attackPower));
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
    return round(getTotalDamageAttackPower(attackPower));
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
    <Typography
      component="span"
      variant="subtitle2"
      title={`${getAttributeLabel(attribute)} Scaling`}
    >
      {getShortAttributeLabel(attribute)}
    </Typography>
  ),
  render([weapon, { upgradeLevel }]) {
    return (
      <ScalingTierRenderer weapon={weapon} upgradeLevel={upgradeLevel} attribute={attribute} />
    );
  },
}));

const requirementColumns = allAttributes.map(
  (attribute): WeaponTableColumnDef => ({
    key: `${attribute}Requirement`,
    sortBy: `${attribute}Requirement`,
    header: (
      <Typography
        component="span"
        variant="subtitle2"
        title={`${getAttributeLabel(attribute)} Requirement`}
      >
        {getShortAttributeLabel(attribute)}
      </Typography>
    ),
    render([weapon, { ineffectiveAttributes }]) {
      return (
        <AttributeRequirementRenderer
          weapon={weapon}
          attribute={attribute}
          ineffective={ineffectiveAttributes.includes(attribute)}
        />
      );
    },
  }),
);

interface WeaponTableColumnsOptions {
  splitDamage: boolean;
  attackPowerTypes: ReadonlySet<AttackPowerType>;
}

export default function getWeaponTableColumns({
  splitDamage,
  attackPowerTypes,
}: WeaponTableColumnsOptions): WeaponTableColumnGroupDef[] {
  const includeSpellScaling = attackPowerTypes.has(AttackPowerType.SPELL_SCALING);
  const includedStatusTypes = allStatusTypes.filter((statusType) =>
    attackPowerTypes.has(statusType),
  );

  return [
    {
      key: "name",
      sx: { flex: 1, minWidth: 320 },
      columns: [nameColumn],
    },
    ...(includeSpellScaling
      ? [
          {
            key: "spellScaling",
            sx: {
              width: 128,
            },
            columns: [attackColumns[AttackPowerType.SPELL_SCALING]],
          },
        ]
      : []),
    splitDamage
      ? {
          key: "attack",
          sx: {
            width: 40 * (allDamageTypes.length + 1) + 21,
          },
          header: "Attack Power",
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
        width: Math.max(40 * includedStatusTypes.length + 21, 141),
      },
      header: "Status Effects",
      columns:
        includedStatusTypes.length > 0
          ? includedStatusTypes.map((statusType) => attackColumns[statusType])
          : [noStatusEffectsColumn],
    },
    {
      key: "scaling",
      sx: {
        width: 36 * scalingColumns.length + 21,
      },
      header: "Attribute Scaling",
      columns: scalingColumns,
    },
    {
      key: "requirements",
      sx: {
        width: 36 * requirementColumns.length + 21,
      },
      header: "Attributes Required",
      columns: requirementColumns,
    },
  ];
}
