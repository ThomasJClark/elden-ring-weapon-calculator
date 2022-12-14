import { useEffect, useState } from "react";
import { Weapon } from "../calculator/calculator";
import { decodeWeapon, EncodedWeapon } from "../weaponCodec";

export default function useWeapons() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [weapons, setWeapons] = useState<readonly Weapon[]>([]);

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/weaponData-5.js`)
      .then((response) => response.json())
      .then((weaponData: EncodedWeapon[]) => {
        setWeapons(weaponData.map(decodeWeapon));
        setLoading(false);
      })
      .catch(setError);
  }, []);

  return { weapons, loading, error };
}
