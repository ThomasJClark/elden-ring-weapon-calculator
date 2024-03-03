import type { ReactNode } from "react";
import { Link } from "@mui/material";
import {
  affinityOptions,
  reforgedAffinityOptions,
  convergenceAffinityOptions,
  maxSpecialUpgradeLevel,
  type AffinityOption,
} from "./uiUtils";

export type RegulationVersionName = "latest" | "reforged" | "convergence";

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

  fetch(): Promise<Response>;
}

const regulationVersions: Record<RegulationVersionName, RegulationVersion> = {
  latest: {
    name: "Patch 1.10 (latest)",
    affinityOptions,
    fetch: () => fetch(`/regulation-vanilla-v1.09.js?${import.meta.env.VITE_DATA_FORMAT}`),
  },
  reforged: {
    name: "Elden Ring Reforged (mod)",
    info: (
      <>
        Using regulation data from the{" "}
        <Link
          href="https://www.nexusmods.com/eldenring/mods/541"
          target="_blank"
          rel="noopener noreferer"
        >
          Elden Ring Reforged
        </Link>{" "}
        mod v0.11.96A
      </>
    ),
    affinityOptions: reforgedAffinityOptions,
    disableTwoHandingAttackPowerBonus: true,
    ineffectiveAttributePenalty: 0.5,
    fetch: () => fetch(`/regulation-reforged-v0.11.96A.js?${import.meta.env.VITE_DATA_FORMAT}`),
  },
  convergence: {
    name: "The Convergence (mod)",
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
        v1.4
      </>
    ),
    affinityOptions: convergenceAffinityOptions,
    maxUpgradeLevel: maxSpecialUpgradeLevel,
    splitSpellScaling: true,
    fetch: () => fetch(`/regulation-convergence-v1.4.js?${import.meta.env.VITE_DATA_FORMAT}`),
  },
};

export default regulationVersions;
