import { useMemo, useRef, useState } from "react";
import getWeaponAttack, { adjustAttributesForTwoHanding, Weapon } from "../calculator/calculator";
import filterWeapons from "../search/filterWeapons";
import { WeaponTableRow } from "./WeaponTable";
import { useAppState } from "./AppState";
import { sortWeapons } from "../search/sortWeapons";

/* eslint-disable react-hooks/exhaustive-deps */
function useMemoThrottled<T>(factory: () => T, timeoutMs: number, dependencies: unknown[]): T {
  const [, update] = useState(0);
  const value = useRef<T>();
  const lastEvaluateTimeMs = useRef(0);
  const timeoutHandle = useRef<NodeJS.Timeout>();
  const lastDependencies = useRef<unknown[]>();

  if (
    lastDependencies.current === undefined ||
    lastDependencies.current.length !== dependencies.length ||
    lastDependencies.current.some((value, index) => value !== dependencies[index])
  ) {
    lastDependencies.current = dependencies;

    const currentTimeMs = Date.now();
    const nextEvaluateTimeMs = lastEvaluateTimeMs.current + timeoutMs;

    if (currentTimeMs > nextEvaluateTimeMs) {
      lastEvaluateTimeMs.current = currentTimeMs;
      value.current = factory();
    } else {
      clearTimeout(timeoutHandle.current);
      timeoutHandle.current = setTimeout(() => {
        lastEvaluateTimeMs.current = nextEvaluateTimeMs;
        value.current = factory();
        update((prev) => prev + 1);
      }, nextEvaluateTimeMs - currentTimeMs);
    }
  }

  if (value.current === undefined) {
    value.current = factory();
  }

  return value.current!;
}
/* eslint-enable react-hooks/exhaustive-deps */

/**
 * Filter, sort, and paginate the weapon list based on the current selections
 */
const useWeaponTableRows = (weapons: readonly Weapon[]) => {
  const {
    attributes,
    twoHanding,
    upgradeLevel,
    weaponTypes,
    affinities,
    maxWeight,
    effectiveOnly,
    sortBy,
    reverse,
  } = useAppState();

  const offset = 0;
  const limit = 100;

  const filteredRows = useMemoThrottled<WeaponTableRow[]>(
    () => {
      // Apply the two handing bonus if selected
      const adjustedAttributes = twoHanding
        ? adjustAttributesForTwoHanding(attributes)
        : attributes;

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
    },
    100,
    [
      attributes,
      twoHanding,
      weapons,
      upgradeLevel,
      weaponTypes,
      affinities,
      maxWeight,
      effectiveOnly,
    ],
  );

  const sortedRows = useMemo(() => sortWeapons(filteredRows, sortBy), [filteredRows, sortBy]);

  const paginatedRows = useMemo(() => {
    if (reverse) {
      return sortedRows
        .slice(sortedRows.length - offset - limit, sortedRows.length - offset)
        .reverse();
    } else {
      return sortedRows.slice(offset, limit);
    }
  }, [sortedRows, reverse, offset, limit]);

  return paginatedRows;
};

export default useWeaponTableRows;
