import type { ReactNode } from "react";
import { Link } from "@mui/material";
import {
  affinityOptions,
  reforgedAffinityOptions,
  convergenceAffinityOptions,
  type AffinityOption,
} from "./uiUtils.ts";

export type RegulationVersionName = "latest" | "reforged" | "convergence" | "clevers";

export interface RegulationVersion {
  name: string;

  info?: ReactNode;

  affinityOptions: Map<number, AffinityOption>;

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

  fetch(): Promise<Response>;
}

const regulationVersions: Record<RegulationVersionName, RegulationVersion> = {
  latest: {
    name: "Patch 1.16 (latest)",
    affinityOptions,
    fetch: () => fetch(`/regulation-vanilla-v1.14.js?${import.meta.env.VITE_DATA_FORMAT}`),
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
        mod v1.4.8G
      </>
    ),
    affinityOptions: reforgedAffinityOptions,
    disableTwoHandingAttackPowerBonus: true,
    ineffectiveAttributePenalty: 0.5,
    fetch: () => fetch(`/regulation-reforged-v1.4.8G.js?${import.meta.env.VITE_DATA_FORMAT}`),
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
        v2.2.3
      </>
    ),
    affinityOptions: convergenceAffinityOptions,
    maxUpgradeLevel: 15,
    splitSpellScaling: true,
    fetch: () => fetch(`/regulation-convergence-v2.2.3.js?${import.meta.env.VITE_DATA_FORMAT}`),
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
    disableWeaponTypeFilter: true,
    fetch: () => fetch(`/regulation-clevers-v25.0.js?${import.meta.env.VITE_DATA_FORMAT}`),
  },
};

export default regulationVersions;
