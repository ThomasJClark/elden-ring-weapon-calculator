import { useDeferredValue, useMemo } from "react";
import getWeaponAttack, {
  Affinity,
  Attributes,
  meleeWeaponTypes,
  miscWeaponTypes,
  rangedWeaponTypes,
  Weapon,
  WeaponType,
} from "../../calculator/calculator";
import filterWeapons from "../../search/filterWeapons";
import { WeaponTableRowData, WeaponTableRowGroup } from "./WeaponTable";
import { SortBy, sortWeapons } from "../../search/sortWeapons";

const orderedWeaponTypes = [...meleeWeaponTypes, ...rangedWeaponTypes, ...miscWeaponTypes];

interface WeaponTableRowsOptions {
  weapons: readonly Weapon[];
  offset: number;
  limit: number;
  sortBy: SortBy;
  reverse: boolean;
  affinities: readonly Affinity[];
  weaponTypes: readonly WeaponType[];
  attributes: Attributes;
  effectiveOnly: boolean;
  twoHanding: boolean;
  groupWeaponTypes: boolean; // TODO sort by weapon type when this is true
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
  offset,
  limit,
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
  const affinities = useDeferredValue(options.affinities);
  const effectiveOnly = useDeferredValue(options.effectiveOnly);

  const filteredRows = useMemo<WeaponTableRowData[]>(() => {
    const filteredWeapons = filterWeapons(weapons.values(), {
      weaponTypes,
      affinities,
      effectiveWithAttributes: effectiveOnly ? attributes : undefined,
      twoHanding,
    });

    return filteredWeapons.map((weapon) => [
      weapon,
      getWeaponAttack({
        weapon,
        attributes,
        twoHanding,
      }),
    ]);
  }, [attributes, twoHanding, weapons, weaponTypes, affinities, effectiveOnly]);

  const rowGroups = useMemo<WeaponTableRowGroup[]>(() => {
    if (groupWeaponTypes) {
      const rowsByWeaponType: { [weaponType in WeaponType]?: WeaponTableRowData[] } = {};
      filteredRows.forEach((row) => {
        const [weapon] = row;
        (rowsByWeaponType[weapon.metadata.weaponType] ??= []).push(row);
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
