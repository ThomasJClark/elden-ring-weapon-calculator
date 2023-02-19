import { useDeferredValue, useMemo } from "react";
import getWeaponAttack, {
  Affinity,
  Attributes,
  Weapon,
  WeaponType,
} from "../../calculator/calculator";
import filterWeapons from "../../search/filterWeapons";
import { WeaponTableRowData } from "./WeaponTable";
import { SortBy, sortWeapons } from "../../search/sortWeapons";

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
}

interface WeaponTableRowsResult {
  rows: readonly WeaponTableRowData[];
  total: number;
}

/**
 * Filter, sort, and paginate the weapon list based on the current selections
 */
const useWeaponTableRows = ({
  weapons,
  offset,
  limit,
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

  const sortedRows = useMemo(
    () => sortWeapons(filteredRows, options.sortBy),
    [filteredRows, options.sortBy],
  );

  const paginatedRows = useMemo(() => {
    if (options.reverse) {
      return sortedRows
        .slice(sortedRows.length - offset - limit, sortedRows.length - offset)
        .reverse();
    } else {
      return sortedRows.slice(offset, limit);
    }
  }, [sortedRows, options.reverse, offset, limit]);

  return {
    rows: paginatedRows,
    total: filteredRows.length,
  };
};

export default useWeaponTableRows;
