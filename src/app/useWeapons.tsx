import { useEffect, useMemo, useState } from "react";
import { decodeWeapons, EncodedWeapon } from "../weaponCodec";

export default function useWeapons(upgradeLevel: number) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [encodedWeapons, setEncodedWeapons] = useState<[string[], EncodedWeapon[]]>([[], []]);

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/weaponData-8.js`)
      .then((response) => response.json())
      .then((weaponData) => {
        setEncodedWeapons(weaponData);
        setLoading(false);
      })
      .catch(setError);
  }, []);

  const weapons = useMemo(
    () => decodeWeapons(encodedWeapons, upgradeLevel),
    [encodedWeapons, upgradeLevel],
  );

  return { weapons, loading, error };
}
