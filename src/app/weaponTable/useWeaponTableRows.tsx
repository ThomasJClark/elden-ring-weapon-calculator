import { useDeferredValue, useMemo } from "react";
import getWeaponAttack, {
  allDamageTypes,
  allStatusTypes,
  AttackPowerType,
  WeaponType,
  type Attributes,
  type Weapon,
} from "../../calculator/calculator";
import filterWeapons from "../../search/filterWeapons";
import { type WeaponTableRowData, type WeaponTableRowGroup } from "./WeaponTable";
import { type SortBy, sortWeapons } from "../../search/sortWeapons";
import { type RegulationVersion } from "../useWeapons";
import {
  allWeaponTypes,
  weaponTypeLabels,
  maxRegularUpgradeLevel,
  maxSpecialUpgradeLevel,
  toSpecialUpgradeLevel,
} from "../uiUtils";

interface WeaponTableRowsOptions {
  weapons: readonly Weapon[];
  regulationVersion: RegulationVersion;
  offset: number;
  limit: number;
  sortBy: SortBy;
  reverse: boolean;
  affinityIds: readonly number[];
  weaponTypes: readonly WeaponType[];
  attributes: Attributes;
  effectiveOnly: boolean;
  twoHanding: boolean;
  upgradeLevel: number;
  groupWeaponTypes: boolean;
}

interface WeaponTableRowsResult {
  rowGroups: readonly WeaponTableRowGroup[];

  /** Attack power types included in at least one weapon in the filtered results */
  attackPowerTypes: ReadonlySet<AttackPowerType>;

  total: number;
}

/**
 * Filter, sort, and paginate the weapon list based on the current selections
 */
const useWeaponTableRows = ({
  weapons,
  regulationVersion,
  offset,
  limit,
  upgradeLevel: regularUpgradeLevel,
  groupWeaponTypes,
  sortBy,
  reverse,
  ...options
}: WeaponTableRowsOptions): WeaponTableRowsResult => {
  // Defer filtering based on app state changes because this can be CPU intensive if done while
  // busy rendering
  const attributes = useDeferredValue(options.attributes);
  const twoHanding = useDeferredValue(options.twoHanding);
  const weaponTypes = useDeferredValue(options.weaponTypes);
  const affinityIds = useDeferredValue(options.affinityIds);
  const effectiveOnly = useDeferredValue(options.effectiveOnly);

  const specialUpgradeLevel = toSpecialUpgradeLevel(regularUpgradeLevel);

  // Determine which weapon types can never be given an affinity. It's convenient for them to
  // show up under both "Standard" and "Unique" filtering options
  const uninfusableWeaponTypes = useMemo(() => {
    const tmp = new Set(allWeaponTypes);
    for (const weapon of weapons) {
      if (weapon.affinityId !== 0 && weapon.affinityId !== -1) {
        tmp.delete(weapon.weaponType);
      }
    }
    return tmp;
  }, [weapons]);

  const [filteredRows, attackPowerTypes] = useMemo<
    [WeaponTableRowData[], Set<AttackPowerType>]
  >(() => {
    const includedDamageTypes = new Set<AttackPowerType>();

    const filteredWeapons = filterWeapons(weapons, {
      weaponTypes: new Set(weaponTypes.filter((weaponType) => allWeaponTypes.includes(weaponType))),
      affinityIds: new Set(
        affinityIds.filter((affinityId) => regulationVersion.affinityOptions.has(affinityId)),
      ),
      effectiveWithAttributes: effectiveOnly ? attributes : undefined,
      twoHanding,
      uninfusableWeaponTypes,
    });

    const rows = filteredWeapons.map((weapon): WeaponTableRowData => {
      let upgradeLevel = 0;
      if (weapon.attack.length - 1 === maxRegularUpgradeLevel) {
        upgradeLevel = regularUpgradeLevel;
      } else if (weapon.attack.length - 1 === maxSpecialUpgradeLevel) {
        upgradeLevel = specialUpgradeLevel;
      }

      const weaponAttackResult = getWeaponAttack({
        weapon,
        attributes,
        twoHanding,
        upgradeLevel,
        disableTwoHandingAttackPowerBonus: regulationVersion.disableTwoHandingAttackPowerBonus,
      });

      for (const damageType of [...allDamageTypes, ...allStatusTypes]) {
        if (weaponAttackResult.attackPower[damageType]) {
          includedDamageTypes.add(damageType);
        }
      }

      return [weapon, weaponAttackResult];
    });

    return [rows, includedDamageTypes];
  }, [
    attributes,
    twoHanding,
    weapons,
    regulationVersion,
    regularUpgradeLevel,
    specialUpgradeLevel,
    weaponTypes,
    affinityIds,
    effectiveOnly,
    uninfusableWeaponTypes,
  ]);

  const memoizedAttackPowerTypes = useMemo(
    () => attackPowerTypes,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [[...attackPowerTypes].sort().join(",")],
  );

  const rowGroups = useMemo<WeaponTableRowGroup[]>(() => {
    if (groupWeaponTypes) {
      const rowsByWeaponType: { [weaponType in WeaponType]?: WeaponTableRowData[] } = {};
      filteredRows.forEach((row) => {
        const [weapon] = row;
        (rowsByWeaponType[weapon.weaponType] ??= []).push(row);
      });

      const rowGroups: WeaponTableRowGroup[] = [];
      allWeaponTypes.forEach((weaponType) => {
        if (weaponType in rowsByWeaponType) {
          rowGroups.push({
            key: weaponType.toString(),
            name: weaponTypeLabels.get(weaponType)!,
            rows: sortWeapons(rowsByWeaponType[weaponType]!, sortBy, reverse),
          });
        }
      });
      return rowGroups;
    }

    return filteredRows.length
      ? [
          {
            key: "allWeapons",
            rows: sortWeapons(filteredRows, sortBy, reverse).slice(offset, limit),
          },
        ]
      : [];
  }, [filteredRows, reverse, sortBy, groupWeaponTypes, offset, limit]);

  return {
    rowGroups,
    attackPowerTypes: memoizedAttackPowerTypes,
    total: filteredRows.length,
  };
};

export default useWeaponTableRows;
