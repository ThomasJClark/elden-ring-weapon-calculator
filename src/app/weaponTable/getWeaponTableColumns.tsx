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
  ScalingRenderer,
  AttributeRequirementRenderer,
  AttackPowerRenderer,
} from "./tableRenderers";

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
      render([, { attackPower, ineffectiveAttackPowerTypes }]) {
        return (
          <AttackPowerRenderer
            value={attackPower[attackPowerType]}
            ineffective={ineffectiveAttackPowerTypes.includes(attackPowerType)}
          />
        );
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
  render([, { attackPower, ineffectiveAttackPowerTypes }]) {
    return (
      <AttackPowerRenderer
        value={getTotalDamageAttackPower(attackPower)}
        ineffective={ineffectiveAttackPowerTypes.some((attackPowerType) =>
          allDamageTypes.includes(attackPowerType),
        )}
      />
    );
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
  render([, { attackPower, ineffectiveAttackPowerTypes }]) {
    return (
      <AttackPowerRenderer
        value={getTotalDamageAttackPower(attackPower)}
        ineffective={ineffectiveAttackPowerTypes.some((attackPowerType) =>
          allDamageTypes.includes(attackPowerType),
        )}
      />
    );
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
    return <ScalingRenderer weapon={weapon} upgradeLevel={upgradeLevel} attribute={attribute} />;
  },
}));

const numericalScalingColumns: WeaponTableColumnDef[] = allAttributes.map((attribute) => ({
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
      <ScalingRenderer
        weapon={weapon}
        upgradeLevel={upgradeLevel}
        attribute={attribute}
        numerical
      />
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

const convergenceSpellAffinityColumn: WeaponTableColumnDef = {
  key: "convergenceSpellAffinity",
  sortBy: "convergenceSpellAffinity",
  header: (
    <Typography component="span" variant="subtitle2">
      Affinity
    </Typography>
  ),
  sx: {
    flex: "0 0 138px",
    textAlign: "left",
    justifyContent: "start",
  },
  render([{ convergenceData }]) {
    return convergenceData?.spellAffinity ?? blankIcon;
  },
};

const convergenceSpellTierColumn: WeaponTableColumnDef = {
  key: "convergenceSpellTier",
  sortBy: "convergenceSpellTier",
  header: (
    <Typography component="span" variant="subtitle2">
      Tier
    </Typography>
  ),
  render([{ convergenceData }]) {
    return convergenceData?.spellTier ?? blankIcon;
  },
};

interface WeaponTableColumnsOptions {
  splitDamage: boolean;
  numericalScaling: boolean;
  attackPowerTypes: ReadonlySet<AttackPowerType>;
  includeConvergenceSpellData: boolean;
}

export default function getWeaponTableColumns({
  splitDamage,
  numericalScaling,
  attackPowerTypes,
  includeConvergenceSpellData,
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
    ...(includeConvergenceSpellData
      ? [
          {
            key: "spellScaling",
            header: "Spellcasting Power",
            sx: {
              width: 200,
            },
            columns: [convergenceSpellAffinityColumn, convergenceSpellTierColumn],
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
        width: (numericalScaling ? 40 : 36) * scalingColumns.length + 21,
      },
      header: "Attribute Scaling",
      columns: numericalScaling ? numericalScalingColumns : scalingColumns,
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
