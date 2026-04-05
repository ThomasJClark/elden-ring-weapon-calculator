import type { ReactNode } from "react";
import { Link } from "@mui/material";
import {
  affinityOptions,
  reforgedAffinityOptions,
  convergenceAffinityOptions,
  getEnemyTypeLabel,
  getReforgedEnemyTypeLabel,
  type AffinityOption,
} from "./uiUtils.ts";
import { WeakRateType } from "../calculator/weakRates.ts";

export type RegulationVersionName = "latest" | "reforged" | "convergence" | "clevers";

export interface RegulationVersion {
  name: string;

  info?: ReactNode;

  affinityOptions: Map<number, AffinityOption>;

  getEnemyTypeLabel: (type: WeakRateType) => string;

  /**
   * Hack: in Elden Ring Reforged there is no attack power bonus for two handing
   */
  disableTwoHandingAttackPowerBonus?: boolean;

  /**
   * The Convergence mod makes all weapons only go up to +10
   */
  maxUpgradeLevel?: number;

  /**
   * The Convergence mod has separate spell scaling for each damage type
   */
  splitSpellScaling?: boolean;

  /**
   * Elden Ring Reforged changes the penalty for not having the required attributes for a weapon
   */
  ineffectiveAttributePenalty?: number;

  /**
   * Don't filter based on weapon type. Used for mods with a small number of weapons and 0 weapons
   * in some categories.
   */
  disableWeaponTypeFilter?: boolean;

  /**
   * Additional CalcCorrectGraph to use for status buildup Arcane scaling (Reforged)
   */
  statusAdditionalCalcCorrectGraphId?: number;

  fetch(): Promise<Response>;
}

const regulationVersions: Record<RegulationVersionName, RegulationVersion> = {
  latest: {
    name: "Patch 1.16.1 (latest)",
    affinityOptions,
    getEnemyTypeLabel,
    fetch: () => fetch(`/regulation-vanilla-v1.16.1.js?${import.meta.env.VITE_DATA_FORMAT}`),
  },
  reforged: {
    name: "ELDEN RING Reforged",
    info: (
      <>
        Using regulation data from the{" "}
        <Link
          href="https://www.nexusmods.com/eldenring/mods/541"
          target="_blank"
          rel="noopener noreferer"
        >
          ELDEN RING Reforged
        </Link>{" "}
        mod v2.2.3.4
      </>
    ),
    affinityOptions: reforgedAffinityOptions,
    getEnemyTypeLabel : getReforgedEnemyTypeLabel,
    disableTwoHandingAttackPowerBonus: true,
    ineffectiveAttributePenalty: 0.5,
    statusAdditionalCalcCorrectGraphId: 1007,
    fetch: () => fetch(`/regulation-reforged-v2.2.3.4.js?${import.meta.env.VITE_DATA_FORMAT}`),
  },
  convergence: {
    name: "The Convergence Mod",
    info: (
      <>
        Using regulation data from{" "}
        <Link
          href="https://www.nexusmods.com/eldenring/mods/3419"
          target="_blank"
          rel="noopener noreferer"
        >
          The Convergence Mod
        </Link>{" "}
        v2.2.3A
      </>
    ),
    affinityOptions: convergenceAffinityOptions,
    getEnemyTypeLabel,
    maxUpgradeLevel: 15,
    splitSpellScaling: true,
    fetch: () => fetch(`/regulation-convergence-v2.2.3A.js?${import.meta.env.VITE_DATA_FORMAT}`),
  },
  clevers: {
    name: "Clever's Moveset Modpack",
    info: (
      <>
        Using regulation data from{" "}
        <Link
          href="https://www.nexusmods.com/eldenring/mods/1928"
          target="_blank"
          rel="noopener noreferer"
        >
          Clever&apos;s Moveset Modpack
        </Link>{" "}
        v25.0
      </>
    ),
    affinityOptions,
    getEnemyTypeLabel,
    disableWeaponTypeFilter: true,
    fetch: () => fetch(`/regulation-clevers-v25.0.js?${import.meta.env.VITE_DATA_FORMAT}`),
  },
};

export default regulationVersions;
