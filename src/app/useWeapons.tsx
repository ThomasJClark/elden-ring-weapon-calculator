import { useEffect, useState } from "react";
import { Weapon } from "../calculator/calculator";
import { decodeWeapons, EncodedWeapon } from "../weaponCodec";

export default function useWeapons() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [weapons, setWeapons] = useState<readonly Weapon[]>([]);

  console.log(weapons.slice(0, 100));

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/weaponData-8.js`)
      .then((response) => response.json() as Promise<[string[], EncodedWeapon[]]>)
      .then((weaponData) => {
        setWeapons(decodeWeapons(weaponData));
        setLoading(false);
      })
      .catch(setError);
  }, []);

  return { weapons, loading, error };
}
