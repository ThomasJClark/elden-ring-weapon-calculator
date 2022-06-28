import { useEffect, useState } from "react";
import { Weapon } from "../calculator/calculator";

export default function useWeapons() {
  const [weapons, setWeapons] = useState(new Map<string, Weapon>());

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/weaponData.json`)
      .then((data) => data.json())
      .then((weaponData: Weapon[]) => {
        setWeapons(new Map(weaponData.map((weapon) => [weapon.name, weapon])));
      });
  }, []);

  return weapons;
}
