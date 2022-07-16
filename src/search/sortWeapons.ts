import { getDamageTypeAttackPower, getTotalAttackPower } from "../app/uiUtils";
import { WeaponTableRowData } from "../app/weaponTable/WeaponTable";
import { allAffinities, Attribute, DamageType, StatusType } from "../calculator/utils";

export type SortBy =
  | "name"
  | "totalAttack"
  | `${DamageType}Attack`
  | `${StatusType}Buildup`
  | `${Attribute}Scaling`
  | `${Attribute}Requirement`;

/**
 * Sort and paginate a filtered list of weapons for display in the weapon table
 */
export function sortWeapons(
  rows: readonly WeaponTableRowData[],
  sortBy: SortBy,
): readonly WeaponTableRowData[] {
  const getSortValue = ((): ((row: WeaponTableRowData) => any) => {
    if (sortBy === "name") {
      return ([weapon]) =>
        `${weapon.metadata.weaponName},${allAffinities
          .indexOf(weapon.metadata.affinity)
          .toString()
          .padStart(2, "0")}`;
    }

    if (sortBy === "totalAttack") {
      return ([, { attackRating }]) => -getTotalAttackPower(attackRating);
    }

    if (sortBy.endsWith("Attack")) {
      const damageType = sortBy.slice(0, -1 * "Attack".length) as DamageType;
      return ([, { attackRating }]) => -getDamageTypeAttackPower(attackRating, damageType);
    }

    if (sortBy.endsWith("Buildup")) {
      const statusType = sortBy.slice(0, -1 * "Buildup".length) as StatusType;
      return ([, { statusBuildup }]) => -(statusBuildup[statusType] ?? 0);
    }

    if (sortBy.endsWith("Scaling")) {
      const attribute = sortBy.slice(0, -1 * "Scaling".length) as Attribute;
      return ([weapon]) => -(weapon.attributeScaling[attribute] ?? 0);
    }

    if (sortBy.endsWith("Requirement")) {
      const attribute = sortBy.slice(0, -1 * "Requirement".length) as Attribute;
      return ([weapon]) => -(weapon.requirements[attribute] ?? 0);
    }

    return () => {};
  })();

  return [...rows].sort((row1, row2) => (getSortValue(row1) > getSortValue(row2) ? 1 : -1));
}
