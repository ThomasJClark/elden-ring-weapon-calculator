import { Typography } from "@mui/material";
import {
  AttackPowerType,
  allAttackPowerTypes,
  allAttributes,
  allDamageTypes,
  allStatusTypes,
} from "../../calculator/calculator.ts";
import {
  damageTypeIcons,
  damageTypeLabels,
  getAttributeLabel,
  getShortAttributeLabel,
  getTotalDamageAttackPower,
} from "../uiUtils.ts";
import type { WeaponTableColumnDef, WeaponTableColumnGroupDef } from "./WeaponTable.tsx";
import {
  WeaponNameRenderer,
  ScalingRenderer,
  AttributeRequirementRenderer,
  AttackPowerRenderer,
} from "./tableRenderers.tsx";

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

const splitSpellScalingColumns: WeaponTableColumnDef[] = allDamageTypes.map((damageType) => ({
  key: `${damageType}SpellScaling`,
  sortBy: `${damageType}SpellScaling`,
  header: damageTypeIcons.has(damageType) ? (
    <img
      src={damageTypeIcons.get(damageType)!}
      alt={damageTypeLabels.get(damageType)!}
      title={damageTypeLabels.get(damageType)!}
      width={24}
      height={24}
    />
  ) : (
    <Typography component="span" variant="subtitle2">
      {damageTypeLabels.get(damageType)}
    </Typography>
  ),
  render([, { spellScaling, ineffectiveAttackPowerTypes }]) {
    return (
      <AttackPowerRenderer
        value={spellScaling?.[damageType]}
        ineffective={ineffectiveAttackPowerTypes.includes(damageType)}
      />
    );
  },
}));

const spellScalingColumn: WeaponTableColumnDef = {
  key: "spellScaling",
  sortBy: `${AttackPowerType.MAGIC}SpellScaling`,
  header: (
    <Typography component="span" variant="subtitle2">
      Spell scaling
    </Typography>
  ),
  render([weapon, { spellScaling, ineffectiveAttackPowerTypes }]) {
    let attackPowerType: AttackPowerType | undefined;
    if (weapon.sorceryTool) {
      attackPowerType = AttackPowerType.MAGIC;
    } else if (weapon.incantationTool) {
      attackPowerType = AttackPowerType.HOLY;
    }

    return (
      <AttackPowerRenderer
        value={attackPowerType != null ? spellScaling?.[attackPowerType] : undefined}
        ineffective={
          attackPowerType != null && ineffectiveAttackPowerTypes.includes(attackPowerType)
        }
      />
    );
  },
};

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

interface WeaponTableColumnsOptions {
  splitDamage: boolean;
  splitSpellScaling: boolean;
  numericalScaling: boolean;
  attackPowerTypes: ReadonlySet<AttackPowerType>;
  spellScaling: boolean;
}

export default function getWeaponTableColumns({
  splitDamage,
  splitSpellScaling,
  numericalScaling,
  attackPowerTypes,
  spellScaling,
}: WeaponTableColumnsOptions): WeaponTableColumnGroupDef[] {
  const includedStatusTypes = allStatusTypes.filter((statusType) =>
    attackPowerTypes.has(statusType),
  );

  let spellScalingColumnGroup: WeaponTableColumnGroupDef | undefined;
  if (spellScaling) {
    if (splitSpellScaling) {
      spellScalingColumnGroup = {
        key: "spellScaling",
        sx: {
          width: 40 * splitSpellScalingColumns.length + 27,
        },
        header: "Spell Scaling",
        columns: splitSpellScalingColumns,
      };
    } else {
      spellScalingColumnGroup = {
        key: "spellScaling",
        sx: {
          width: 128,
        },
        columns: [spellScalingColumn],
      };
    }
  }

  return [
    {
      key: "name",
      sx: { flex: 1, minWidth: 320 },
      columns: [nameColumn],
    },
    ...(spellScalingColumnGroup ? [spellScalingColumnGroup] : []),
    splitDamage
      ? {
          key: "attack",
          sx: {
            width: 40 * (allDamageTypes.length + 1) + 27,
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
    ...(includedStatusTypes.length > 0
      ? [
          {
            key: "statusEffects",
            sx: {
              width: Math.max(40 * includedStatusTypes.length + 21, 141),
            },
            header: "Status Effects",
            columns: includedStatusTypes.map((statusType) => attackColumns[statusType]),
          },
        ]
      : []),
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
