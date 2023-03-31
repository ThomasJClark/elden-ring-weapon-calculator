import { useEffect, useMemo, useState } from "react";
import { Affinity, Attribute, Attributes, WeaponType } from "../calculator/calculator";
import { SortBy } from "../search/sortWeapons";

interface AppState {
  readonly darkMode: boolean;
  readonly attributes: Attributes;
  readonly twoHanding: boolean;
  readonly upgradeLevel: number;
  readonly weaponTypes: readonly WeaponType[];
  readonly affinities: readonly Affinity[];
  readonly effectiveOnly: boolean;
  readonly splitDamage: boolean;
  readonly groupWeaponTypes: boolean;
  readonly sortBy: SortBy;
  readonly reverse: boolean;
}

interface UpdateAppState extends AppState {
  setDarkMode(darkMode: boolean): void;
  setAttribute(attribute: Attribute, value: number): void;
  setTwoHanding(twoHanding: boolean): void;
  setUpgradeLevel(upgradeLevel: number): void;
  setWeaponTypes(weaponTypes: readonly WeaponType[]): void;
  setAffinities(affinities: readonly Affinity[]): void;
  setEffectiveOnly(effectiveOnly: boolean): void;
  setSplitDamage(splitDamage: boolean): void;
  setGroupWeaponTypes(groupWeaponTypes: boolean): void;
  setSortBy(sortBy: SortBy): void;
  setReverse(reverse: boolean): void;
}

const defaultAppState: AppState = {
  darkMode: true,
  attributes: {
    str: 30,
    dex: 30,
    int: 30,
    fai: 30,
    arc: 30,
  },
  twoHanding: false,
  upgradeLevel: 25,
  weaponTypes: ["Axe"],
  affinities: ["Standard", "Special"],
  effectiveOnly: false,
  splitDamage: true,
  groupWeaponTypes: false,
  sortBy: "totalAttack",
  reverse: false,
};

/**
 * Manages all of the user selectable filters and display options, and saves/loads them in
 * localStorage for use on future page loads
 */
export default function useAppState() {
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const value = localStorage.getItem("appState");
      if (value) {
        return { ...defaultAppState, ...JSON.parse(value) };
      }
    } catch {}

    return defaultAppState;
  });

  useEffect(() => {
    localStorage.setItem("appState", JSON.stringify(appState));
  }, [appState]);

  const changeHandlers = useMemo<Omit<UpdateAppState, keyof AppState>>(
    () => ({
      setDarkMode(darkMode) {
        setAppState((prevAppState) => ({ ...prevAppState, darkMode }));
      },
      setAttribute(attribute, value) {
        setAppState((prevAppState) => ({
          ...prevAppState,
          attributes: { ...prevAppState.attributes, [attribute]: value },
        }));
      },
      setTwoHanding(twoHanding) {
        setAppState((prevAppState) => ({ ...prevAppState, twoHanding }));
      },
      setUpgradeLevel(upgradeLevel) {
        setAppState((prevAppState) => ({ ...prevAppState, upgradeLevel }));
      },
      setWeaponTypes(weaponTypes) {
        setAppState((prevAppState) => ({ ...prevAppState, weaponTypes }));
      },
      setAffinities(affinities) {
        setAppState((prevAppState) => ({ ...prevAppState, affinities }));
      },
      setEffectiveOnly(effectiveOnly) {
        setAppState((prevAppState) => ({ ...prevAppState, effectiveOnly }));
      },
      setSplitDamage(splitDamage) {
        setAppState((prevAppState) => ({ ...prevAppState, splitDamage }));
      },
      setGroupWeaponTypes(groupWeaponTypes) {
        setAppState((prevAppState) => ({ ...prevAppState, groupWeaponTypes }));
      },
      setSortBy(sortBy) {
        setAppState((prevAppState) => ({ ...prevAppState, sortBy }));
      },
      setReverse(reverse) {
        setAppState((prevAppState) => ({ ...prevAppState, reverse }));
      },
    }),
    [],
  );

  return useMemo(() => ({ ...appState, ...changeHandlers }), [appState, changeHandlers]);
}
