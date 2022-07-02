import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Affinity, Attributes, WeaponType } from "../calculator/calculator";

interface AppState {
  readonly darkMode: boolean;
  readonly attributes: Attributes;
  readonly twoHanding: boolean;
  readonly upgradeLevel: number;
  readonly weaponTypes: readonly WeaponType[];
  readonly affinities: readonly Affinity[];
  readonly maxWeight: number;
  readonly effectiveOnly: boolean;
}

interface UpdateAppState extends AppState {
  onDarkModeChanged(darkMode: boolean): void;
  onAttributesChanged(attributes: Attributes): void;
  onTwoHandingChanged(twoHanding: boolean): void;
  onUpgradeLevelChanged(upgradeLevel: number): void;
  onWeaponTypesChanged(weaponTypes: readonly WeaponType[]): void;
  onAffinitiesChanged(affinities: readonly Affinity[]): void;
  onMaxWeightChanged(maxWeight: number): void;
  onEffectiveOnlyChanged(effectiveOnly: boolean): void;
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
};

const AppStateContext = createContext<UpdateAppState>({
  ...defaultAppState,
  onDarkModeChanged() {},
  onAttributesChanged() {},
  onTwoHandingChanged() {},
  onUpgradeLevelChanged() {},
  onWeaponTypesChanged() {},
  onAffinitiesChanged() {},
  onMaxWeightChanged() {},
  onEffectiveOnlyChanged() {},
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
        return JSON.parse(value);
      }
    } catch {}

    return defaultAppState;
  });

  useEffect(() => {
    localStorage.setItem("appState", JSON.stringify(appState));
  }, [appState]);

  const onDarkModeChanged = useCallback<UpdateAppState["onDarkModeChanged"]>(
    (darkMode) => setAppState((prevAppState) => ({ ...prevAppState, darkMode })),
    [],
  );
  const onAttributesChanged = useCallback<UpdateAppState["onAttributesChanged"]>(
    (attributes) => setAppState((prevAppState) => ({ ...prevAppState, attributes })),
    [],
  );
  const onTwoHandingChanged = useCallback<UpdateAppState["onTwoHandingChanged"]>(
    (twoHanding) => setAppState((prevAppState) => ({ ...prevAppState, twoHanding })),
    [],
  );
  const onUpgradeLevelChanged = useCallback<UpdateAppState["onUpgradeLevelChanged"]>(
    (upgradeLevel) => setAppState((prevAppState) => ({ ...prevAppState, upgradeLevel })),
    [],
  );
  const onWeaponTypesChanged = useCallback<UpdateAppState["onWeaponTypesChanged"]>(
    (weaponTypes) => setAppState((prevAppState) => ({ ...prevAppState, weaponTypes })),
    [],
  );
  const onAffinitiesChanged = useCallback<UpdateAppState["onAffinitiesChanged"]>(
    (affinities) => setAppState((prevAppState) => ({ ...prevAppState, affinities })),
    [],
  );
  const onMaxWeightChanged = useCallback<UpdateAppState["onMaxWeightChanged"]>(
    (maxWeight) => setAppState((prevAppState) => ({ ...prevAppState, maxWeight })),
    [],
  );
  const onEffectiveOnlyChanged = useCallback<UpdateAppState["onEffectiveOnlyChanged"]>(
    (effectiveOnly) => setAppState((prevAppState) => ({ ...prevAppState, effectiveOnly })),
    [],
  );

  const context = useMemo(
    () => ({
      ...appState,
      onDarkModeChanged,
      onAttributesChanged,
      onTwoHandingChanged,
      onUpgradeLevelChanged,
      onWeaponTypesChanged,
      onAffinitiesChanged,
      onMaxWeightChanged,
      onEffectiveOnlyChanged,
    }),
    [
      appState,
      onDarkModeChanged,
      onAttributesChanged,
      onTwoHandingChanged,
      onUpgradeLevelChanged,
      onWeaponTypesChanged,
      onAffinitiesChanged,
      onMaxWeightChanged,
      onEffectiveOnlyChanged,
    ],
  );

  return <AppStateContext.Provider value={context}>{children}</AppStateContext.Provider>;
};

export function useAppState() {
  return useContext(AppStateContext);
}
