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
  getEnemyTypeLabel,
  getReforgedEnemyTypeLabel,
  enemyTypeLabelFuncByRegulation,
  getShortAttributeLabel,
  getTotalDamageAttackPower,
} from "../uiUtils.ts";
import type { WeaponTableColumnDef, WeaponTableColumnGroupDef } from "./WeaponTable.tsx";
import {
  WeaponNameRenderer,
  ScalingRenderer,
  AttributeRequirementRenderer,
  AttackPowerRenderer,
  AttackPowerWithBaseRenderer,
  ScalingPercentRenderer,
  ScalingPercentWithBaseRenderer,
  CutRateRenderer,
  BowDistRenderer,
  WeakRateRenderer,
} from "./tableRenderers.tsx";
import { allWeakRateTypes, WeakRateType } from "../../calculator/weakRates.ts";

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

const attackWithBaseColumns = Object.fromEntries(
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
      render([, { attackPower, baseAttackPower, ineffectiveAttackPowerTypes }]) {
        if (attackPower[attackPowerType] != baseAttackPower[attackPowerType]) {
          return (
            <AttackPowerWithBaseRenderer
              value={attackPower[attackPowerType]}
              valueBase={baseAttackPower[attackPowerType]}
              ineffective={ineffectiveAttackPowerTypes.includes(attackPowerType)}
            />
          );
        } else {
          return (
            <AttackPowerRenderer
              value={attackPower[attackPowerType]}
              ineffective={ineffectiveAttackPowerTypes.includes(attackPowerType)}
            />
          );
        }
      },
    },
  ]),
) as Record<AttackPowerType, WeaponTableColumnDef>;

const scalingPercentColumns = Object.fromEntries(
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
      render([, { scalingPercent, ineffectiveAttackPowerTypes }]) {
        return (
          <ScalingPercentRenderer
            value={scalingPercent[attackPowerType]}
            ineffective={ineffectiveAttackPowerTypes.includes(attackPowerType)}
          />
        );
      },
    },
  ]),
) as Record<AttackPowerType, WeaponTableColumnDef>;

const scalingPercentWithBaseColumns = Object.fromEntries(
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
      render([, { scalingPercent, baseAttackPower, ineffectiveAttackPowerTypes }]) {
        if (scalingPercent[attackPowerType] != 0) {
          return (
            <ScalingPercentWithBaseRenderer
              value={scalingPercent[attackPowerType]}
              valueBase={baseAttackPower[attackPowerType]}
              ineffective={ineffectiveAttackPowerTypes.includes(attackPowerType)}
            />
          );
        } else {
          return (
            <ScalingPercentRenderer
              value={scalingPercent[attackPowerType]}
              ineffective={ineffectiveAttackPowerTypes.includes(attackPowerType)}
            />
          );
        }
      },
    },
  ]),
) as Record<AttackPowerType, WeaponTableColumnDef>;

const cutRateColumns = Object.fromEntries(
  allAttackPowerTypes.map((attackPowerType): [AttackPowerType, WeaponTableColumnDef] => [
    attackPowerType,
    {
      key: `${attackPowerType}GuardCutRate`,
      sortBy: `${attackPowerType}GuardCutRate`,
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
      render([, { guardCutRate }]) {
        return (
          <CutRateRenderer
            value={guardCutRate[attackPowerType]}
          />
        );
      },
    },
  ]),
) as Record<AttackPowerType, WeaponTableColumnDef>;

const stabilityColumn: WeaponTableColumnDef = {
  key: "stability",
  sortBy: "stability",
  header: (
    <Typography component="span" variant="subtitle2">
      Stability
    </Typography>
  ),
  render([, { stability }]) {
    return (
      <CutRateRenderer
        value={Math.floor(stability)}
      />
    );
  },
};

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

const weakRateReforgedColumns: WeaponTableColumnDef[] = allWeakRateTypes.map((type) => ({
  key: `${type}WeakRate`,
  sortBy: `${type}WeakRate`,
  header: (
    <Typography
      component="span"
      variant="subtitle2"
      title={`Bonus vs. ${getReforgedEnemyTypeLabel(type)}`}
    >
      {getReforgedEnemyTypeLabel(type)}
    </Typography>
  ),
  render([weapon]) {
    return (
      <WeakRateRenderer
        weapon={weapon}
        type={type}
      />
    );
  },
}));

const weakRateColumns: WeaponTableColumnDef[] = allWeakRateTypes.map((type) => ({
  key: `${type}WeakRate`,
  sortBy: `${type}WeakRate`,
  header: (
    <Typography
      component="span"
      variant="subtitle2"
      title={`Bonus vs. ${getEnemyTypeLabel(type)}`}
    >
      {getEnemyTypeLabel(type)}
    </Typography>
  ),
  render([weapon]) {
    return (
      <WeakRateRenderer
        weapon={weapon}
        type={type}
      />
    );
  },
}));

const weakRateColumnsByRegulation: Record<string, WeaponTableColumnDef[]> = {
  latest: weakRateColumns,
  reforged: weakRateReforgedColumns,
  convergence: weakRateColumns,
  clevers: weakRateColumns,
} as const;

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

const miscColumns: WeaponTableColumnDef[] = [
  {
    key: "crit",
    sortBy: "crit",
    header: (
      <Typography
        component="span"
        variant="subtitle2"
        title={"Critical Damage"}
      >
        Critical
      </Typography>
    ),
    render([weapon]) {
      return (
        <>{Math.round(weapon.crit + 100)}</>
      );
    },
  },
  {
    key: "poise",
    sortBy: "poise",
    header: (
      <Typography
        component="span"
        variant="subtitle2"
        title={"Poise Damage"}
      >
        Poise
      </Typography>
    ),
    render([weapon]) {
      return (
        <>{Math.round(weapon.poise * 10)}</>
      );
    },
  },
  {
    key: "stamDmg",
    sortBy: "stamDmg",
    header: (
      <Typography
        component="span"
        variant="subtitle2"
        title={"Stamina Damage"}
      >
        Stamina
      </Typography>
    ),
    render([weapon]) {
      return (
        <>{Math.round(weapon.stamDmg / 10)}</>
      );
    },
  },
  {
    key: "weight",
    sortBy: "weight",
    header: (
      <Typography
        component="span"
        variant="subtitle2"
        title={"Weight"}
      >
        Weight
      </Typography>
    ),
    render([weapon]) {
      return (
        <>{weapon.weight}</>
      );
    },
  },
  {
    key: "stamCost",
    sortBy: "stamCost",
    header: (
      <Typography
        component="span"
        variant="subtitle2"
        title={"Stamina Cost"}
      >
        Stam.Cost
      </Typography>
    ),
    render([weapon]) {
      return (
        <>{Math.round(weapon.stamCost * 100)}%</>
      );
    },
  },
  {
    key: "bowDist",
    sortBy: "bowDist",
    header: (
      <Typography
        component="span"
        variant="subtitle2"
        title={"Range Modifier"}
      >
        Range
      </Typography>
    ),
    render([weapon]) {
      return (
        <BowDistRenderer
          value={weapon.bowDist}
        />
      );
    },
  },
];

const miscReforgedColumns: WeaponTableColumnDef[] = [
  {
    key: "weightRate",
    sortBy: "weightRate",
    header: (
      <Typography
        component="span"
        variant="subtitle2"
        title={"Weight Rate"}
      >
        Wgt.Rate
      </Typography>
    ),
    render([weapon]) {
      return (
        <>{weapon.weightRate}</>
      );
    },
  },
];

interface WeaponTableColumnsOptions {
  regulationVersionName: string;
  splitDamage: boolean;
  showBaseDamage: boolean;
  splitSpellScaling: boolean;
  numericalScaling: boolean;
  showScalingAsPercent: boolean;
  attackPowerTypes: ReadonlySet<AttackPowerType>;
  weakRateTypes: ReadonlySet<WeakRateType>;
  spellScaling: boolean;
}

export default function getWeaponTableColumns({
  regulationVersionName,
  splitDamage,
  showBaseDamage,
  splitSpellScaling,
  numericalScaling,
  showScalingAsPercent,
  attackPowerTypes,
  weakRateTypes,
  spellScaling,
}: WeaponTableColumnsOptions): WeaponTableColumnGroupDef[] {
  const includedStatusTypes = allStatusTypes.filter((statusType) =>
    attackPowerTypes.has(statusType)
  );
  const includedWeakRateTypes = allWeakRateTypes.filter((weakRateType) =>
    weakRateTypes.has(weakRateType) && !enemyTypeLabelFuncByRegulation[regulationVersionName](weakRateType).includes("unused")
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
          width: ((showBaseDamage ? 85 : 40) + (showScalingAsPercent ? 22 : 0)) * (allDamageTypes.length + 1) + 27,
        },
        header: "Attack Power",
        columns: [
          ...allDamageTypes.map((damageType) => (showBaseDamage ? (showScalingAsPercent ? scalingPercentWithBaseColumns : attackWithBaseColumns) : (showScalingAsPercent ? scalingPercentColumns : attackColumns))[damageType]),
          ...(showScalingAsPercent && !showBaseDamage ? [] : [totalSplitAttackPowerColumn]),
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
        width: (numericalScaling ? 54 : 36) * scalingColumns.length + 21,
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
    {
      key: "misc",
      sx: {
        width: 72 * miscColumns.length + 21,
      },
      header: "Other Properties",
      columns: [ ...miscColumns, ...(regulationVersionName == "reforged" ? [...miscReforgedColumns] : []) ],
    },
    ...(includedWeakRateTypes.length > 0 ?
      [
        {
          key: "weakRate",
          sx: {
            width: 72 * includedWeakRateTypes.length + 21,
          },
          header: "Enemy Type Damage",
          columns: includedWeakRateTypes.map((weakRateType) => weakRateColumnsByRegulation[regulationVersionName][weakRateType]),
        }
      ]
      : []),
    {
      key: "guardCutRate",
      sx: {
        width: 54 * (allAttackPowerTypes.length + 1) + 27,
      },
      header: "Guard Properties",
      columns: [stabilityColumn, ...allAttackPowerTypes.map((damageType) => (cutRateColumns)[damageType])],
    },
    {
      key: "nameEnd",
      sx: { flex: 1, minWidth: 320 },
      columns: [nameColumn],
    },
  ];
}
