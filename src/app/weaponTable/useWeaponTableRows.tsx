import { useDeferredValue, useMemo } from "react";
import getWeaponAttack, {
  allAttackPowerTypes,
  AttackPowerType,
  WeaponType,
  type Weapon,
} from "../../calculator/calculator";
import filterWeapons from "../../search/filterWeapons";
import { type WeaponTableRowData, type WeaponTableRowGroup } from "./WeaponTable";
import { sortWeapons } from "../../search/sortWeapons";
import { type RegulationVersion } from "../regulationVersions";
import {
  allWeaponTypes,
  weaponTypeLabels,
  maxSpecialUpgradeLevel,
  toSpecialUpgradeLevel,
} from "../uiUtils";
import { useAppStateContext } from "../AppStateProvider";

interface WeaponTableRowsOptions {
  weapons: readonly Weapon[];
  regulationVersion: RegulationVersion;
  offset: number;
  limit: number;
}

interface WeaponTableRowsResult {
  rowGroups: readonly WeaponTableRowGroup[];

  /** Attack power types included in at least one weapon in the filtered results */
  attackPowerTypes: ReadonlySet<AttackPowerType>;

  /**True if at least one weapon in the filtered results can cast spells */
  spellScaling: boolean;

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
}: WeaponTableRowsOptions): WeaponTableRowsResult => {
  const { state } = useAppStateContext();
  const { groupWeaponTypes, sortBy, reverse, upgradeLevel: regularUpgradeLevel } = state;
  // Defer filtering based on app state changes because this can be CPU intensive if done while
  // busy rendering
  const attributes = useDeferredValue(state.attributes);
  const twoHanding = useDeferredValue(state.twoHanding);
  const weaponTypes = useDeferredValue(state.weaponTypes);
  const affinityIds = useDeferredValue(state.affinityIds);
  const effectiveOnly = useDeferredValue(state.effectiveOnly);
  const includeDLC = useDeferredValue(state.includeDLC);
  const selectedWeapons = useDeferredValue(state.selectedWeapons);

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

  const [filteredRows, attackPowerTypes, spellScaling] = useMemo<
    [WeaponTableRowData[], Set<AttackPowerType>, boolean]
  >(() => {
    const includedDamageTypes = new Set<AttackPowerType>();
    let includeSpellScaling = false;

    const filteredWeapons = filterWeapons(weapons, {
      weaponTypes: new Set(weaponTypes.filter((weaponType) => allWeaponTypes.includes(weaponType))),
      affinityIds: new Set(
        affinityIds.filter((affinityId) => regulationVersion.affinityOptions.has(affinityId)),
      ),
      effectiveWithAttributes: effectiveOnly ? attributes : undefined,
      includeDLC,
      twoHanding,
      uninfusableWeaponTypes,
      selectedWeapons: selectedWeapons.reduce(
        (acc, weapon) => (acc.add(weapon.value), acc),
        new Set<string>(),
      ),
    });

    const rows = filteredWeapons.map((weapon): WeaponTableRowData => {
      let upgradeLevel = 0;
      if (weapon.attack.length - 1 === maxSpecialUpgradeLevel) {
        upgradeLevel = specialUpgradeLevel;
      } else {
        upgradeLevel = Math.min(regularUpgradeLevel, weapon.attack.length - 1);
      }

      const weaponAttackResult = getWeaponAttack({
        weapon,
        attributes,
        twoHanding,
        upgradeLevel,
        disableTwoHandingAttackPowerBonus: regulationVersion.disableTwoHandingAttackPowerBonus,
        ineffectiveAttributePenalty: regulationVersion.ineffectiveAttributePenalty,
      });

      for (const statusType of allAttackPowerTypes) {
        if (weaponAttackResult.attackPower[statusType]) {
          includedDamageTypes.add(statusType);
        }
      }

      if (weapon.sorceryTool || weapon.incantationTool) {
        includeSpellScaling = true;
      }

      return [weapon, weaponAttackResult];
    });

    return [rows, includedDamageTypes, includeSpellScaling];
  }, [
    attributes,
    twoHanding,
    weapons,
    regulationVersion,
    regularUpgradeLevel,
    specialUpgradeLevel,
    weaponTypes,
    affinityIds,
    includeDLC,
    effectiveOnly,
    uninfusableWeaponTypes,
    selectedWeapons,
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
    spellScaling,
    total: filteredRows.length,
  };
};

export default useWeaponTableRows;
