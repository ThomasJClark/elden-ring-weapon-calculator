import { useDeferredValue, useMemo } from "react";
import getWeaponAttack, {
  adjustAttributesForTwoHanding,
  Weapon,
} from "../../calculator/calculator";
import filterWeapons from "../../search/filterWeapons";
import { WeaponTableRowData } from "./WeaponTable";
import { useAppState } from "../AppState";
import { sortWeapons } from "../../search/sortWeapons";

interface WeaponTableRowsOptions {
  weapons: readonly Weapon[];
  offset: number;
  limit: number;
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
}: WeaponTableRowsOptions): WeaponTableRowsResult => {
  const appState = useAppState();

  // Defer filtering based on app state changes because this can be CPU intensive if done while
  // busy rendering
  const attributes = useDeferredValue(appState.attributes);
  const twoHanding = useDeferredValue(appState.twoHanding);
  const upgradeLevel = useDeferredValue(appState.upgradeLevel);
  const weaponTypes = useDeferredValue(appState.weaponTypes);
  const affinities = useDeferredValue(appState.affinities);
  const maxWeight = useDeferredValue(appState.maxWeight);
  const effectiveOnly = useDeferredValue(appState.effectiveOnly);

  const filteredRows = useMemo<WeaponTableRowData[]>(() => {
    // Apply the two handing bonus if selected
    const adjustedAttributes = twoHanding ? adjustAttributesForTwoHanding(attributes) : attributes;

    const filteredWeapons = filterWeapons(weapons.values(), {
      upgradeLevel,
      weaponTypes,
      affinities,
      maxWeight,
      effectiveWithAttributes: effectiveOnly ? adjustedAttributes : undefined,
    });

    return filteredWeapons.map((weapon) => [
      weapon,
      getWeaponAttack({ weapon, attributes: adjustedAttributes }),
    ]);
  }, [
    attributes,
    twoHanding,
    weapons,
    upgradeLevel,
    weaponTypes,
    affinities,
    maxWeight,
    effectiveOnly,
  ]);

  const sortedRows = useMemo(
    () => sortWeapons(filteredRows, appState.sortBy),
    [filteredRows, appState.sortBy],
  );

  const paginatedRows = useMemo(() => {
    if (appState.reverse) {
      return sortedRows
        .slice(sortedRows.length - offset - limit, sortedRows.length - offset)
        .reverse();
    } else {
      return sortedRows.slice(offset, limit);
    }
  }, [sortedRows, appState.reverse, offset, limit]);

  return {
    rows: paginatedRows,
    total: filteredRows.length,
  };
};

export default useWeaponTableRows;
