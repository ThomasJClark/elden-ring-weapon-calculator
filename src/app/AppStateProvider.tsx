import { useEffect, useMemo, useContext, createContext, useReducer } from "react";
import { type Attributes, WeaponType } from "../calculator/calculator";
import type { SortBy } from "../search/sortWeapons";
import type { RegulationVersionName } from "./regulationVersions";
import regulationVersions from "./regulationVersions";
import { dlcWeaponTypes } from "./uiUtils";
import { type WeaponOption } from "./WeaponPicker";

interface AppState {
  readonly regulationVersionName: RegulationVersionName;
  readonly attributes: Attributes;
  readonly twoHanding: boolean;
  readonly upgradeLevel: number;
  readonly weaponTypes: readonly WeaponType[];
  readonly affinityIds: readonly number[];
  readonly includeDLC: boolean;
  readonly effectiveOnly: boolean;
  readonly splitDamage: boolean;
  readonly groupWeaponTypes: boolean;
  readonly numericalScaling: boolean;
  readonly sortBy: SortBy;
  readonly reverse: boolean;
  readonly selectedWeapons: WeaponOption[];
}

const defaultAppState: AppState = {
  regulationVersionName: "latest",
  attributes: {
    str: 30,
    dex: 30,
    int: 30,
    fai: 30,
    arc: 30,
  },
  twoHanding: false,
  upgradeLevel: 25,
  weaponTypes: [WeaponType.AXE],
  affinityIds: [0, -1], // Standard and Special
  includeDLC: true,
  effectiveOnly: false,
  splitDamage: true,
  groupWeaponTypes: false,
  numericalScaling: false,
  sortBy: "totalAttack",
  reverse: false,
  selectedWeapons: [],
};

/**
 * @returns the initial state of the app, restored from localstorage and the URL if available
 */
function getInitialAppState(): AppState {
  const appState = { ...defaultAppState };

  try {
    const storedAppState = localStorage.getItem("appState");
    if (storedAppState) {
      Object.assign(appState, JSON.parse(storedAppState));
    }
  } catch {
    /* ignored */
  }

  const regulationVersionName = window.location.pathname.substring(1);
  if (regulationVersionName && regulationVersionName in regulationVersions) {
    appState.regulationVersionName = regulationVersionName as RegulationVersionName;
  }

  return appState;
}

/**
 * Store the state of the app in localstorage and the URL so it can be restored on future visits
 */

function updateUrl(regulationVersionName: RegulationVersionName) {
  window.history.replaceState(
    null,
    "",
    `/${regulationVersionName === "latest" ? "" : regulationVersionName}`,
  );
}

// Create the actions for the associated keys in an object where
// Record<{ type: setKeyName(value: ValueType), payload: ValueType}> is created from Record<KeyName, ValueType>
type ActionMap<T extends object> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: {
    type: `set${Capitalize<string & K>}`;
    payload: T[K];
  };
};

/* Custom actions - Start */
// It's not convenient to have all actions that are expressed automatically by replacing the state with the same type
type AttributePatchUpdate = { type: "setAttributes"; payload: Partial<Attributes> };
/* Custom actions - End */

export type AppAction = ActionMap<AppState>[keyof ActionMap<AppState>] | AttributePatchUpdate;

const dlcWeaponSet = new Set(dlcWeaponTypes);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "setRegulationVersionName":
      return { ...state, regulationVersionName: action.payload };
    case "setAttributes":
      return { ...state, attributes: { ...state.attributes, ...action.payload } };
    case "setTwoHanding":
      return { ...state, twoHanding: action.payload };
    case "setUpgradeLevel":
      return { ...state, upgradeLevel: action.payload };
    case "setWeaponTypes":
      return { ...state, weaponTypes: action.payload };
    case "setAffinityIds":
      return { ...state, affinityIds: action.payload };
    case "setIncludeDLC":
      return {
        ...state,
        includeDLC: action.payload,
        weaponTypes: state.weaponTypes.filter((weaponType) => !dlcWeaponSet.has(weaponType)),
      };
    case "setEffectiveOnly":
      return { ...state, effectiveOnly: action.payload };
    case "setSplitDamage":
      return { ...state, splitDamage: action.payload };
    case "setGroupWeaponTypes":
      return { ...state, groupWeaponTypes: action.payload };
    case "setNumericalScaling":
      return { ...state, numericalScaling: action.payload };
    case "setSortBy":
      return { ...state, sortBy: action.payload };
    case "setReverse":
      return { ...state, reverse: action.payload };
    case "setSelectedWeapons":
      return { ...state, selectedWeapons: action.payload };
    default:
      return state;
  }
}

const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({
  state: defaultAppState,
  dispatch: (state) => state,
});

export const AppStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, getInitialAppState());

  useEffect(() => {
    // On the state changing, set into local storage
    localStorage.setItem("appState", JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    updateUrl(state.regulationVersionName);
  }, [state.regulationVersionName]);

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppStateContext = () => useContext(AppStateContext);
