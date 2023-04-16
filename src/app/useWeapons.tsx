import { useEffect, useState } from "react";
import { Weapon } from "../calculator/calculator";
import { decodeRegulationData } from "../regulationData";

export default function useWeapons() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [weapons, setWeapons] = useState<Weapon[]>([]);

  useEffect(() => {
    fetch("/regulation-1.09.js")
      .then((response) => response.json())
      .then((data) => {
        setWeapons(decodeRegulationData(data));
        setLoading(false);
      })
      .catch(setError);
  }, []);

  return { weapons, loading, error };
}
