import { useEffect, useMemo, useState } from "react";
import {
  allDamageTypes,
  allStatusTypes,
  AttackPowerType,
  type Attribute,
  type Attributes,
  WeaponType,
} from "../calculator/calculator.ts";
import type { OptimizeMode, OptimizationWeights } from "../calculator/optimization.ts";
import type { SortBy } from "../search/sortWeapons.ts";
import type { RegulationVersionName } from "./regulationVersions.tsx";
import regulationVersions from "./regulationVersions.tsx";
import { dlcWeaponTypes } from "./uiUtils.ts";
import { type WeaponOption } from "./WeaponPicker.tsx";

interface AppState {
  readonly regulationVersionName: RegulationVersionName;
  readonly attributes: Attributes;
  readonly freeStatPoints: number;
  readonly optimizeMode: OptimizeMode;
  readonly optimizeAttackPowerType: AttackPowerType;
  readonly optimizationWeights: OptimizationWeights;
  readonly spellScalingWeight: number;
  readonly showOptimizedAttributes: boolean;
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

interface UpdateAppState extends AppState {
  setRegulationVersionName(regulationVersionName: RegulationVersionName): void;
  setAttribute(attribute: Attribute, value: number): void;
  setFreeStatPoints(value: number): void;
  setOptimizeMode(mode: OptimizeMode): void;
  setOptimizeAttackPowerType(attackPowerType: AttackPowerType): void;
  setOptimizationWeight(attackPowerType: AttackPowerType, weight: number): void;
  setSpellScalingWeight(weight: number): void;
  setShowOptimizedAttributes(value: boolean): void;
  setTwoHanding(twoHanding: boolean): void;
  setUpgradeLevel(upgradeLevel: number): void;
  setWeaponTypes(weaponTypes: readonly WeaponType[]): void;
  setAffinityIds(affinityIds: readonly number[]): void;
  setIncludeDLC(includeDLC: boolean): void;
  setEffectiveOnly(effectiveOnly: boolean): void;
  setSplitDamage(splitDamage: boolean): void;
  setGroupWeaponTypes(groupWeaponTypes: boolean): void;
  setNumericalScaling(numericalScaling: boolean): void;
  setSortBy(sortBy: SortBy): void;
  setReverse(reverse: boolean): void;
  setSelectedWeapons(weapons: WeaponOption[]): void;
}

function computeMaxFreeStatPoints(attributes: Attributes) {
  return Math.max(
    0,
    99 * 5 - (attributes.str + attributes.dex + attributes.int + attributes.fai + attributes.arc),
  );
}

function defaultWeights(): OptimizationWeights {
  const weights: OptimizationWeights = {};
  for (const type of [...allDamageTypes, ...allStatusTypes]) {
    weights[type] = 1;
  }
  return weights;
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
  freeStatPoints: 0,
  optimizeMode: "totalAttackPower",
  optimizeAttackPowerType: AttackPowerType.PHYSICAL,
  optimizationWeights: defaultWeights(),
  spellScalingWeight: 1,
  showOptimizedAttributes: false,
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
function getInitialAppState() {
  const appState = { ...defaultAppState };

  try {
    const storedAppState = localStorage.getItem("appState");
    if (storedAppState) {
      Object.assign(appState, JSON.parse(storedAppState));
    }
  } catch {
    /* ignored */
  }

  // Backwards compatibility for older saved app state keys
  const legacy = appState as unknown as {
    optimizationDomain?: string;
    optimizationMetric?: string;
    optimizationAttackPowerType?: AttackPowerType;
    optimizationWeights?: OptimizationWeights;
  };
  if (
    (appState as unknown as { optimizeMode?: OptimizeMode }).optimizeMode == null &&
    legacy.optimizationDomain
  ) {
    const legacyType = legacy.optimizationAttackPowerType ?? defaultAppState.optimizeAttackPowerType;

    let optimizeMode: OptimizeMode = "totalAttackPower";
    if (legacy.optimizationDomain === "none") {
      optimizeMode = "none";
    } else if (legacy.optimizationDomain === "spellScaling") {
      optimizeMode = legacy.optimizationMetric === "weighted" ? "weighted" : "spellScaling";
    } else if (legacy.optimizationDomain === "attackPower") {
      if (legacy.optimizationMetric === "weighted") {
        optimizeMode = "weighted";
      } else if (legacy.optimizationMetric === "type") {
        optimizeMode = allStatusTypes.includes(legacyType) ? "statusBuildup" : "specificAttackPower";
      } else {
        optimizeMode = "totalAttackPower";
      }
    }

    (appState as unknown as { optimizeMode: OptimizeMode }).optimizeMode = optimizeMode;
    (appState as unknown as { optimizeAttackPowerType: AttackPowerType }).optimizeAttackPowerType =
      legacyType;
    if (legacy.optimizationWeights) {
      (appState as unknown as { optimizationWeights: OptimizationWeights }).optimizationWeights =
        legacy.optimizationWeights;
    }
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
function onAppStateChanged(appState: AppState) {
  localStorage.setItem("appState", JSON.stringify(appState));
}

function updateUrl(regulationVersionName: RegulationVersionName) {
  window.history.replaceState(
    null,
    "",
    `/${regulationVersionName === "latest" ? "" : regulationVersionName}`,
  );
}

/**
 * Manages all of the user selectable filters and display options, and saves/loads them in
 * localStorage for use on future page loads
 */
export default function useAppState() {
  const [appState, setAppState] = useState<AppState>(() => {
    return getInitialAppState();
  });

  useEffect(() => {
    onAppStateChanged(appState);
    updateUrl(appState.regulationVersionName);
  }, [appState]);

  useEffect(() => {
    function onPopState() {
      updateUrl(appState.regulationVersionName);
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [appState.regulationVersionName]);

  const changeHandlers = useMemo<Omit<UpdateAppState, keyof AppState>>(
    () => ({
      setRegulationVersionName(regulationVersionName) {
        setAppState((prevAppState) => ({ ...prevAppState, regulationVersionName }));
      },
      setAttribute(attribute, value) {
        setAppState((prevAppState) => ({
          ...prevAppState,
          attributes: { ...prevAppState.attributes, [attribute]: value },
          freeStatPoints: Math.min(
            prevAppState.freeStatPoints,
            computeMaxFreeStatPoints({ ...prevAppState.attributes, [attribute]: value } as Attributes),
          ),
        }));
      },
      setFreeStatPoints(value) {
        setAppState((prevAppState) => ({
          ...prevAppState,
          freeStatPoints: Math.min(value, computeMaxFreeStatPoints(prevAppState.attributes)),
        }));
      },
      setOptimizeMode(optimizeMode) {
        setAppState((prevAppState) => {
          let optimizeAttackPowerType = prevAppState.optimizeAttackPowerType;
          if (optimizeMode === "specificAttackPower") {
            if (!allDamageTypes.includes(optimizeAttackPowerType)) {
              optimizeAttackPowerType = AttackPowerType.PHYSICAL;
            }
          } else if (optimizeMode === "statusBuildup") {
            if (!allStatusTypes.includes(optimizeAttackPowerType)) {
              optimizeAttackPowerType = AttackPowerType.BLEED;
            }
          }
          return { ...prevAppState, optimizeMode, optimizeAttackPowerType };
        });
      },
      setOptimizeAttackPowerType(optimizeAttackPowerType) {
        setAppState((prevAppState) => ({ ...prevAppState, optimizeAttackPowerType }));
      },
      setOptimizationWeight(attackPowerType, weight) {
        setAppState((prevAppState) => ({
          ...prevAppState,
          optimizationWeights: { ...prevAppState.optimizationWeights, [attackPowerType]: weight },
        }));
      },
      setSpellScalingWeight(spellScalingWeight) {
        setAppState((prevAppState) => ({ ...prevAppState, spellScalingWeight }));
      },
      setShowOptimizedAttributes(showOptimizedAttributes) {
        setAppState((prevAppState) => ({ ...prevAppState, showOptimizedAttributes }));
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
      setAffinityIds(affinityIds) {
        setAppState((prevAppState) => ({ ...prevAppState, affinityIds }));
      },
      setIncludeDLC(includeDLC) {
        setAppState((prevAppState) => ({
          ...prevAppState,
          includeDLC,
          weaponTypes: prevAppState.weaponTypes.filter(
            (weaponType) => !dlcWeaponTypes.includes(weaponType),
          ),
        }));
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
      setNumericalScaling(numericalScaling) {
        setAppState((prevAppState) => ({ ...prevAppState, numericalScaling }));
      },
      setSortBy(sortBy) {
        setAppState((prevAppState) => ({ ...prevAppState, sortBy }));
      },
      setReverse(reverse) {
        setAppState((prevAppState) => ({ ...prevAppState, reverse }));
      },
      setSelectedWeapons(selectedWeapons) {
        setAppState((prevAppState) => ({ ...prevAppState, selectedWeapons }));
      },
    }),
    [],
  );

  return useMemo(() => ({ ...appState, ...changeHandlers }), [appState, changeHandlers]);
}
