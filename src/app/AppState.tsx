import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Affinity, Attributes, WeaponType } from "../calculator/calculator";
import { SortBy } from "../search/sortWeapons";

interface AppState {
  readonly darkMode: boolean;
  readonly attributes: Attributes;
  readonly twoHanding: boolean;
  readonly upgradeLevel: number;
  readonly weaponTypes: readonly WeaponType[];
  readonly affinities: readonly Affinity[];
  readonly maxWeight: number;
  readonly effectiveOnly: boolean;
  readonly splitDamage: boolean;
  readonly sortBy: SortBy;
  readonly reverse: boolean;
}

interface UpdateAppState extends AppState {
  setDarkMode(darkMode: boolean): void;
  setAttributes(attributes: Attributes): void;
  setTwoHanding(twoHanding: boolean): void;
  setUpgradeLevel(upgradeLevel: number): void;
  setWeaponTypes(weaponTypes: readonly WeaponType[]): void;
  setAffinities(affinities: readonly Affinity[]): void;
  setMaxWeight(maxWeight: number): void;
  setEffectiveOnly(effectiveOnly: boolean): void;
  setSplitDamage(splitDamage: boolean): void;
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
  affinities: ["None"],
  maxWeight: 30,
  effectiveOnly: false,
  splitDamage: true,
  sortBy: "name",
  reverse: false,
};

const AppStateContext = createContext<UpdateAppState>({
  ...defaultAppState,
  setDarkMode() {},
  setAttributes() {},
  setTwoHanding() {},
  setUpgradeLevel() {},
  setWeaponTypes() {},
  setAffinities() {},
  setMaxWeight() {},
  setEffectiveOnly() {},
  setSplitDamage() {},
  setSortBy() {},
  setReverse() {},
});

/**
 * Manages all of the user selectable filters and display options, and saves/loads them in
 * localStorage for use on future page loads
 */
export const AppStateProvider = ({ children }: { children: ReactNode }) => {
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
      setAttributes(attributes) {
        setAppState((prevAppState) => ({ ...prevAppState, attributes }));
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
      setMaxWeight(maxWeight) {
        setAppState((prevAppState) => ({ ...prevAppState, maxWeight }));
      },
      setEffectiveOnly(effectiveOnly) {
        setAppState((prevAppState) => ({ ...prevAppState, effectiveOnly }));
      },
      setSplitDamage(splitDamage) {
        setAppState((prevAppState) => ({ ...prevAppState, splitDamage }));
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

  const context = useMemo(() => ({ ...appState, ...changeHandlers }), [appState, changeHandlers]);
  return <AppStateContext.Provider value={context}>{children}</AppStateContext.Provider>;
};

export function useAppState() {
  return useContext(AppStateContext);
}
