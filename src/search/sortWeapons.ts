import { getDamageTypeAttackPower, getTotalAttackPower } from "../app/uiUtils";
import { WeaponTableRow } from "../app/WeaponTable";
import { Attribute, DamageType, PassiveType } from "../calculator/utils";

export type SortBy =
  | { type: "name" }
  | { type: "totalAttack" }
  | { type: "attack"; damageType: DamageType }
  | { type: "passive"; passiveType: PassiveType }
  | { type: "scaling"; attribute: Attribute }
  | { type: "requirement"; attribute: Attribute };

/**
 * Sort and paginate a filtered list of weapons for display in the weapon table
 */
export function sortWeapons(
  rows: readonly WeaponTableRow[],
  sortBy: SortBy,
): readonly WeaponTableRow[] {
  const getSortValue = ((): ((row: WeaponTableRow) => any) => {
    switch (sortBy.type) {
      case "name":
        return ([weapon]) => `${weapon.metadata.weaponName},${weapon.metadata.affinity}`;
      case "totalAttack":
        return ([, { attackRating }]) => getTotalAttackPower(attackRating);
      case "attack":
        return ([, { attackRating }]) => getDamageTypeAttackPower(attackRating, sortBy.damageType);
      case "passive":
        return ([, { passiveBuildup }]) => passiveBuildup[sortBy.passiveType] ?? 0;
      case "scaling":
        return ([weapon]) => weapon.attributeScaling[sortBy.attribute] ?? 0;
      case "requirement":
        return ([weapon]) => weapon.requirements[sortBy.attribute] ?? 0;
    }
  })();

  return [...rows].sort((row1, row2) => getSortValue(row1) - getSortValue(row2));
}
