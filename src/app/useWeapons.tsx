import { Link } from "@mui/material";
import { type ReactNode, useEffect, useState } from "react";
import type { Weapon } from "../calculator/calculator";
import { decodeRegulationData } from "../regulationData";
import {
  type AffinityOption,
  affinityOptions,
  reforgedAffinityOptions,
  convergenceAffinityOptions,
  maxSpecialUpgradeLevel,
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

  fetch(): Promise<Response>;
}

export const regulationVersions: Record<RegulationVersionName, RegulationVersion> = {
  latest: {
    name: "Patch 1.09.1 (latest)",
    affinityOptions,
    fetch: () => fetch(`/regulation-v1.09.js?${import.meta.env.VITE_DATA_FORMAT}`),
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
        mod v0.6.7
      </>
    ),
    affinityOptions: reforgedAffinityOptions,
    disableTwoHandingAttackPowerBonus: true,
    fetch: () => fetch(`/regulation-reforged.js?${import.meta.env.VITE_DATA_FORMAT}`),
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
        public alpha
      </>
    ),
    affinityOptions: convergenceAffinityOptions,
    maxUpgradeLevel: maxSpecialUpgradeLevel,
    fetch: () => fetch(`/regulation-convergence.js?${import.meta.env.VITE_DATA_FORMAT}`),
  },
};

export default function useWeapons(regulationVersionName: RegulationVersionName) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [weapons, setWeapons] = useState<Weapon[]>([]);

  useEffect(() => {
    setWeapons([]);
    setLoading(true);
    regulationVersions[regulationVersionName]
      .fetch()
      .then((res) => res.json())
      .then((data) => {
        setWeapons(decodeRegulationData(data));
        setLoading(false);
        setError(undefined);
      })
      .catch(setError);
  }, [regulationVersionName]);

  return { weapons, loading, error };
}
