import { useEffect, useState } from "react";
import { Weapon } from "../calculator/calculator";

export default function useWeapons() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [weapons, setWeapons] = useState(new Map<string, Weapon>());

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/weaponData.json`)
      .then((response) => response.json())
      .then((weaponData: Weapon[]) => {
        setWeapons(new Map(weaponData.map((weapon) => [weapon.name, weapon])));
        setLoading(false);
      })
      .catch(setError);
  }, []);

  return { weapons, loading, error };
}
