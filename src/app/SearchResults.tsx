import { useRef, useState } from "react";
import { Container } from "@mui/material";
import getWeaponAttack, { adjustAttributesForTwoHanding, Weapon } from "../calculator/calculator";
import filterWeapons from "../search/filterWeapons";
import WeaponTable, { WeaponTableRow } from "./WeaponTable";
import { useAppState } from "./AppState";

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

interface Props {
  weapons: Map<string, Weapon>;
}

/**
 * Displays a table of weapons based on the selected search criteria
 */
const SearchScreen = ({ weapons }: Props) => {
  const {
    attributes,
    twoHanding,
    upgradeLevel,
    weaponTypes,
    affinities,
    maxWeight,
    effectiveOnly,
  } = useAppState();

  const weaponTableRows = useMemoThrottled<WeaponTableRow[]>(
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

  return (
    <Container
      maxWidth="xl"
      sx={{
        display: "grid",
        alignContent: "start",
        gap: 2,
        py: 2,
        px: { xs: 0, lg: 3 },
      }}
    >
      <WeaponTable rows={weaponTableRows} />
    </Container>
  );
};

export default SearchScreen;
