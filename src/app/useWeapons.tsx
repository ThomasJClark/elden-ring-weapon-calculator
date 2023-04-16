import { Link } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { Weapon } from "../calculator/calculator";
import { decodeRegulationData } from "../regulationData";
import { AffinityOption, affinityOptions, reforgedAffinityOptions } from "./uiUtils";

export type RegulationVersionName = "latest" | "reforged";

export interface RegulationVersion {
  name: string;

  info?: ReactNode;

  affinityOptions: Map<number, AffinityOption>;

  /**
   * Hack: in Elden Ring Reforged there is no attack power bonus for two handing
   */
  disableTwoHandingAttackPowerBonus?: boolean;

  fetch(): Promise<Response>;
}

export const regulationVersions: Record<RegulationVersionName, RegulationVersion> = {
  latest: {
    name: "Patch 1.09.1 (latest)",
    affinityOptions,
    fetch: () => fetch("/regulation-v1.09.js"),
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
        mod v0.6.5B.
      </>
    ),
    affinityOptions: reforgedAffinityOptions,
    disableTwoHandingAttackPowerBonus: true,
    fetch: () => fetch("/regulation-reforged.js"),
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
