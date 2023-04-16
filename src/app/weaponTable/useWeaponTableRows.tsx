import { useDeferredValue, useMemo } from "react";
import getWeaponAttack, {
  Attributes,
  maxRegularUpgradeLevel,
  maxSpecialUpgradeLevel,
  meleeWeaponTypes,
  miscWeaponTypes,
  rangedWeaponTypes,
  toSpecialUpgradeLevel,
  Weapon,
  WeaponType,
} from "../../calculator/calculator";
import filterWeapons from "../../search/filterWeapons";
import { WeaponTableRowData, WeaponTableRowGroup } from "./WeaponTable";
import { SortBy, sortWeapons } from "../../search/sortWeapons";

const orderedWeaponTypes = [...meleeWeaponTypes, ...rangedWeaponTypes, ...miscWeaponTypes];

interface WeaponTableRowsOptions {
  weapons: readonly Weapon[];
  allAffinityIds: readonly number[];
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
  total: number;
}

/**
 * Filter, sort, and paginate the weapon list based on the current selections
 */
const useWeaponTableRows = ({
  weapons,
  allAffinityIds,
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

  const filteredRows = useMemo<WeaponTableRowData[]>(() => {
    const validAffinityIds = affinityIds.filter((affinityId) =>
      allAffinityIds.includes(affinityId),
    );

    const filteredWeapons = filterWeapons(weapons.values(), {
      weaponTypes,
      affinityIds: validAffinityIds,
      effectiveWithAttributes: effectiveOnly ? attributes : undefined,
      twoHanding,
    });

    return filteredWeapons.map((weapon) => {
      let upgradeLevel = 0;
      if (weapon.attack.length - 1 === maxRegularUpgradeLevel) {
        upgradeLevel = regularUpgradeLevel;
      } else if (weapon.attack.length - 1 === maxSpecialUpgradeLevel) {
        upgradeLevel = specialUpgradeLevel;
      }

      return [
        weapon,
        getWeaponAttack({
          weapon,
          attributes,
          twoHanding,
          upgradeLevel,
        }),
      ];
    });
  }, [
    attributes,
    twoHanding,
    weapons,
    allAffinityIds,
    regularUpgradeLevel,
    specialUpgradeLevel,
    weaponTypes,
    affinityIds,
    effectiveOnly,
  ]);

  const rowGroups = useMemo<WeaponTableRowGroup[]>(() => {
    if (groupWeaponTypes) {
      const rowsByWeaponType: { [weaponType in WeaponType]?: WeaponTableRowData[] } = {};
      filteredRows.forEach((row) => {
        const [weapon] = row;
        (rowsByWeaponType[weapon.weaponType] ??= []).push(row);
      });

      const rowGroups: WeaponTableRowGroup[] = [];
      orderedWeaponTypes.forEach((weaponType) => {
        if (weaponType in rowsByWeaponType) {
          rowGroups.push({
            key: weaponType,
            name: weaponType,
            rows: sortWeapons(rowsByWeaponType[weaponType]!, sortBy, reverse),
          });
        }
      });
      return rowGroups;
    }

    return [
      {
        key: "allWeapons",
        rows: sortWeapons(filteredRows, sortBy, reverse).slice(offset, limit),
      },
    ];
  }, [filteredRows, reverse, sortBy, groupWeaponTypes, offset, limit]);

  return {
    rowGroups,
    total: filteredRows.length,
  };
};

export default useWeaponTableRows;
